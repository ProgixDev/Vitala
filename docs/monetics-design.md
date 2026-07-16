# Vitala Monetics — Escrow & Payouts Design Plan

How money moves when **Vitala holds the funds** and stands between patient and nurse.
Design only — no code.

**Goal, stated as outcomes rather than mechanics:** a nurse is never dispatched for money
that isn't secured; a patient's money isn't taken before they're served; Vitala can refund
until the moment it pays out; and the nurse gets paid automatically without anyone doing
bank transfers by hand.

---

## 0. The five invariants

Everything below is derived from these. If a change breaks one of them, it's wrong.

1. **A job is visible to nurses only when money is secured.** (A live authorisation hold.)
2. **Money leaves the patient only when the service is delivered.** (Capture at completion.)
3. **Money reaches the nurse only after the protection window closes with no open report.**
4. **Every Stripe mutation is idempotent and replay-safe.** Retries must never double-charge
   or double-pay.
5. **The booking horizon must stay shorter than the authorisation lifetime.** (§4 — this one
   is currently true by accident, and that's a bug waiting to happen.)

---

## 1. Where we are today (grounded in the code)

The hard half already exists and is well built.

- **Manual capture is already the model.** `createIntent()` holds the card
  (`capture_method: 'manual'`); `captureForAppointment()` takes the money **at completion**;
  `releaseForAppointment()` voids the hold on cancel. **This is correct and stays.**
- **`settle()`** writes terminal state from both the capture response *and* the webhook,
  guarded by `.neq('status', status)` so the patient is notified once.
- **Amount never trusted from the client** — derived from `appointments.price`.
- **Stripe API version pinned** (`2026-06-24.dahlia`), with a comment explaining why.
- `CURRENCY = 'CAD'` presentment; the account **settles in EUR and converts** (§9.2).
- **Enums**: `payment_status = pending | processing | completed | failed | cancelled |
  refunded`; `appointment_status = pending | confirmed | on-the-way | in-progress |
  completed | cancelled | declined`.

### What's missing / weak

1. **No Connect.** No concept of a payable nurse. Money arrives and stops.
2. **Invariant 1 is violated today.** `appointments.service.ts:169` inserts as `pending` and
   calls `announce()` **immediately**, pushing every on-duty nurse — *before* the client
   sends the patient to `/pay/{id}`. `assignSelf()` never checks payment.
   **This is live, not theoretical:** one `in-progress` and one `completed` visit currently
   have **no payment row at all**. A nurse worked for nothing. The comment at
   `booking/[id].tsx:121` describes an intent nothing enforces.
3. **Invariant 5 holds only by accident** (§4).
4. **No protection window.** `completed` is immediately final.
5. **No idempotency keys** on Stripe creates.
6. **No webhook event dedupe.** The `neq` guard covers `settle()` only.
7. **No reconciliation.** Nothing compares Stripe's truth to ours.

### The thing already working in our favour

Both RLS policies gate on `status = 'pending'`:

```sql
appt_open_pool_read  -- for select using (nurse_id is null and status = 'pending' and ...)
appt_open_pool_claim -- for update using (nurse_id is null and status = 'pending' and ...)
```

So **any status that isn't `pending` is invisible and unclaimable at the database level.**
Invariant 1 can therefore be enforced by the database itself, with *zero* policy changes,
and it holds even if application code is later wrong.

---

## 2. Why _separate charges and transfers_

| Connect model | Who holds the money | Fits a protection window? |
|---|---|---|
| **Direct charges** | The **nurse's** account; platform takes a fee | ❌ Vitala never holds it |
| **Destination charges** | Auto-routed to the nurse **at capture** | ❌ No window |
| **Separate charges and transfers** | **Vitala's** balance; `Transfer` is a separate call | ✅ **This one** |

The payout becomes an explicit action on our schedule — which is what "hold it, then release"
means. It's also the only model where withholding after a report is natural.

Consequence: `application_fee_amount` is a direct/destination-charge concept. With separate
transfers there is no application fee — you **transfer less than you charged**, and the
commission is what stays in the Vitala balance.

---

## 3. Nurse onboarding — Connect Express

**Vitala must never collect bank details directly.** Doing so pulls KYC/AML, identity
verification and tax reporting onto you, and Stripe won't pay out to accounts onboarded that
way.

Use **Connect Express**: create an account, generate an **Account Link**, the nurse completes
a **Stripe-hosted** form. Stripe collects the bank account, verifies identity, handles tax
forms, owns the compliance. Vitala stores only a `stripe_account_id`. Strictly less work
*and* less liability.

- **Gate**: no payout until `payouts_enabled = true`. Nurses may still *accept* jobs before
  onboarding (blocking accept starves supply early on) — payout queues as `blocked` and a
  nudge chases them. See §11.3.
- **Webhook `account.updated`** → sync `charges_enabled`, `payouts_enabled`, `requirements`.
  Stripe re-requests information over time; onboarding goes stale silently.
- Express accounts get a Stripe-hosted payout dashboard for free.

---

## 4. Authorisation timing — the load-bearing constraint

**Stripe auto-cancels an uncaptured PaymentIntent after ~7 days.** So a hold placed at
booking is only useful if the visit happens within that week.

Measured, splitting test rows from real ones:

| | Rows | Avg lead | Max lead |
|---|---|---|---|
| Test data (`DURTEST`, `DIAG`, `PAYTEST`…) | 20 | 20.6 days | 34 |
| **Real bookings** | 7 | **2.6 days** | 11 |

Real bookings cluster at ~2.6 days, and the booking UI's day strip is built with
`nextDays(7, language)` — **today plus six days, maximum**. Every bookable visit therefore
lands inside the hold window, and **authorise-at-request works with no re-authorisation
machinery at all.**

> ### The trap
> That only works because a **UI constant** (`nextDays(7)`) happens to sit just inside
> **Stripe's ~7-day hold**. Nothing connects those two numbers. The first "let patients book
> a month ahead" ticket silently breaks invariant 1 — jobs enter the pool with holds that die
> before the visit, and nurses get dispatched against dead authorisations. Nobody will
> connect that outage to a day-strip change.
>
> **Therefore: enforce the horizon server-side**, in `CreateAppointmentDto`, with a constant
> that names its own reason:
>
> ```ts
> /** Stripe voids an uncaptured authorisation after ~7 days. A visit must be
>  *  capturable while its hold is still alive, so the booking horizon is bounded
>  *  by the hold — not by product preference. Raising this REQUIRES the T-48h
>  *  re-authorisation job (§10, deferred). */
> const MAX_BOOKING_LEAD_DAYS = 6;
> ```
>
> This turns a silent, delayed failure into a validation error at the boundary — and the day
> the horizon must grow, the comment tells the next developer what they have to build first.

**If the horizon ever needs to exceed the hold**, the design is: card on file (SetupIntent) at
booking, real authorisation on a **T-48h scheduled job**, cancel + notify if it fails. That's
what hotels do. It's deferred, not designed away.

---

## 5. The money timeline

| # | Moment | Stripe action | Appointment status | Money is |
|---|---|---|---|---|
| 1 | Card added (**onboarding**) | `SetupIntent` (`usage: off_session`) | — | Nowhere; card validated, 3DS consent stored |
| 2 | Request sent | `PaymentIntent`, `capture_method: manual`, **off-session** | `awaiting_payment` → `pending` | **Held** on the patient's card |
| 3 | Nurse accepts | **nothing** | `confirmed` | Still held |
| 4 | Visit completed | `capture` | `completed`, stamp `completed_at` | **In Vitala's balance**; window opens |
| 5 | Window closes, no report | `Transfer` (`source_transaction`) | — | **In the nurse's Connect account** |
| 6 | Stripe payout | automatic | — | In the nurse's bank |

### Why the card moves to onboarding

Collecting the card at **onboarding** rather than at booking means that by booking time we
already hold a validated PaymentMethod. The server can then authorise **off-session**, and:

- **Booking becomes one tap.** The `/pay/{id}` screen disappears from the happy path.
- **The authorisation result is synchronous** — we called Stripe, we have the answer. Which
  kills the webhook dependency below.
- `awaiting_payment` stops being a UX state and becomes a transient internal one, surfacing
  only when the card needs 3DS or fails.

### Why nothing happens when a nurse accepts

Tempting to "take the money when the nurse commits" — but **the hold already guarantees the
funds.** Capturing at accept would mean taking money days before the service, burning the
non-refundable Stripe fee on every later cancellation, and doing a two-phase commit across
Stripe and Postgres at the worst possible moment (a nurse racing to claim a job). Capture at
**delivery** is what Uber and Airbnb do, it's what the existing code already does, and it
keeps the escrow fully intact — Vitala still holds the funds from capture until payout.

### The flip to `pending` must not depend on a webhook

If `awaiting_payment → pending` fired only on `payment_intent.amount_capturable_updated`,
then a misconfigured or exhausted webhook would mean **no request ever reaches any nurse** —
the marketplace halts, silently. That's worse than the bug being fixed. Your own code already
warns about exactly this (`payments.service.ts:129`: *"the webhook is the safety net, not the
only path"*).

Three independent paths, all idempotent, all converging on the same guarded transition:

1. **Primary — synchronous.** The off-session authorisation returns `requires_capture` in the
   booking request itself. Flip and announce inline. No webhook involved.
2. **Backstop — webhook.** `amount_capturable_updated` for the 3DS/asynchronous path.
3. **Sweep — reconciliation.** Any `awaiting_payment` whose PI is already `requires_capture`
   gets flipped. Catches everything the first two miss.

The guard (`update ... where status = 'awaiting_payment'`) makes running all three harmless.

---

## 6. Cancellation & refund matrix

| When | Stripe call | Patient charged? | Vitala's cost |
|---|---|---|---|
| Before capture (unclaimed, or cancelled pre-visit) | `paymentIntents.cancel` | No — hold released | **Nothing** |
| After capture, before transfer | `refunds.create` | Refunded in full | **The processing fee** |
| After transfer | `refunds.create` + **`transferReversals.create`** | Refunded | Fee **+ clawback risk** |

Capture-at-completion keeps **almost every cancellation in row one, where it's free.** This is
the single biggest financial argument for the timing in §5.

**Important:** with separate charges and transfers, refunding a charge does **not** reverse
the transfer — they're independent objects. (`reverse_transfer: true` is a destination-charge
feature and doesn't apply.) Miss this and you refund the patient while the nurse keeps the
money.

---

## 7. State machine

The bugs in this domain come from this machine being implicit. It should be explicit and
tested.

```
appointment_status
  awaiting_payment ──auth ok──► pending ──claim──► confirmed ──► on-the-way
        │                          │                   │              │
        │ auth failed              │ 7d unclaimed      │              ▼
        │ patient fixes card       │ or cancelled      │         in-progress
        │                          ▼                   ▼              │
        └──────────────────────► cancelled ◄────── declined           ▼
                                                                  completed
                                                                      │
payment_status                                                        │
  pending ──auth──► authorized ──capture──► completed ────────────────┤
      │                  │                       │                    │
      │                  ▼                       ▼                    │
      └──► failed    cancelled (hold void)   refunded                 │
                                                                      ▼
payout_status                                        (T+window, no open report)
  — ──► scheduled ──► paid
          │  └──► blocked (nurse not onboarded) ──► retried on account.updated
          └──► failed ──► retried    ──► reversed (post-payout refund)
```

Rules worth stating outright:
- `pending` requires `payment_status = authorized`. **This is invariant 1**, and RLS enforces
  the nurse-facing half of it for free.
- `completed` triggers capture. Capture failure must **not** block completion — the existing
  code already gets this right (`captureForAppointment` is a no-op on error, logged). A visit
  must never fail to complete because of a payment edge case.
- Only `completed` + window elapsed + no open report creates a payout.

---

## 8. Data model changes (Supabase)

**`nurse_profiles` — add:** `stripe_account_id text`, `charges_enabled boolean default false`,
`payouts_enabled boolean default false`, `onboarding_completed_at timestamptz`,
`payout_requirements jsonb` (mirrors Stripe's `requirements`; drives the nudge UI).

**`profiles` — add:** `stripe_customer_id text`, `default_payment_method text`.

**`payments` — add:** `authorized_at timestamptz`, `captured_at timestamptz`,
`commission_amount numeric` (transfer = `amount - commission_amount`).
`payment_status` gains **`authorized`** — today's `processing` conflates "hold placed" with
"capture in flight", which won't survive a payout path.

**New `payouts`:**
| column | type | notes |
|---|---|---|
| `id` | uuid pk | |
| `appointment_id` | uuid fk **unique** | one payout per visit — the durable double-pay guard (§9.1) |
| `nurse_id` | uuid fk | |
| `amount` | numeric | net of commission |
| `commission` | numeric | **snapshot at release**, never recomputed — history must stay explainable after a rate change |
| `stripe_transfer_id` | text | |
| `status` | text | `scheduled → paid \| blocked \| failed \| reversed` |
| `release_after` | timestamptz | `completed_at + window` |
| `released_at` | timestamptz | |
| `blocked_reason` | text null | |

**New `reports`** (blocks a payout):
`id, appointment_id, patient_id, reason, status (open | resolved | refunded), created_at, resolved_at, resolved_by`

**New `stripe_events`** (webhook idempotency): `event_id text primary key, type text, received_at timestamptz`.
Insert-first with `on conflict do nothing`; a conflict means already processed — ack and stop.

**RLS**: nurses read their own `payouts`; patients read their own `reports`; both
service-role write only — mirrors the existing `payments_owner_read` / admin-write pattern.

> **Migration note:** `ALTER TYPE ... ADD VALUE` cannot be *used* in the transaction that adds
> it. Adding `awaiting_payment` / `authorized` and using them must be **separate migrations**.
> Given the numbering collision that already silently skipped `0009_nurse_radius_optional`,
> use clean sequential numbers and verify each lands in `supabase_migrations.schema_migrations`.

---

## 9. Reliability — what actually breaks

### 9.1 Idempotency (and its limits)
Every `PaymentIntent`, `Transfer` and `Refund` create needs a key derived from
`appointment_id` (`auth_{id}`, `payout_{id}`, `refund_{id}`).

**But Stripe only honours idempotency keys for 24h.** A payout retried after a day would
create a *second* transfer — real money, gone. The key protects the short window; the
**`unique(appointment_id)` constraint on `payouts` is the durable guard.** Both, deliberately:
they cover different timescales.

### 9.2 Transfers fail on pending funds — use `source_transaction`
Captured money is `pending` in the balance for ~2 business days (longer for a new account)
before it's `available`. A naive `Transfer` fails with `balance_insufficient`. **Nearly
everyone hits this in production.**

`source_transaction: <charge_id>` ties the transfer to a specific charge; Stripe then permits
it and releases when that charge settles. A ~3-day window and T+2 settlement roughly line up
— but **rely on `source_transaction`, not on the timing coincidence.**

### 9.3 Webhook dedupe, ordering, and the API-version trap

> **Live drift (2026-07) — measured harmless, deliberately deferred.** The endpoint is
> `2026-05-27.dahlia`; the SDK is `2026-06-24.dahlia`.
>
> This cannot be fixed in code. The SDK's `apiVersion` option only sets `Stripe-Version` on
> *outgoing requests*; incoming payloads are built with the **endpoint's** `api_version`, and
> `constructEvent()` checks the signature, not the version. Lowering the SDK pin is also
> impossible — its types hard-pin the literal — and would merely invert the mismatch. An
> endpoint's `api_version` is **immutable** (confirmed in the dashboard: the field is
> read-only), so the only fix is recreating the endpoint, which mints a **new signing
> secret** requiring a simultaneous `.env` + Vercel update on a live payment path.
>
> **Verified against real payloads** rather than assumed: every field `handleWebhook()` reads
> — `id`, `status`, `latest_charge` — is present on live `2026-05-27.dahlia` events for
> `amount_capturable_updated`, `succeeded` and `canceled`. Nothing is missing, so the drift
> costs nothing today. (`charge.refunded` / `charge.dispute.created` had no recent samples;
> they read only `amount_refunded` and `payment_intent`.)
>
> **Fix it when the Canadian account is created** (§10.2) — that needs a fresh endpoint
> anyway, so the correct version comes free with no rotation risk. Re-check this if the
> handler starts reading newer or less-established fields.
>
> Why it went unnoticed: the endpoint URL was `https://vitala-tau.vercel.app/` (bare root)
> instead of `/api/payments/webhook`, so `handleWebhook` had **never run once** in
> production. Every event since launch sat undelivered (`pending_webhooks=1`). Both were
> fixed 2026-07-16; the version drift is what's left.

Stripe **retries any non-2xx** and does **not guarantee order**. The existing code already
defends against `succeeded` arriving before `amount_capturable_updated` — generalise that
instinct with `stripe_events` (§8). Under manual capture, `succeeded` fires at **capture**,
not when the patient finishes the sheet; the authorisation is `amount_capturable_updated`.
The current code documents this correctly.

New events: `account.updated`, `transfer.created` / `transfer.reversed`,
`charge.dispute.created`, `payout.failed`.

### 9.4 Reconciliation — the job that finds the bug you didn't predict
Nightly, compare Stripe ↔ DB: `awaiting_payment` whose PI is `requires_capture` (§5.3);
authorisations older than 6 days (§4); payments stuck `processing`; completed visits with no
payout past `release_after + 1d`; `payouts` rows `scheduled` with no `stripe_transfer_id`;
transfers in Stripe with no local row.

**The `in-progress` visit with no payment row (§1) is exactly what this would have caught** —
it sat there until we went looking.

### 9.5 Test-mode coverage
`4000000000000259` (dispute after capture), `4000000000009995` (insufficient funds at auth),
`4000002500003155` (3DS required — the off-session path in §5), `4000000000000341` (attaches
but fails on charge). The dispute path is the one everyone skips and then meets in production.

---

## 10. Risk & liability

### 10.1 Chargebacks after payout
A dispute can arrive **months** later, after the nurse's money is in their bank. Vitala is
liable — Stripe pulls from *your* balance plus a fee. `transferReversals` claws back from the
nurse's Connect balance; if they've withdrawn, it goes **negative** and in practice you eat it.

Mitigations by usefulness: the protection window (kills the easy cases); a rolling reserve;
per-nurse exposure caps; and above all **evidence** (completion timestamps, nurse GPS trail,
notes, patient confirmation) so you can actually *win* disputes.

### 10.2 Account country — decided: **CAD platform in production**
**Resolved.** Production will be a **Canadian** Stripe account paying Canadian nurses in CAD.
This is the domestic case: no cross-border payout restrictions, no FX on the payout leg,
`source_transaction` behaves normally. **Phase 4 is unblocked.**

The current sandbox is **European** — which is a trap, because it can't validate what ships:

- **SCA/3DS**: EU-issued cards mandate Strong Customer Authentication; Canadian ones don't.
  The EU sandbox makes the off-session authorisation (§5) look *harder* than production —
  constant `authentication_required`. Tune against EU and the 3DS fallback becomes
  rarely-exercised code that rots; tune against CAD without testing 3DS and it breaks the
  first time an EEA-issued card appears.
- **Connect onboarding requirements are country-specific.** The fields Stripe asks a Canadian
  nurse for are not the ones it asks a French one. Onboarding UI built against an EU sandbox
  is testing the wrong form.
- **Payout timing / available-balance behaviour** differ by country — exactly what §9.2 turns on.

> **Create the Canadian test account before Phase 4** and build all Connect work against it.
> Test accounts are free. Phases 1–3 are country-agnostic and safe on the current sandbox.

**A Stripe account's country cannot be changed.** Going CAD in production means a *fresh
account*: new API keys, new webhook endpoints, new Connect accounts, and every
`stripe_customer_id` / `stripe_payment_intent_id` in the database becomes meaningless. Nothing
carries over. Painless today at 7 real bookings; painful once patients have saved cards —
an argument for switching sooner.

When the CAD account lands, delete the "settles in EUR and converts" comment in
`payments.service.ts` — CAD in, CAD out, no conversion.

### 10.3 Money transmission / regulatory (Canada, Quebec)
Holding funds and paying third parties is regulated. Connect with Vitala as merchant of record
is the standard structure and usually keeps a marketplace clear of money-transmitter
licensing — but "usually" is not advice. **Have a Canadian lawyer look at this before launch**,
especially in Quebec. Nurses are likely contractors → T4A/tax-reporting obligations Stripe can
help with but does not decide for you.

### 10.4 Who completes, and both scam directions

**The nurse completes.** `assertActorAllowed` (line 461) lets only the assigned nurse set
`confirmed | on-the-way | in-progress | completed`. The patient's only lever is `cancelled`.

**This is correct and must stay.** Moving completion to the patient looks fairer and isn't:
requiring positive consumer confirmation means an unresponsive patient blocks a nurse's wages
forever. Uber's driver ends the trip; DoorDash's courier marks delivered. Provider-completes
+ a consumer dispute window is the industry shape, and it's what already exists here.

**Nurse-side fraud** — mark `completed` without doing the visit → capture → auto-paid at the
window. The report window is the *only* check, which is why the "you have N days to report"
notification is **fraud control, not a nicety**. A patient who ignores notifications auto-pays.
Strengthen with evidence that already exists: the nurse's live GPS trail
(`updateNurseLocation`, `nurse_lat/nurse_lng`) can prove proximity at completion, and a patient
"confirm visit" action can **release the payout early** — a positive signal that pays good
nurses faster instead of making everyone wait out a timeout.

**Patient-side fraud — live hole today.** `TRANSITIONS['in-progress'] = ['completed',
'cancelled']` and `assertActorAllowed` permits `cancelled` by the patient from *any*
non-terminal state. So a patient can cancel **mid-visit**: `releaseForAppointment()` voids the
uncaptured hold (capture is at completion), and the nurse — who has already delivered the full
service — **gets nothing, and the patient pays nothing.** One tap, free care.

### 10.4a Cancellation policy — the missing piece

The fee must track the nurse's actual cost:

| Patient cancels at | Nurse's cost | Action |
|---|---|---|
| `pending` (unclaimed) | none | Free — void the hold |
| `confirmed` (assigned, not moving) | ~none | Free, or small fee after a grace period |
| `on-the-way` (**travelling**) | real | **Partial capture** — take the travel fee, release the rest |
| `in-progress` (**being treated**) | full | **Not cancellable** — file a report instead |

**Stripe's `capture` accepts `amount_to_capture` lower than the authorised amount and releases
the remainder automatically.** So the cancellation fee is a single call on the hold that
already exists — no second charge, no card interaction, no refund fee. The design in §5 makes
this nearly free to build.

`in-progress` leaves the patient's cancel list entirely. Once treatment has started the visit
either completes or the **nurse** aborts it (legitimately: patient not home, unsafe situation
— which is why the nurse keeps that transition). A patient unhappy with the service files a
**report**, which blocks the payout and routes to admin. That is what the dispute window is
for; `cancel` is the wrong instrument and currently doubles as a theft button.

### 10.4b Arrival attestation — corroborate `in-progress`, don't gate on it

`in-progress` already *means* "the nurse arrived and started work", but it is **nurse-asserted
with zero corroboration**. A patient tap confirming arrival turns it into a **two-sided
handshake**: where both parties agree, no dispute is possible. That collapses dispute volume
and produces exactly the evidence §10.1 needs to win chargebacks.

> **It must not be the gate.** If the patient's tap is what locks the charge, a scammer simply
> never taps: nurse arrives, works, patient doesn't confirm, patient cancels — the same theft,
> one step earlier. **Never let one party's protection depend on the counterparty's voluntary
> action.** For the same reason it must not be a *status*: a patient who never taps would stall
> the state machine, reviving the unresponsive-consumer-blocks-payout problem from §10.4.

**Attestation, not transition.** The lock engages at `in-progress`, nurse-driven, whatever the
patient does. The patient's tap is additive and cuts both ways:

| Patient action at `in-progress` | Effect |
|---|---|
| *"Yes, my nurse is here"* | Stamp `arrival_confirmed_at`. Two-sided handshake → dispute-resistant, and **releases the payout early** instead of waiting out the window |
| *"No, nobody came"* | Files a **report** at the moment it matters, with the nurse's GPS trail right there to adjudicate. The case most worth catching |
| Nothing | Nurse's `in-progress` + GPS + timestamps carry it. **Nobody is blocked** |

Honest patients get a fast confirmation and their nurse is paid sooner; the scammer's inaction
changes nothing.

**The mirror guard — the nurse's side.** A nurse can set `in-progress` from their sofa. The fix
already exists unused: check `updateNurseLocation` proximity against the appointment's
coordinates when `in-progress` is set; too far → refuse or flag.

> **This depends on `appointments.latitude/longitude` being populated**, and today they often
> aren't (e.g. `78a080c1` — an `on-the-way` visit with null coords). The coord-less rows aren't
> only a turn-by-turn annoyance; they are holes in the fraud check. Geofencing at `in-progress`
> is a reason to make coordinates non-optional at booking.

### 10.5 Commission and fees
Decide explicitly: is Vitala's cut inside the displayed price or on top? Who absorbs the
Stripe fee on a cancellation? Snapshot `commission` at release (§8) so history stays
explainable.

---

## 11. Phasing

- **Phase 1 — Enforce invariant 1 + invariant 5.** `awaiting_payment`; `create()` stops
  announcing; flip to `pending` on the synchronous auth result (webhook + sweep as backstops);
  `MAX_BOOKING_LEAD_DAYS` server-side. Existing RLS enforces the nurse-facing half for free.
  **Stops nurses working for free today. Depends on nothing else here. ~1–2 days.**
- **Phase 2 — Card at onboarding.** SetupIntent + `stripe_customer_id`; booking authorises
  off-session; `/pay/{id}` becomes the 3DS/failure fallback rather than the happy path.
- **Phase 3 — Idempotency + `stripe_events` + reconciliation.** Unglamorous, cheap, and it's
  what makes the money-moving phases survivable. **Before payouts, not after.**
- **Phase 4 — Connect Express onboarding.** `stripe_account_id`, Account Links,
  `account.updated`, nurse UI + nudges. **Build against a Canadian test account** (§10.2) —
  onboarding requirements are country-specific, so the EU sandbox tests the wrong form.
- **Phase 5 — `payouts` + the release job.** The escrow proper.
- **Phase 6 — Reports/disputes** + patient confirm-visit early release (§10.4).

**Slot in early — cancellation policy (§10.4a).** Removing `cancelled` from the patient's
allowed transitions at `in-progress` is a ~3-line change to `assertActorAllowed` and closes a
live theft vector; it belongs in **Phase 1** alongside the other invariant work. The graduated
fee (partial capture at `on-the-way`) is a separate, larger piece — it needs a fee schedule
and patient-facing copy, so it fits naturally with Phase 5/6.
- **Deferred** — T-48h re-authorisation (only needed if the booking horizon grows past the
  hold, §4); instant payouts; tips; reserves; multi-nurse splits.

Phases 1–3 need **no Connect decisions and no legal answers**, and each has standalone value.

---

## 12. Open questions

1. ~~What country is the Stripe platform account registered in?~~ **Answered: CAD in
   production** (§10.2). Follow-up: *when* does the Canadian account get created? It's needed
   before Phase 4, and the migration gets more painful the longer real patients save cards.
2. **Protection window length** — 3 days for a routine visit *and* an emergency? Does patient
   confirmation release early (§10.4)?
3. **Commission** — percentage, and inside or on top of the displayed price?
4. **Who eats the Stripe fee** on a cancellation after capture? (§6)
5. **What counts as a "report"?** Any complaint, or only money-affecting? Auto-block the
   payout, or block only after admin triage? What's the resolution SLA — an unresolved report
   holds a nurse's wages.
6. **Booking horizon** — is 6 days a real product constraint or an accident? If product wants
   30 days, the T-48h job (§4) moves from deferred to Phase 1.
7. **Cash** — `payment_method` has `cash`. Real path? It bypasses escrow entirely.
8. **Existing unpaid visits** — the `in-progress` / `completed` rows with no payment (§1):
   write off, or chase?

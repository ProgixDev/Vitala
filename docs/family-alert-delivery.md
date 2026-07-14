# Family Alert Delivery — Design Plan

How the **"Alert family"** SOS channel actually reaches a patient's family members.
Design only — no code. Provider-agnostic (SMS provider is a config choice; you lean
Prelude, not Twilio).

---

## 0. Phase 0 — Pre-SOS setup & onboarding (do this FIRST, before any provider)

The emergency moment should be **one tap** — all the thinking (who to alert, what to say,
what medical context to include) is front-loaded at account setup. A new account lands on
Home with a **"Finish setting up SOS"** card that walks three steps; SOS then just fires a
pre-composed message.

### The three setup steps
1. **Add family members** — reuses the existing `emergency_contacts` CRUD (`contact-form.tsx`).
   Setup requires **≥1 contact** to count as done.
2. **Choose / customize the SOS message** — pick a preset template or write your own
   (the genuinely new piece; see §7a).
3. **Emergency medical info** — flag special conditions (asthma, epilepsy, diabetes, on
   blood thinners…) so they ride along in the alert. Reuses the existing
   `medical_profiles` table (`chronic_illnesses`, `allergies`) + a new short `emergency_note`.
   No UI exists for this today — build a compact, emergency-focused editor (not the full
   medical record).

### Home completion card (only while setup is incomplete)

```
 ┌─────────────────────────────────────────────┐
 │  Finish setting up SOS            1 of 3 ●○○ │
 │  So one tap reaches your family instantly.   │
 │                                              │
 │  ○  Add a family member             ›        │
 │  ○  Write your emergency message     ›        │
 │  ○  Add medical info (optional)      ›        │
 └─────────────────────────────────────────────┘
```

- Sits high on Home (below Hero) **only until complete**, then disappears (or collapses to
  a small "SOS ready ✓" chip).
- "Complete" = ≥1 family contact **and** a confirmed message template. Medical info is
  **optional** (encouraged, skippable) so setup can't be blocked by someone who doesn't
  want to share health data.
- Each row deep-links to its editor; progress is derived, not stored (see §5a).
- Respects the design system (Fraunces/Hanken, teal primary, `Well`/`Card` primitives).

### How SOS uses it
When `family-alert` fires, the backend composes:
`<patient's template>` + optional `<medical line>` + `<location/map link>` + `<callback>`
and sends it through the provider (§4). If setup is incomplete at trigger time, SOS still
works but falls back to a generic template and prompts the user to finish setup.

---

## 1. Where we are today (grounded in the code)

This already half-exists — it's not greenfield.

- **`emergency_contacts`** table: `profile_id, name, relationship, phone, email, is_primary, address, notes`.
  App has full CRUD (`/profile/emergency-contacts`, `contact-form.tsx`).
- **`EmergencyService.raise()`** (`server-nest/src/modules/emergency/emergency.service.ts`)
  inserts an `emergency_requests` row, and for `type === 'family-alert'` calls
  `alertFamily()`.
- **`alertFamily()`** loads every contact's `name, phone` and sends each one an SMS via
  **`TwilioService.sendSms()`** — fire-and-forget, `Promise.all`, plain text:
  `"Vitala emergency alert: your contact needs help near <address>. <description>"`.
- **`TwilioService`** no-ops with a warning when unconfigured.
- Sibling integrations already present: **`push.service.ts`** (Expo push) and
  **`notifications.service.ts`**.

### What's missing / weak
1. **Locked to Twilio** — you want Prelude. `TwilioService` is injected directly into
   `EmergencyService`, so the provider is hard-wired.
2. **Fire-and-forget** — no record of whether anything was sent, delivered, or seen.
   The patient has no idea if family got the alert.
3. **Thin message** — no patient name, no map link, no callback number, English-only.
4. **One channel** — SMS only. No push (even though `push.service.ts` exists), no voice.
5. **No consent** — contacts are texted with no recorded agreement / opt-out (CASL/PIPEDA
   exposure in Canada).
6. **No acknowledgement** — no way for a family member to signal "I'm on my way."
7. **No idempotency** — repeated SOS taps = repeated texts.

---

## 2. Goals & non-goals

**Goals**
- Reliable multi-channel fan-out that reaches family **without requiring the app**.
- **Provider-swappable** delivery (drop Twilio → Prelude by config, not surgery).
- **Delivery + acknowledgement tracking**, surfaced live in the emergency tracker.
- **Consent & compliance** baked into adding a family member.
- **Bilingual** (EN/FR), matching the app.

**Non-goals (v1)**
- Conversational AI voice agent (see §3 — deliberately parked).
- Two-way chat / live coordination between family and dispatch.

---

## 3. Channel strategy — SMS-first, tiered

Ranking for an emergency: **reach → speed → trust → actionable info**.

| Channel | Reach (no app) | Speed | Trust | Carries location | Build |
|---|---|---|---|---|---|
| **SMS** | ✅ universal | instant | high | ✅ map link | low |
| **Push** | ❌ app only | instant | high | ✅ rich + live tracker | low |
| **Scripted voice + "press 1"** | ✅ | ring time | medium | ❌ voice only | medium |
| **Conversational AI voice** | ✅ | slow (LLM latency) | **low** | ❌ | high |
| **Email** | ✅ | slow (not real-time) | high | ✅ | low |

**Tiered fan-out (the recommendation):**
1. **SMS to every consented contact, immediately** — the reliable backbone.
2. **Push** to any contact who also has a Vitala account — deep-links to the live
   tracker (`/emergency/[id]`).
3. **Scripted voice call as _escalation_** — to `is_primary`, and/or anyone who hasn't
   acknowledged within ~60s. A ringing phone commands attention (good for older
   relatives who don't read texts).

### On the "AI agent that talks in the call" idea — parked on purpose
For the initial emergency alert a conversational LLM voice agent is the wrong tool:
- **Latency** — LLM turn-taking is slow; seconds matter.
- **Trust** — sounds like a spam robocall; people hang up.
- **Liability** — an AI improvising details about a medical emergency is a real risk.
- **Legal** — several jurisdictions require disclosure for synthetic/AI voice on calls.

A **scripted TTS + press-1 IVR** gets ~90% of the "urgent phone rings + confirm
response" benefit with far less risk. Conversational AI, if ever, belongs on
low-stakes follow-ups — not the SOS itself.

---

## 4. Provider abstraction — the key design move

The whole "not Twilio / maybe Prelude" question dissolves into **one port + adapters**.

```ts
// integrations/messaging/messaging.port.ts
export interface MessagingProvider {
  readonly name: string;
  readonly capabilities: { sms: boolean; voice: boolean; whatsapp?: boolean };
  sendSms(to: string, body: string, meta?: SendMeta): Promise<SendResult>;
  // Optional — only providers with programmable voice implement it.
  placeVoiceCall?(to: string, script: VoiceScript, meta?: SendMeta): Promise<SendResult>;
}

export interface SendResult { providerMessageId: string; status: 'queued' | 'sent' | 'failed'; error?: string }
```

- **Adapters**: `TwilioProvider` (wrap the existing `TwilioService`), **`PreludeProvider`**
  (new), `NoopProvider` (dev/unconfigured).
- **Selection**: `MESSAGING_PROVIDER=prelude|twilio` in env; a small factory binds the
  token `MESSAGING_PROVIDER` in `integrations.module.ts`.
- `EmergencyService` depends on the **port**, never on Twilio/Prelude directly.

### Prelude fit (important nuance)
Prelude is strong for **SMS / transactional messaging + verification** with good
deliverability and routing — a clean fit for the SMS backbone. It is **not** a general
programmable-voice/IVR platform like Twilio. So:

- Split the port: **`MessagingProvider` (SMS)** and **`VoiceProvider` (calls/IVR)** are
  separate injectables. You can run **SMS = Prelude** and, *if* you want Phase-3 voice,
  **Voice = (Twilio or Prelude Voice if your plan includes it)** independently.
- Confirm what your Prelude plan actually covers (SMS only? voice? WhatsApp?) before
  committing Phase 3 — it decides whether voice needs a second vendor.
- Normalize each provider's **delivery-status webhooks** into one internal status enum.

---

## 5. Data model changes (Supabase)

**`emergency_contacts` — add:**
- `notify_consent boolean not null default false`
- `consent_at timestamptz`
- `opt_out_at timestamptz` (STOP handling)
- `channels text[] default '{sms}'` — subset of `sms | push | voice`
- `locale text` — `en | fr` for message language (fallback to patient locale)
- `user_id uuid null` — link to a Vitala account if the family member has one (enables push)

**New `emergency_alert_deliveries`:**
| column | type | notes |
|---|---|---|
| `id` | uuid pk | |
| `emergency_id` | uuid fk → emergency_requests | |
| `contact_id` | uuid fk → emergency_contacts | |
| `channel` | text | `sms \| push \| voice` |
| `provider` | text | `prelude \| twilio \| expo` |
| `provider_message_id` | text | for webhook correlation |
| `status` | text | `queued → sent → delivered → failed` / `answered` / `acknowledged` |
| `error` | text null | |
| `sent_at` / `updated_at` / `acknowledged_at` | timestamptz | |

- **RLS**: patient can read deliveries for their own emergencies (drives the tracker UI);
  writes are service-role only (the worker).
- Add `patient_name` snapshot on `emergency_requests` (or join `profiles`) so the SMS can
  say *who* needs help without an extra lookup at send time.

---

## 5a. Setup state (drives the Home card — no new "onboarding" table)

Setup progress is **derived**, not a stored flag, so it self-heals if a user later deletes
all contacts:

```
GET /me/sos-setup  →  {
  hasContacts:  emergency_contacts count > 0,
  hasTemplate:  sos_preferences.message_template is set (or a preset chosen),
  hasMedical:   medical_profiles has any chronic_illness/allergy/emergency_note,
  complete:     hasContacts && hasTemplate,     // medical is optional
}
```

The app can also compute this client-side from data it already fetches (`user.medicalProfile`,
`Endpoints.contacts()`), avoiding a round-trip. Add a `Endpoints.sosSetup()` only if you
want the server as source of truth.

---

## 7a. SOS message template (the new piece)

**Presets** (app-side constants, localized) the user picks from, then may edit:
- *Calm* — "This is {patient}. I need help and can't call right now. Please reach me."
- *Direct* — "Emergency — {patient} needs help now."
- *Medical* — "{patient} is having a medical emergency ({condition}). Please come or call 911."

**Storage** — a small `sos_preferences` row per patient (or fold into the existing
`settings` table the profiles service already loads):
| column | type | notes |
|---|---|---|
| `profile_id` | uuid fk | |
| `message_template` | text | the patient's chosen/edited body, with `{…}` placeholders |
| `include_medical` | boolean default true | inject the medical line? |
| `share_location` | boolean default true | attach the map link? |

**Placeholders** resolved at send time: `{patient}`, `{condition}`, `{location}`, `{callback}`.
Keep the editor showing a **live preview** of the final SMS as they type.

**Emergency medical line** — built from `medical_profiles`:
`chronic_illnesses` + `allergies` → e.g. *"Conditions: asthma, epilepsy. Allergies: penicillin."*
Plus a new free-text `emergency_note` on `medical_profiles` for one-liners the message
can't infer (*"Inhaler in my bag"*, *"On blood thinners"*).

**Composed example** (what actually sends):
> ⚠️ This is Marie. I need help and can't call right now. Conditions: asthma. Location:
> maps.google.com/?q=… Call: +1 514… — Reply OK to confirm.

---

## 6. Flow

```
POST /emergency  (type=family-alert)
        │
        ├─ insert emergency_requests
        ├─ enqueue  fanout(emergency_id)   ← idempotent key = emergency_id
        └─ return fast (don't block the SOS on delivery)

worker: fanout(emergency_id)
        ├─ load consented contacts (skip opt_out / no-consent)
        ├─ for each contact:
        │     ├─ insert delivery rows (sms, +push if user_id)
        │     ├─ MessagingProvider.sendSms(...)   → store provider_message_id
        │     └─ PushProvider.send(...) if user_id
        └─ schedule escalate(emergency_id) at +60s

worker: escalate(emergency_id)          ← Phase 3
        └─ for primary / unacknowledged contacts:
              VoiceProvider.placeVoiceCall(script)   (press-1 IVR)

webhooks: POST /emergency/webhooks/:provider
        └─ map provider status → delivery.status (delivered / failed / answered)

acknowledge: SMS reply "OK" · voice press-1 · push tap · in-app
        └─ delivery.status = acknowledged, acknowledged_at = now
        └─ Supabase realtime → tracker updates
```

- **Queue**: BullMQ (Redis) or a Supabase/pg-based job table — whatever the backend
  already leans on. The point is: SOS returns immediately; delivery + escalation are async
  and retryable.
- **Idempotency**: keyed on `emergency_id` so double-taps don't double-send.

---

## 7. Message content (bilingual)

**SMS (EN):**
> ⚠️ Vitala emergency — {patient} triggered an SOS at {time}. Location: {maps_link}.
> Call them: {callback}. Reply OK to confirm you're responding.

**SMS (FR):**
> ⚠️ Urgence Vitala — {patient} a déclenché un SOS à {heure}. Lieu : {maps_link}.
> Appelez : {callback}. Répondez OK pour confirmer que vous intervenez.

- `maps_link` = `https://maps.google.com/?q={lat},{long}` (falls back to address text).
- Keep **medical detail out of SMS** — "needs help" + location only (privacy + segment length).
- Note: French accents push SMS into UCS-2 (~70 chars/segment). Budget 2 segments for FR.

**Voice script (Phase 3):** *"This is an automated emergency alert from Vitala.
{patient} has triggered an SOS. Press 1 to confirm you are responding, or hang up and
call them now."* — repeat once, then voicemail-safe fallback.

---

## 8. Consent & compliance (Canada: CASL + PIPEDA)

- **Consent at add-time**: when saving a family member, an explicit checkbox — *"I confirm
  this person agrees to receive emergency alerts about me by SMS/call."* Store
  `notify_consent` + `consent_at`.
- **Opt-out**: honor `STOP` (SMS) and DNC; set `opt_out_at`, exclude from fan-out.
- **AI/automated-call disclosure** on any voice message.
- **Data minimization**: no diagnosis/medical detail in outbound messages.
- **Audit**: `emergency_alert_deliveries` doubles as the compliance trail.

---

## 9. Acknowledgement UX (the payoff)

The emergency tracker (`/emergency/[id]`) shows per-contact status, live via Supabase
realtime:

```
Family notified
  ● Mom (Primary)      ✓ Acknowledged · 12:04
  ● Dad                Delivered
  ● Sister             Sending…
```

This turns a fire-and-forget alert into something the patient can actually trust —
they *see* that someone is coming.

---

## 10. Failure handling

- Provider error → retry w/ backoff; optional fallback provider.
- No consented/reachable contacts → surface in-app: *"No family contacts could be
  reached — call emergency services directly."* + a one-tap dialer.
- Invalid number → mark `failed`, don't silently drop.
- All channels failed → escalate the in-app warning prominently.

---

## 11. Phasing

- **Phase 0 (do first — no provider needed)** — Home "Finish setting up SOS" card;
  family-member step (reuse existing CRUD); **SOS message template** editor with presets +
  live preview (`sos_preferences`); emergency **medical info** editor (reuse `medical_profiles`
  + new `emergency_note`). Backend composes the message from template + medical + location.
  This is pure app + light schema — shippable before picking a provider.
- **Phase 1** — Provider port + **Prelude adapter**; enriched bilingual SMS (name + map
  link + callback); `emergency_alert_deliveries` + status webhooks; tracker shows
  per-contact status; consent checkbox on add-contact. *(No voice.)*
- **Phase 2** — Push tier for family members who have a Vitala account.
- **Phase 3** — Scripted voice IVR escalation + press-1 acknowledgement (pending Prelude
  voice capability / second vendor decision).
- **Deferred** — conversational AI voice.

---

## 12. Open questions (your calls)

1. **Prelude scope** — does your plan include voice/IVR and WhatsApp, or SMS/verify only?
   (Decides whether Phase 3 voice needs a second vendor.)
2. **Family app accounts** — will family members ever get Vitala logins? (Unlocks push +
   richer acknowledgement.)
3. **Callback number** — the patient's own number, or a Vitala dispatch line?
4. **Queue infra** — is there already a Redis/BullMQ or job-table pattern in `server-nest`
   to reuse for the async fan-out?
5. **Jurisdiction** — confirming Canada (CASL/PIPEDA) so consent + opt-out wording is right.

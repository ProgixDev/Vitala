-- Webhook idempotency: process each Stripe event exactly once.
--
-- Stripe retries any non-2xx and does not guarantee ordering, so the same event
-- WILL arrive more than once. handleWebhook() was only partly defended: the
-- `.neq('status', status)` guard in settle() stops a patient being notified
-- twice, but it is specific to that one path — it does nothing for the refund
-- branch, and nothing for the transfers/payouts to come, where a replayed event
-- would move real money a second time.
--
-- This table is the general guard. Insert first, `on conflict do nothing`; a
-- conflict means we have already handled this event, so ack and stop. The
-- primary key does the work — no read-then-write race.
--
-- Timing matters and this is easy to get backwards: the row must be committed
-- BEFORE the side effects run. Insert-then-work means a crash mid-work leaves
-- the event marked done and it is never retried. Work-then-insert means a crash
-- leaves it unmarked and Stripe retries — which is the recoverable direction.
-- So: check-and-insert to claim the event, and let Stripe's retry cover the
-- crash-in-flight case (our handlers are individually idempotent anyway).
create table if not exists public.stripe_events (
  -- Stripe's own event id (evt_...). The natural key — never generate our own.
  event_id text primary key,
  type text not null,
  received_at timestamptz not null default now()
);

comment on table public.stripe_events is
  'Processed Stripe webhook event ids. Existence = already handled; see PaymentsService.handleWebhook.';

alter table public.stripe_events enable row level security;

-- No client of any role has business reading or writing this: it is written by
-- the webhook through the service-role client, which bypasses RLS. Enabling RLS
-- with no policy is therefore the correct, deliberate configuration — it denies
-- everyone, rather than leaving the table unguarded.
-- (Mirrors the payments note in 0002_rls.)

-- Housekeeping: the table only needs enough history to cover Stripe's retry
-- window (~3 days). Nothing prunes it yet, so this index keeps a future
-- delete-older-than sweep cheap and makes the table self-explanatory.
create index if not exists stripe_events_received_at_idx
  on public.stripe_events (received_at);

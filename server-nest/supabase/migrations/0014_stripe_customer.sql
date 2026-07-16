-- A card on file, so booking doesn't have to stop and ask for one.
--
-- Until now the card was collected per-visit on /pay/:id, which made every
-- booking a two-step affair and left the request unfunded (and therefore
-- invisible to nurses, see 0012) until the patient finished a payment sheet.
-- With a saved payment method the server can authorise off-session at booking
-- time and open the request in the same request — one tap.
--
-- Note what is NOT here: no card number, no expiry, no last4. Stripe holds the
-- instrument; we hold two opaque ids pointing at it. The app previously kept a
-- local "wallet" of brand/last4 in SecureStore that was pure decoration and
-- could not be charged — this replaces it with the real thing.
alter table public.profiles
  -- Stripe Customer (cus_...). One per patient, created lazily on first card.
  add column if not exists stripe_customer_id text,
  -- The PaymentMethod (pm_...) to authorise against without user interaction.
  -- Null = no card on file = fall back to the per-visit payment sheet.
  add column if not exists default_payment_method text;

comment on column public.profiles.stripe_customer_id is
  'Stripe Customer id. Lazily created when the patient first saves a card.';
comment on column public.profiles.default_payment_method is
  'Stripe PaymentMethod id used for off-session authorisation at booking. Null = no card on file.';

-- Looked up by webhook handlers that only have the Stripe side of the mapping.
create index if not exists profiles_stripe_customer_id_idx
  on public.profiles (stripe_customer_id)
  where stripe_customer_id is not null;

-- No new RLS policy: profiles already restricts a row to its owner, and these
-- two ids are only ever written by the server through the service-role client.
-- They are opaque references, not secrets — but there is no reason for a client
-- to write them, so they inherit the existing owner-scoped policies untouched.

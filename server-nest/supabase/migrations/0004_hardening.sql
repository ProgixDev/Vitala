-- ============================================================================
-- Security hardening from the Supabase advisor (all WARN-level).
-- ============================================================================

-- 1. Pin search_path on the updated_at trigger function.
create or replace function public.set_updated_at() returns trigger
language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end; $$;

-- 2. Public buckets serve objects via their public URL without a SELECT policy.
--    Drop the broad listing policy so clients can't enumerate every avatar.
drop policy if exists avatars_read on storage.objects;

-- 3. handle_new_user is a trigger function only — it must never be RPC-callable.
--    (Triggers still fire; only direct /rpc access is removed.)
revoke execute on function public.handle_new_user() from anon, authenticated;

-- Note: is_admin() and current_user_role() remain executable because RLS
-- policies invoke them in the caller's context; they only ever return the
-- caller's own role/admin flag, so RPC exposure is not sensitive.

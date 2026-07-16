-- French is the app's language; English is opt-in via Settings.
alter table public.user_settings alter column language set default 'fr';

-- Existing rows too. Every 'en' currently stored is the old column default
-- rather than a deliberate choice — the app shipped no language switcher
-- before this change, so nobody could have picked English on purpose. Anyone
-- who wants it back can set it in Settings.
update public.user_settings set language = 'fr' where language = 'en';

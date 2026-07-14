/**
 * French strings (stub — English toggle target).
 * Only a partial set is translated today; any missing key falls back to
 * English via the i18n resolver, so this can be filled in incrementally.
 */
import type { TranslationKey } from "./en";

const fr: Partial<Record<TranslationKey, string>> = {
  "common.continue": "Continuer",
  "common.next": "Suivant",
  "common.back": "Retour",
  "common.cancel": "Annuler",
  "common.save": "Enregistrer",
  "common.done": "Terminé",
  "common.retry": "Réessayer",
  "common.skip": "Passer",

  "tab.home": "Accueil",
  "tab.schedule": "Agenda",
  "tab.sos": "SOS",
  "tab.payment": "Paiement",
  "tab.profile": "Profil",

  "service.reeducation": "Rééducation",
  "service.perfusion": "Perfusion",
  "service.analyses": "Analyses",
};

export default fr;

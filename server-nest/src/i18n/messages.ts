/**
 * Server-side copy, in the user's language.
 *
 * Notifications are the one place the server talks to a human, so they can't be
 * hardcoded English while the app runs in French. Every recipient's language
 * comes from `user_settings.language`; French is the default, English is the
 * opt-in — the same rule the app follows in utils/i18n.ts.
 *
 * Keep this catalogue in sync with app-mobile/locales/*.ts when the wording of
 * a shared concept changes.
 */

export const DEFAULT_LANGUAGE = 'fr';

type Dict = Record<string, string>;

const en: Dict = {
  // Broadcast to nurses when a visit is requested.
  'notif.job.title': 'New visit request',
  'notif.job.emergencyTitle': 'Emergency request',
  'notif.job.message': '{service} — {place}',
  'notif.job.direct': 'A patient has requested you — {service}.',

  // To the patient, when a nurse claims their request.
  'notif.confirmed.title': 'Your visit is confirmed',
  'notif.confirmed.message':
    '{nurse} accepted your request and will be in touch.',
  'notif.confirmed.fallbackNurse': 'Your nurse',

  // To the patient, as the visit moves through its states.
  'notif.status.confirmed.title': 'Your visit is confirmed',
  'notif.status.confirmed.message':
    'A nurse has accepted your visit and will be in touch.',
  'notif.status.on-the-way.title': 'Your nurse is on the way',
  'notif.status.on-the-way.message':
    'Your nurse has set out and will arrive shortly.',
  'notif.status.in-progress.title': 'Your visit has started',
  'notif.status.in-progress.message':
    'Your nurse has arrived and your visit is underway.',
  'notif.status.completed.title': 'Visit complete',
  'notif.status.completed.message':
    'Your visit is finished. Tap to leave a review.',
  'notif.status.cancelled.title': 'Visit cancelled',
  'notif.status.cancelled.message': 'Your visit has been cancelled.',
  'notif.status.declined.title': 'Visit declined',
  'notif.status.declined.message':
    'Your nurse is unable to attend. We are finding you another.',

  // Fallback when a transition has no copy of its own. {status} is a
  // human-readable status name, never the raw enum.
  'notif.status.fallback.title': 'Appointment updated',
  'notif.status.fallback.message': 'Your appointment is now {status}.',

  'status.name.pending': 'pending',
  'status.name.confirmed': 'confirmed',
  'status.name.on-the-way': 'on the way',
  'status.name.in-progress': 'in progress',
  'status.name.completed': 'completed',
  'status.name.cancelled': 'cancelled',
  'status.name.declined': 'declined',

  'notif.payment.title': 'Payment received',
  'notif.payment.message': 'Your visit has been paid. Thank you!',

  // SMS to a patient's emergency contacts.
  'sms.emergency':
    'Vitala emergency alert: your contact needs help{where}. {description}',
  'sms.emergency.near': ' near {address}',
};

const fr: Dict = {
  'notif.job.title': 'Nouvelle demande de visite',
  'notif.job.emergencyTitle': 'Demande urgente',
  'notif.job.message': '{service} — {place}',
  'notif.job.direct': 'Un patient vous a demandé — {service}.',

  'notif.confirmed.title': 'Votre visite est confirmée',
  'notif.confirmed.message':
    '{nurse} a accepté votre demande et vous contactera.',
  'notif.confirmed.fallbackNurse': 'Votre infirmier·ère',

  'notif.status.confirmed.title': 'Votre visite est confirmée',
  'notif.status.confirmed.message':
    'Un·e infirmier·ère a accepté votre visite et vous contactera.',
  'notif.status.on-the-way.title': 'Votre infirmier·ère est en route',
  'notif.status.on-the-way.message':
    'Votre infirmier·ère est parti·e et arrivera sous peu.',
  'notif.status.in-progress.title': 'Votre visite a commencé',
  'notif.status.in-progress.message':
    'Votre infirmier·ère est arrivé·e et la visite est en cours.',
  'notif.status.completed.title': 'Visite terminée',
  'notif.status.completed.message':
    'Votre visite est terminée. Touchez pour laisser un avis.',
  'notif.status.cancelled.title': 'Visite annulée',
  'notif.status.cancelled.message': 'Votre visite a été annulée.',
  'notif.status.declined.title': 'Visite refusée',
  'notif.status.declined.message':
    'Votre infirmier·ère ne peut pas se déplacer. Nous vous en trouvons un·e autre.',

  'notif.status.fallback.title': 'Rendez-vous mis à jour',
  'notif.status.fallback.message': 'Votre rendez-vous est maintenant {status}.',

  'status.name.pending': 'en attente',
  'status.name.confirmed': 'confirmé',
  'status.name.on-the-way': 'en route',
  'status.name.in-progress': 'en cours',
  'status.name.completed': 'terminé',
  'status.name.cancelled': 'annulé',
  'status.name.declined': 'refusé',

  'notif.payment.title': 'Paiement reçu',
  'notif.payment.message': 'Votre visite a été payée. Merci !',

  'sms.emergency':
    'Alerte urgence Vitala : votre contact a besoin d’aide{where}. {description}',
  'sms.emergency.near': ' près de {address}',
};

const dictionaries: Record<string, Dict> = { en, fr };

export function isSupported(lang?: string | null): boolean {
  return !!lang && !!dictionaries[lang];
}

/** Normalise whatever is on the profile into a language we actually ship. */
export function resolveLanguage(lang?: string | null): string {
  return isSupported(lang) ? (lang as string) : DEFAULT_LANGUAGE;
}

/**
 * Translate a key into `lang`, interpolating {vars}. Missing keys fall back to
 * English, then to the key itself, so a gap never sends an empty push.
 */
export function translate(
  lang: string | null | undefined,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const dict = dictionaries[resolveLanguage(lang)] ?? en;
  let str = dict[key] ?? en[key] ?? key;
  if (vars) {
    for (const k of Object.keys(vars)) {
      str = str.split(`{${k}}`).join(String(vars[k]));
    }
  }
  return str;
}

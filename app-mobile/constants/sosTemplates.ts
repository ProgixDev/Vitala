/**
 * Preset SOS message bodies the patient picks from during setup, then may edit.
 * `{patient}` is the only placeholder — it's replaced with the user's name when
 * the alert is composed (see `lib/sosMessage.ts`). Bodies are i18n keys so the
 * preset a user picks is seeded in their current language.
 */
export interface SosTemplate {
  id: string;
  labelKey: string;
  bodyKey: string;
}

export const SOS_TEMPLATES: SosTemplate[] = [
  { id: 'calm', labelKey: 'sosMsg.tpl.calm.label', bodyKey: 'sosMsg.tpl.calm.body' },
  { id: 'direct', labelKey: 'sosMsg.tpl.direct.label', bodyKey: 'sosMsg.tpl.direct.body' },
  { id: 'medical', labelKey: 'sosMsg.tpl.medical.label', bodyKey: 'sosMsg.tpl.medical.body' },
];

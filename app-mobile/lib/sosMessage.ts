import type { Me } from '@/types';
import type { SosPrefs } from './sosPrefs';

type Translate = (key: string) => string;

/**
 * Build the message that reaches family when SOS fires: the patient's template
 * with `{patient}` filled, plus an optional medical line (conditions, allergies,
 * responder note) when `includeMedical` is on. Location is added by the alert
 * pipeline, so it's not duplicated here.
 */
export function composeSosMessage(prefs: SosPrefs, me: Me | null, t: Translate): string {
  const name = me?.full_name?.trim() || t('sosMsg.someone');
  const body = (prefs.message.trim() || t('sosMsg.fallback')).replace(/\{patient\}/g, name);
  const parts = [body];

  if (prefs.includeMedical) {
    const mp = me?.medicalProfile;
    const med: string[] = [];
    if (mp?.chronic_illnesses?.length) med.push(`${t('sosMsg.conditions')}: ${mp.chronic_illnesses.join(', ')}`);
    if (mp?.allergies?.length) med.push(`${t('sosMsg.allergies')}: ${mp.allergies.join(', ')}`);
    if (prefs.emergencyNote.trim()) med.push(prefs.emergencyNote.trim());
    if (med.length) parts.push(`${med.join('. ')}.`);
  }

  return parts.join(' ');
}

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * The patient's pre-composed SOS preferences. Stored locally for now (Phase 0);
 * a later phase moves this to a `sos_preferences` row server-side so the backend
 * can compose the family message itself. Until then the app composes the message
 * and passes it as the emergency `description`, which the family SMS already uses.
 */
export interface SosPrefs {
  /** Preset id the message came from, or 'custom' once edited. `null` = unset. */
  templateId: string | null;
  /** The message body, with `{patient}` placeholder. Empty = not set up. */
  message: string;
  /** Append the patient's conditions/allergies/note to the alert. */
  includeMedical: boolean;
  /** Attach the patient's live location to the alert. */
  shareLocation: boolean;
  /** Free-text one-liner for responders, e.g. "Inhaler in my bag". */
  emergencyNote: string;
}

export const DEFAULT_SOS_PREFS: SosPrefs = {
  templateId: null,
  message: '',
  includeMedical: true,
  shareLocation: true,
  emergencyNote: '',
};

const KEY = 'vitala.sosPrefs.v1';

export async function getSosPrefs(): Promise<SosPrefs> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return DEFAULT_SOS_PREFS;
    return { ...DEFAULT_SOS_PREFS, ...(JSON.parse(raw) as Partial<SosPrefs>) };
  } catch {
    return DEFAULT_SOS_PREFS;
  }
}

export async function saveSosPrefs(prefs: SosPrefs): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    // Best-effort — a failed write just means the user re-enters it later.
  }
}

/** The message step counts as done once there's a non-empty body. */
export function hasTemplate(prefs: SosPrefs): boolean {
  return prefs.message.trim().length > 0;
}

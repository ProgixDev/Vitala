import { Redirect } from 'expo-router';

/**
 * Role selection now lives inline as a Patient / Nurse toggle on the sign-up
 * screen, so this legacy route just forwards there.
 */
export default function RolePicker() {
  return <Redirect href="/(auth)/patient-signup" />;
}

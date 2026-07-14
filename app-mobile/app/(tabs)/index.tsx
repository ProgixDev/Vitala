import { PatientHome } from '@/components/home/PatientHome';

/**
 * The patient home tab. Nurses are routed to their own shell at `/(nurse)` by
 * the entry gate and the tabs layout guard, so this tab is patient-only.
 */
export default function Home() {
  return <PatientHome />;
}

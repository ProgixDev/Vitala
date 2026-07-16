import type { BadgeTone } from '@/components/ui/Badge';
import type { IconName } from '@/components/ui/Icon';
import type {
  AppointmentStatus,
  EmergencyStatus,
  PaymentStatus,
} from '@/types';

/** Human-readable labels + badge tones per status. */

const appointmentMeta: Record<AppointmentStatus, { tone: BadgeTone; label: string }> = {
  awaiting_payment: { tone: 'warning', label: 'Payment to finish' },
  pending: { tone: 'warning', label: 'Pending' },
  confirmed: { tone: 'primary', label: 'Confirmed' },
  'on-the-way': { tone: 'info', label: 'On the way' },
  'in-progress': { tone: 'info', label: 'In progress' },
  completed: { tone: 'success', label: 'Completed' },
  cancelled: { tone: 'danger', label: 'Cancelled' },
  declined: { tone: 'danger', label: 'Declined' },
};

export function appointmentStatusMeta(status: AppointmentStatus) {
  return appointmentMeta[status] ?? { tone: 'neutral' as BadgeTone, label: status };
}

const paymentMeta: Record<PaymentStatus, { tone: BadgeTone; label: string; icon: IconName }> = {
  pending: { tone: 'warning', label: 'Pending', icon: 'time-outline' },
  processing: { tone: 'info', label: 'Processing', icon: 'sync-outline' },
  completed: { tone: 'success', label: 'Paid', icon: 'checkmark-circle-outline' },
  failed: { tone: 'danger', label: 'Failed', icon: 'close-circle-outline' },
  cancelled: { tone: 'neutral', label: 'Cancelled', icon: 'ban-outline' },
  refunded: { tone: 'neutral', label: 'Refunded', icon: 'return-down-back-outline' },
};

export function paymentStatusMeta(status: PaymentStatus) {
  return paymentMeta[status] ?? { tone: 'neutral' as BadgeTone, label: status, icon: 'card-outline' as IconName };
}

const emergencyMeta: Record<EmergencyStatus, { tone: BadgeTone; label: string }> = {
  pending: { tone: 'warning', label: 'Received' },
  dispatched: { tone: 'info', label: 'Dispatched' },
  'en-route': { tone: 'info', label: 'En route' },
  'on-scene': { tone: 'primary', label: 'On scene' },
  completed: { tone: 'success', label: 'Resolved' },
  cancelled: { tone: 'neutral', label: 'Cancelled' },
};

export function emergencyStatusMeta(status: EmergencyStatus) {
  return emergencyMeta[status] ?? { tone: 'neutral' as BadgeTone, label: status };
}

/** Which appointment statuses are "active" (Upcoming) vs "history". */
export const UPCOMING_STATUSES: AppointmentStatus[] = [
  // Upcoming rather than hidden: an unpaid request is the one state where only
  // the patient can move things along, so burying it guarantees it stalls. A
  // nurse never sees these — RLS scopes the open pool to `pending`.
  'awaiting_payment',
  'pending',
  'confirmed',
  'on-the-way',
  'in-progress',
];
export const HISTORY_STATUSES: AppointmentStatus[] = ['completed', 'cancelled', 'declined'];

/** Icon name per service category (falls back to a stethoscope). */
// Curated Unsplash cover photos per category (stable CDN URLs).
const COVER_PHOTOS: Record<string, string> = {
  'general-care': 'photo-1631815590058-860e4f83c1e8',
  'wound-care': 'photo-1609840534277-88833ef3ddeb',
  'elderly-care': 'photo-1587556930720-58ec521056a5',
  'post-surgery': 'photo-1633219664572-473fd988a44f',
  'medication-administration': 'photo-1628771065518-0d82f1938462',
  'vital-monitoring': 'photo-1615486511484-92e172cc4fe0',
  'emergency': 'photo-1554734867-bf3c00a49371',
};

const COVER_DEFAULT = 'photo-1631815590058-860e4f83c1e8';

/** A category-appropriate cover photo URL, sized for a card. */
export function categoryImage(category?: string | null): string {
  const id = (category && COVER_PHOTOS[category]) || COVER_DEFAULT;
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=70`;
}

/** Two-stop cover gradient per service category — the photo fallback + backdrop. */
export function categoryCover(category?: string | null): readonly [string, string] {
  switch (category) {
    case 'general-care':
      return ['#2DD4BF', '#0E7C6B'];
    case 'wound-care':
      return ['#FB7185', '#E11D48'];
    case 'elderly-care':
      return ['#A78BFA', '#7C3AED'];
    case 'post-surgery':
      return ['#60A5FA', '#2563EB'];
    case 'medication-administration':
      return ['#34D399', '#0E9F6E'];
    case 'vital-monitoring':
      return ['#F472B6', '#DB2777'];
    case 'emergency':
      return ['#FB7185', '#E11D48'];
    default:
      return ['#38BDF8', '#2563EB'];
  }
}

export function categoryIcon(category?: string | null): IconName {
  switch (category) {
    case 'general-care':
      return 'medkit-outline';
    case 'wound-care':
      return 'bandage-outline';
    case 'elderly-care':
      return 'accessibility-outline';
    case 'post-surgery':
      return 'pulse-outline';
    case 'medication-administration':
      return 'medical-outline';
    case 'vital-monitoring':
      return 'heart-outline';
    case 'emergency':
      return 'alert-circle-outline';
    default:
      return 'fitness-outline';
  }
}

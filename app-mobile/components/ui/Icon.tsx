import {
  type Icon as PhosphorIcon,
  type IconWeight,
  // affordance / structural
  CaretRight,
  CaretLeft,
  CaretDown,
  CaretUp,
  X,
  Plus,
  Check,
  Checks,
  ArrowRight,
  Eye,
  EyeSlash,
  ArrowClockwise,
  ArrowsClockwise,
  ArrowCircleRight,
  ArrowBendUpLeft,
  Prohibit,
  CircleIcon as Circle,
  // status / feedback
  Warning,
  WarningCircle,
  CheckCircle,
  XCircle,
  Info,
  Question,
  ShieldCheck,
  Hourglass,
  Clock,
  // people / account
  User,
  Users,
  PencilSimple,
  Gear,
  Bell,
  SignOut,
  Lock,
  Fingerprint,
  Envelope,
  Phone,
  // commerce
  CreditCard,
  Tag,
  Receipt,
  Briefcase,
  // place
  MapPin,
  MapTrifold,
  MagnifyingGlass,
  Camera,
  Star,
  CalendarBlank,
  ChatCircle,
  Trash,
  Smiley,
  Medal,
  Sparkle,
  House,
  Globe,
  Heart,
  // medical
  FirstAidKit,
  Bandaids,
  Wheelchair,
  Pill,
  Stethoscope,
  Pulse,
  Siren,
  Ambulance,
  Car,
  // brand / social
  GoogleLogo,
  AppleLogo,
} from 'phosphor-react-native';
import { useThemeColors } from '@/constants/theme';

/**
 * Single icon surface for the whole app — Phosphor (duotone by default) behind a
 * stable string API. All prior Ionicons names map here, so call sites keep their
 * names and only swap `<Ionicons/>` → `<Icon/>`. The tab bar is intentionally NOT
 * routed through this and keeps its own icon set.
 *
 * Duotone lets a single `color` carry both the line and a soft same-hue fill, so
 * content icons read warm and premium without a tinted chip behind them.
 */
const MAP = {
  // affordance / structural (rendered as clean single-weight lines below)
  'chevron-forward': CaretRight,
  'chevron-back': CaretLeft,
  'chevron-down': CaretDown,
  'chevron-up': CaretUp,
  close: X,
  add: Plus,
  checkmark: Check,
  'arrow-forward': ArrowRight,
  ellipse: Circle,
  'checkmark-done-outline': Checks,
  'eye-outline': Eye,
  'eye-off-outline': EyeSlash,
  refresh: ArrowClockwise,
  'sync-outline': ArrowsClockwise,
  'arrow-forward-circle-outline': ArrowCircleRight,
  'return-down-back-outline': ArrowBendUpLeft,
  'ban-outline': Prohibit,
  'ellipse-outline': Circle,

  // status / feedback
  alert: Warning,
  'alert-circle': WarningCircle,
  'alert-circle-outline': WarningCircle,
  'warning-outline': Warning,
  'checkmark-circle': CheckCircle,
  'checkmark-circle-outline': CheckCircle,
  'radio-button-on': CheckCircle,
  'radio-button-off': Circle,
  'close-circle': XCircle,
  'close-circle-outline': XCircle,
  'information-circle': Info,
  'information-circle-outline': Info,
  'help-circle-outline': Question,
  'shield-checkmark': ShieldCheck,
  'shield-checkmark-outline': ShieldCheck,
  'hourglass-outline': Hourglass,
  'time-outline': Clock,

  // people / account
  person: User,
  'person-outline': User,
  'people-outline': Users,
  people: Users,
  'create-outline': PencilSimple,
  'settings-outline': Gear,
  'notifications-outline': Bell,
  'log-out-outline': SignOut,
  'lock-closed': Lock,
  'lock-closed-outline': Lock,
  'finger-print-outline': Fingerprint,
  'mail-outline': Envelope,
  'call-outline': Phone,

  // commerce
  card: CreditCard,
  'card-outline': CreditCard,
  'pricetag-outline': Tag,
  'receipt-outline': Receipt,
  'briefcase-outline': Briefcase,

  // place / misc content
  location: MapPin,
  'location-outline': MapPin,
  'map-outline': MapTrifold,
  'search-outline': MagnifyingGlass,
  camera: Camera,
  'camera-outline': Camera,
  star: Star,
  'star-outline': Star,
  'calendar-outline': CalendarBlank,
  'chatbox-outline': ChatCircle,
  'chatbubble-outline': ChatCircle,
  'trash-outline': Trash,
  'happy-outline': Smiley,
  'ribbon-outline': Medal,
  'sparkles-outline': Sparkle,
  'home-outline': House,
  'globe-outline': Globe,
  'heart-outline': Heart,
  'heart-circle': Heart,
  pulse: Pulse,
  'pulse-outline': Pulse,

  // medical / service categories
  'medkit-outline': FirstAidKit,
  medkit: FirstAidKit,
  'bandage-outline': Bandaids,
  'accessibility-outline': Wheelchair,
  'medical-outline': Pill,
  siren: Siren,
  stethoscope: Stethoscope,
  heart: Heart,
  'fitness-outline': Stethoscope,
  'car-sport': Ambulance,
  'car-outline': Car,

  // brand / social
  'logo-google': GoogleLogo,
  'logo-apple': AppleLogo,
} satisfies Record<string, PhosphorIcon>;

export type IconName = keyof typeof MAP;

/** Names that read better as a clean single-weight line than as duotone. */
const LINE_ONLY = new Set<IconName>([
  'chevron-forward',
  'chevron-back',
  'chevron-down',
  'chevron-up',
  'close',
  'add',
  'checkmark',
  'arrow-forward',
  'ellipse',
  'checkmark-done-outline',
  'eye-outline',
  'eye-off-outline',
  'refresh',
  'sync-outline',
  'arrow-forward-circle-outline',
  'return-down-back-outline',
  'ban-outline',
  'ellipse-outline',
  'radio-button-off',
]);

export interface IconProps {
  name: IconName;
  size?: number;
  /** Line + duotone-fill hue. Defaults to theme foreground. */
  color?: string;
  weight?: IconWeight;
  /** Override the duotone fill hue (defaults to `color`). */
  duotoneColor?: string;
  duotoneOpacity?: number;
}

export function Icon({ name, size = 22, color, weight, duotoneColor, duotoneOpacity }: IconProps) {
  const colors = useThemeColors();
  const Cmp = MAP[name];
  const resolvedWeight: IconWeight = weight ?? (LINE_ONLY.has(name) ? 'regular' : 'duotone');
  return (
    <Cmp
      size={size}
      color={color ?? colors.foreground}
      weight={resolvedWeight}
      duotoneColor={duotoneColor}
      duotoneOpacity={duotoneOpacity}
    />
  );
}

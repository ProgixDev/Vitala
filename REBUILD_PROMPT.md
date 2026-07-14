# Vitala — Mobile App Rebuild Prompt

> Paste this whole document as the brief for building a new version of the Vitala mobile app.
> It describes **what the app does** — its features and behavior. The **visual design and the
> code/folder structure are intentionally left open**: invent a fresh, modern, premium design
> language and organize the project however is cleanest.

---

## 1. What we're building

**Vitala** is a **home-healthcare on-demand mobile app** (think "Uber for at-home nursing").
It's a **two-sided marketplace** connecting **patients** who need medical care at home with
**nurses** who deliver it — plus a life-critical **SOS / emergency** system.

Two user roles share one app, with role-specific experiences:

- **Patient** — browses healthcare services, books a nurse to their home, pays, tracks the
  visit in real time, and can trigger emergencies.
- **Nurse** — sees incoming appointment requests, accepts/declines them, self-assigns
  unassigned jobs, and manages upcoming visits.

The tone is **calm, trustworthy, premium, and reassuring** — this is healthcare, often used in
stressful moments. It must feel safe and effortless. Support **light and dark mode** and be
**bilingual-ready (English default, French secondary)** with all copy routed through an
`i18n` layer.

---

## 2. Tech stack (keep this stack)

- **Expo (SDK 54) + React Native + expo-router** (file-based routing, typed routes).
- **NativeWind v5 + Tailwind v4** for styling (className-first; semantic design tokens with a
  TS mirror for prop-based colors).
- **TypeScript** throughout.
- **Supabase** for auth/data (backend is a separate service exposed over a REST API base URL).
- **Stripe** (`@stripe/stripe-react-native`) for payments + saved cards + Google/Apple Pay.
- **Mapbox** (`@rnmapbox/maps`) for the map / location picking.
- **expo-location** (GPS), **expo-camera** + **expo-image-picker** (nurse ID capture / selfie),
  **expo-notifications** (push), **expo-secure-store** (tokens, onboarding flag),
  **expo-haptics**, **react-native-reanimated** (animations), **react-native-toast-message**,
  **react-native-otp-entry** (OTP inputs), **@expo/vector-icons** (Ionicons — no emoji as icons).
- Fonts via `@expo-google-fonts` (pick your own pairing — one display/heading face + one body face).

Build a small **shared UI primitive library** and use it everywhere (don't re-implement
buttons/cards/inputs inline): Text, Button, Input, Card, Screen, Header, Badge, Chip,
IconButton, Divider, Skeleton/SkeletonList, EmptyState, StepProgress, OtpInput, plus a custom
center **SOS tab button**.

---

## 3. Design direction (make this NEW)

The previous design was rejected. **Do not copy it.** Design a fresh, cohesive system:

- Choose your own **color palette, typography, spacing, radii, elevation, and motion**.
  It should feel modern, premium, and medical-grade trustworthy — not generic.
- **One rule to keep:** reserve **red** exclusively for the **SOS / emergency** surfaces and
  destructive actions. Everything else uses your brand/neutral palette.
- Cards, buttons, inputs, chips, and badges should be a consistent, reusable system.
- Full **light + dark** support, auto-switching with the device theme.
- Meet **WCAG AA** contrast for text.
- Smooth, restrained micro-interactions (haptics on key actions, animated carousels,
  step progress, skeleton loaders instead of spinners where possible).

---

## 4. Features & behavior

### Boot & onboarding
- On first launch, show a **3-slide onboarding carousel** (illustration + title + subtitle,
  pagination dots, "Skip"), then never show it again (persist a completed flag).
  - Slide 1: "Healthcare, anytime, anywhere" — quality home healthcare wherever you are.
  - Slide 2: "Services made for you" — personalized care tailored to your needs & schedule.
  - Slide 3: "Your well-being, our priority" — trusted professionals; CTAs "Create account" + "Log in".
- After onboarding, route to **auth** or straight to the app if already signed in.

### Authentication & signup
- **Sign in** with email + password, plus "Forgot password?" and a link to create an account.
  Persist the session/token securely.
- **Role picker** at signup: two choices — **"I need care" (patient)** and **"I'm a nurse"** —
  each leading to its own signup wizard.
- **Patient signup wizard** (multi-step with a progress indicator): basic info → **email OTP
  verification** → set password (with strength rules) → **medical profile** (allergies, chronic
  conditions, blood type, medications, etc.).
- **Nurse signup wizard** (KYC / verification-heavy): basic info → **ID / professional license
  capture** (front & back via camera) → **liveness selfie** → **review & submit**. After
  submitting, the nurse lands on a **"account under review / pending"** state until approved.
- **Password reset flow**: request via email → enter **OTP code** → set a new password.
- OTP screens use a dedicated multi-box input.

### Navigation shell
- A **bottom tab bar with 5 destinations**: **Home · Schedule · SOS · Payment · Profile**.
- The **SOS** entry is a prominent, raised **center button** with distinct emergency treatment.
- Tabs are **auth-guarded** — send the user to sign-in if their session is gone.
- The **Home** tab renders a **different experience for patients vs. nurses**.

### Patient home
- Header greeting + "Find a nurse".
- **Search bar** that filters services by name/description/category (clearable).
- **Service catalog** — ~16 care categories, each shown as an icon "medallion" with a price and
  duration; "see all / see less" toggle. Categories: Rehabilitation, IV Therapy (Perfusion),
  Vaccination, Lab Tests, Consultation, Maternity, Pediatric, Medication, Wound Care, Elderly
  Care, Dialysis, Respiratory, Post-Op Care, Injection, Palliative, Nutrition. Each has a name,
  description, price (~$35–$120), duration (15–240 min), and tags.
- Tapping a service opens the **booking flow**. Empty state when search matches nothing.

### Nurse home
- **Requests**: pending appointments with no nurse assigned — the nurse can **Accept**,
  **Decline**, or **self-assign** an unassigned appointment (shows patient, service, date/time,
  avatar).
- **Upcoming appointments**: confirmed jobs assigned to this nurse, sorted by datetime.
- Skeleton loaders while loading, toasts on accept/decline, pull-to-refresh.

### Booking flow
Two modes: **standard** (from a service) and **emergency** (from SOS).
- Shows service summary, tags (chips), and price/estimate.
- **Duration picker**: 30 min / 1 h / 1 h 30 / 2 h (adjusts the price).
- **Date & time** selection with available slots.
- **Location**: choose from saved addresses or **add a new one via a full-screen Mapbox map
  picker** that centers on current GPS location and returns address + coordinates.
- Emergency mode adds a "Describe the emergency" field and an Emergency badge.
- CTA "Book Appointment" creates the appointment, then continues to tracking/payment.

### Schedule / appointments
- Two segmented views: **Upcoming** (with count) and **History** (with count).
- Upcoming = pending / confirmed / on-the-way / in-progress. History = completed / cancelled.
- History supports **status filters** (All / Completed / Cancelled / …) and a **payment filter**
  (paid / pending / failed).
- Each row shows the counterpart (patient or nurse), service, date/time, a color-toned **status
  badge**, and a **payment badge**. Tapping opens the live status tracker.

### Live appointment status tracker
- A **stepper** through the visit lifecycle:
  **Service Confirmation → Confirmed → On the Way → Task in Progress → Completed**, with a
  **Cancelled / Declined** branch. Each step has an icon, title, and status tone.
- Shows the current step, description, and — **for nurses** — a control to **advance the status**
  to the next stage (with success/error toasts).
- If pending: a "waiting for a nurse" hint. If confirmed & unpaid: a prompt to pay. Handles
  loading and back navigation.

### SOS / emergency (the standout feature)
- A **horizontal card carousel** (snap + scale/opacity animation, pagination dots) with **3
  full-bleed emergency cards**, each with an illustration:
  1. **Emergency nurse** — alert a nearby nurse for urgent medical help.
  2. **Ambulance** — request an ambulance from nearby hospitals.
  3. **Alert family** — notify all emergency contacts at once.
- Tapping a card fires the matching request **with the user's GPS location**.
- **"Alert family" requires saved emergency contacts** — if none exist, prompt the user to add
  them.
- After a nurse/ambulance request, switch to a **live emergency dispatch tracker** (status of the
  created emergency request) with a close action, plus a clear "sending…" loading state.

### Payments
- **Saved cards**: list with brand, last-4, expiry, a "Default" badge, "set as default", and
  delete; plus an **add-card form** (number, expiry MM/YY, CVV, cardholder) via Stripe.
- **Payment history**: amount, service, date, and a status badge (Completed / Pending / Failed)
  with a per-status icon.
- **Pay for a specific appointment** via Stripe (payment sheet / saved card / Google-Apple Pay).
- Empty states for "no cards saved" and "no payments yet".

### Profile
- Header with avatar, name, email, and a **role badge** (Nurse / Patient).
- Menu: **My Profile, Settings, Notifications, Transaction History, FAQ, About**, and **Logout**
  (clears session, returns to auth).
- Sub-sections: view/edit profile, change password, settings, privacy settings, notification
  preferences, transaction history, **emergency contacts** (list / add / edit), FAQ, about,
  nurse "pending review" state, and a public profile view for a given nurse.

### Cross-cutting
- **Notifications**: register the device and handle emergency/appointment push, deep-linking to
  the relevant screen.
- **i18n**: every user-facing string goes through a `t("namespace.key")` helper; ship English
  (default) and French; missing keys fall back to the key so nothing renders blank.
- **Light/dark** auto-switch; status bar, tab bar, Stripe, and Mapbox colors driven from the theme.
- **Loading**: prefer skeletons over spinners; use toasts for success/error.
- **Accessibility**: labels/roles on interactive elements, AA contrast, hit slop on small targets.
- **Config** (via app config): API base URL, Stripe publishable key, Mapbox token, merchant id.

---

## 5. Data & backend

The app talks to a REST backend (base URL from config) with a bearer token. Core entities:

- **User**: name, email, phone, `userType` ("patient" | "nurse"), token, avatar. Patients have a
  **medical profile**; nurses have **verification docs + approval status**.
- **Service** (catalog): name, description, category, price, duration, tags — the 16 categories above.
- **Appointment**: patient, nurse, service, date/time, duration, location (address + coordinates),
  optional description, **status** (`pending → confirmed → on-the-way → in-progress → completed`,
  plus `cancelled` / `declined`), and **payment status** (`pending | completed | failed`).
- **Emergency request**: nurse alert / ambulance / family alert, each with location and
  description; nurse & ambulance requests create a trackable emergency appointment.
- **Emergency contact**: name, relationship, phone (per user).
- **Payment / card**: saved Stripe cards + payment history records.

Provide a clean API layer plus hooks for the current user/session (with an `isLoggedIn` check and
refresh) and for notifications. Persist the onboarding flag and auth token securely.

---

## 6. Deliverable

A running Expo app implementing every feature in §4 on the stack in §2, with a **brand-new
original design system** per §3, wired to the data/backend in §5. Include the shared UI
primitives, both role-based home experiences, the full booking flow, the SOS emergency flow with
live tracking, schedule/history, Stripe payments, and the complete profile section. Verify it
type-checks, lints, and exports for iOS and Android.

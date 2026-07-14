/**
 * English strings (default locale). Keys are dot-namespaced by feature.
 * Add keys here as screens are localized; missing keys fall back to the key
 * itself so nothing ever renders blank.
 */
const en = {
  // Common actions
  "common.continue": "Continue",
  "common.next": "Next",
  "common.back": "Back",
  "common.cancel": "Cancel",
  "common.save": "Save",
  "common.done": "Done",
  "common.edit": "Edit",
  "common.delete": "Delete",
  "common.retry": "Try again",
  "common.confirm": "Confirm",
  "common.skip": "Skip",
  "common.seeAll": "See all",
  "common.seeLess": "See less",
  "common.viewAll": "View all",
  "common.loading": "Loading…",
  "common.search": "Search",
  "common.optional": "Optional",
  "common.required": "Required",

  // Onboarding
  "onboarding.slide1.title": "Healthcare, anytime, anywhere",
  "onboarding.slide1.subtitle":
    "Get quality home healthcare services wherever you are — fast, simple, and reliable.",
  "onboarding.slide2.title": "Services made for you",
  "onboarding.slide2.subtitle":
    "Find personalized care options tailored to your health needs and daily schedule.",
  "onboarding.slide3.title": "Your well-being, our priority",
  "onboarding.slide3.subtitle":
    "Trusted professionals dedicated to your comfort, safety, and peace of mind.",
  "onboarding.getStarted": "Get started",
  "onboarding.exploreServices": "Explore our services",
  "onboarding.createAccount": "Create your account",
  "onboarding.haveAccount": "Already have an account?",
  "onboarding.logIn": "Log in",

  // Auth
  "auth.signIn.title": "Welcome back",
  "auth.signIn.subtitle": "Sign in to continue your care",
  "auth.email": "Email address",
  "auth.password": "Password",
  "auth.forgotPassword": "Forgot password?",
  "auth.noAccount": "Don't have an account?",
  "auth.createAccount": "Create account",
  "auth.chooseRole.title": "How would you like to join?",
  "auth.chooseRole.subtitle": "Choose the option that describes you",
  "auth.chooseRole.patient": "I need care",
  "auth.chooseRole.patientDesc": "Book trusted nurses for at-home care",
  "auth.chooseRole.nurse": "I'm a nurse",
  "auth.chooseRole.nurseDesc": "Offer your services to patients near you",

  // Tabs
  "tab.home": "Home",
  "tab.schedule": "Schedule",
  "tab.sos": "SOS",
  "tab.payment": "Payment",
  "tab.profile": "Profile",

  // Home
  "home.findNurse": "Find a nurse",
  "home.searchPlaceholder": "Search services",
  "home.ourServices": "Our services",
  "home.emptyResults": "No services match your search",

  // Emergency
  "sos.title": "Emergency",
  "sos.subtitle": "Get help fast — every second counts",
  "sos.nurseAlert": "Emergency nurse",
  "sos.ambulance": "Ambulance",
  "sos.alertFamily": "Alert family",

  // Services (localized display names, keyed by category)
  "service.reeducation": "Rehabilitation",
  "service.perfusion": "IV Therapy",
  "service.vaccination": "Vaccination",
  "service.analyses": "Lab Tests",
  "service.consultation": "Consultation",
  "service.maternity": "Maternity",
  "service.pediatric": "Pediatric",
  "service.medication": "Medication",
  "service.wound-care": "Wound Care",
  "service.elderly-care": "Elderly Care",
  "service.dialysis": "Dialysis",
  "service.respiratory": "Respiratory",
  "service.post-op-care": "Post-Op Care",
  "service.injection": "Injection",
  "service.palliative": "Palliative",
  "service.nutrition": "Nutrition",
};

export default en;
export type TranslationKey = keyof typeof en;

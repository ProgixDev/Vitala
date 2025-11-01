export interface MenuItem {
  id: string;
  label: string;
  route: string;
  icon: string;
  iconType?: "ionicons" | "materialicons";
}

export const menuItems: MenuItem[] = [
  {
    id: "home",
    label: "Home",
    route: "/home",
    icon: "home-outline",
    iconType: "ionicons",
  },
  {
    id: "schedules",
    label: "Schedules",
    route: "/schedules",
    icon: "calendar-outline",
    iconType: "ionicons",
  },
  {
    id: "family-members",
    label: "Family members",
    route: "/family-members",
    icon: "people-outline",
    iconType: "ionicons",
  },
  {
    id: "payments",
    label: "Payments",
    route: "/payments",
    icon: "card-outline",
    iconType: "ionicons",
  },
  {
    id: "medical-records",
    label: "Medical Records",
    route: "/medical-records",
    icon: "document-text-outline",
    iconType: "ionicons",
  },
  {
    id: "privacy-policy",
    label: "Privacy & Policy",
    route: "/privacy-policy",
    icon: "shield-checkmark-outline",
    iconType: "ionicons",
  },
  {
    id: "help-center",
    label: "Help Center",
    route: "/help-center",
    icon: "help-circle-outline",
    iconType: "ionicons",
  },
  {
    id: "settings",
    label: "Settings",
    route: "/settings",
    icon: "settings-outline",
    iconType: "ionicons",
  },
];

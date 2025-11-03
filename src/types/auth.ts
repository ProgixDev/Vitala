export type UserRole = "admin" | "patient" | "nurse";

export const USER_ROLES = {
  ADMIN: "admin",
  PATIENT: "patient",
  NURSE: "nurse",
} as const;

/**
 * User roles as issued by auth-service in the access-token `role` claim. Kept
 * as a local domain enum so this service owns its own vocabulary; the values
 * mirror auth-service's `UserRole`.
 */
export enum UserRole {
  CUSTOMER = "CUSTOMER",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
}

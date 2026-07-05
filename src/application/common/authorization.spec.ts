import { assertOwnerOrAdmin, isAdminRole } from "./authorization";
import { UserRole } from "../../domain/auth/user-role.enum";
import { ForbiddenDomainException } from "../../domain/exceptions";

describe("authorization", () => {
  describe("isAdminRole", () => {
    it("is true for ADMIN and SUPER_ADMIN", () => {
      expect(isAdminRole(UserRole.ADMIN)).toBe(true);
      expect(isAdminRole(UserRole.SUPER_ADMIN)).toBe(true);
    });
    it("is false for CUSTOMER", () => {
      expect(isAdminRole(UserRole.CUSTOMER)).toBe(false);
    });
  });

  describe("assertOwnerOrAdmin", () => {
    it("allows the owner", () => {
      expect(() =>
        assertOwnerOrAdmin("cust-1", "cust-1", UserRole.CUSTOMER),
      ).not.toThrow();
    });

    it("allows an admin acting on someone else's resource", () => {
      expect(() =>
        assertOwnerOrAdmin("cust-1", "admin-9", UserRole.ADMIN),
      ).not.toThrow();
      expect(() =>
        assertOwnerOrAdmin("cust-1", "admin-9", UserRole.SUPER_ADMIN),
      ).not.toThrow();
    });

    it("forbids a customer accessing another customer's resource (IDOR)", () => {
      expect(() =>
        assertOwnerOrAdmin("cust-1", "cust-2", UserRole.CUSTOMER),
      ).toThrow(ForbiddenDomainException);
    });
  });
});

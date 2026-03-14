import type { User } from "@/types/domain";
import { AuthenticationError, type AuthProvider } from "./auth-provider";

/**
 * SSO Authentication Provider (STUB)
 *
 * This is a placeholder for production SSO integration.
 *
 * IMPLEMENTATION GUIDE:
 * 1. Install authentication library (NextAuth.js, Auth0, Okta, etc.)
 * 2. Implement getCurrentUser() to fetch from session
 * 3. Extract role from ID token claims or user groups
 * 4. Implement isAuthenticated() to check session validity
 *
 * EXAMPLE with NextAuth.js:
 * ```typescript
 * import { getServerSession } from "next-auth";
 * import { authOptions } from "@/app/api/auth/[...nextauth]/route";
 *
 * export class SSOAuthProvider implements AuthProvider {
 *   async getCurrentUser(): Promise<User> {
 *     const session = await getServerSession(authOptions);
 *     if (!session?.user) {
 *       throw new AuthenticationError();
 *     }
 *     return {
 *       id: session.user.id,
 *       name: session.user.name,
 *       email: session.user.email,
 *       role: extractRoleFromClaims(session.user)
 *     };
 *   }
 * }
 * ```
 *
 * See docs/PRODUCTION_ROADMAP.md Phase 1 for detailed implementation plan.
 */
export class SSOAuthProvider implements AuthProvider {
  async getCurrentUser(): Promise<User> {
    throw new Error(
      "SSOAuthProvider is not implemented. This is a stub for production integration. " +
        "See lib/auth/sso-auth-provider.ts and docs/PRODUCTION_ROADMAP.md for implementation guide."
    );
  }

  async isAuthenticated(): Promise<boolean> {
    throw new Error("SSOAuthProvider is not implemented");
  }
}

import "server-only";

import { mockAuthProvider } from "@/lib/auth/mock-auth-provider";
import type { AuthProvider } from "@/lib/auth/auth-provider";
import type { Role, User } from "@/types/domain";

/**
 * Current authentication provider
 *
 * ⚠️ MVP CONFIGURATION: Using MockAuthProvider
 *
 * To enable production SSO/OIDC:
 * 1. Implement SSOAuthProvider (see lib/auth/sso-auth-provider.ts)
 * 2. Replace mockAuthProvider with ssoAuthProvider
 * 3. Update environment configuration
 *
 * See docs/PRODUCTION_ROADMAP.md Phase 1 for migration plan.
 */
const authProvider: AuthProvider = mockAuthProvider;

/**
 * Get the current session role
 *
 * ⚠️ MVP IMPLEMENTATION: Returns fixed role from environment variable
 *
 * In production, this will return the authenticated user's role from SSO/OIDC session.
 *
 * @returns The current user's role
 */
export function getSessionRole(): Role {
  const userOrPromise = authProvider.getCurrentUser();
  // MockAuthProvider returns User synchronously; future SSO providers may return Promise<User>
  // For MVP, we expect synchronous User. Production SSO migration will require async handling.
  const user: User = userOrPromise instanceof Promise
    ? (() => { throw new Error("Unexpected async auth provider. SSO migration required."); })()
    : userOrPromise;
  return user.role;
}

/**
 * Get the current session user
 *
 * ⚠️ MVP IMPLEMENTATION: Returns mock user based on environment role
 *
 * In production, this will return the authenticated user from SSO/OIDC session.
 *
 * @returns The current authenticated user
 */
export function getSessionUser(): User {
  const userOrPromise = authProvider.getCurrentUser();
  // MockAuthProvider returns User synchronously; future SSO providers may return Promise<User>
  // For MVP, we expect synchronous User. Production SSO migration will require async handling.
  const user: User = userOrPromise instanceof Promise
    ? (() => { throw new Error("Unexpected async auth provider. SSO migration required."); })()
    : userOrPromise;
  return user;
}

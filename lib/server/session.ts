import "server-only";

import { env } from "@/lib/env";
import { userRepository } from "@/data/repositories/content-repository";

/**
 * ⚠️ WARNING: MVP IMPLEMENTATION ONLY ⚠️
 *
 * This is a mock authentication implementation for development and prototyping.
 *
 * CRITICAL LIMITATIONS:
 * 1. Returns the same role for ALL users (from environment variable)
 * 2. No actual user authentication or session management
 * 3. Cannot distinguish between different users
 * 4. NOT SUITABLE FOR PRODUCTION USE
 *
 * PRODUCTION REQUIREMENTS:
 * - Replace with SSO/OIDC integration (NextAuth.js, Auth0, Okta, etc.)
 * - Implement user-level session management
 * - Extract role from authenticated user's claims/groups
 * - Add CSRF protection and secure cookie handling
 *
 * See docs/PRODUCTION_ROADMAP.md Phase 1 for migration plan.
 *
 * @returns The fixed role from environment variable (NOT user-specific)
 */
export function getSessionRole() {
  return env.NAVIDESK_SESSION_ROLE;
}

/**
 * ⚠️ WARNING: MVP IMPLEMENTATION ONLY ⚠️
 *
 * This returns a mock user based on the environment role, not an actual authenticated user.
 * In production, this should return the authenticated user from the session.
 */
export function getSessionUser() {
  return userRepository.getCurrentUser(getSessionRole());
}

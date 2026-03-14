import { userRepository } from "@/data/repositories/content-repository";
import { env } from "@/lib/env";
import type { User } from "@/types/domain";
import type { AuthProvider } from "./auth-provider";

/**
 * Mock Authentication Provider
 *
 * ⚠️ FOR DEVELOPMENT/PROTOTYPING ONLY ⚠️
 *
 * This provider simulates authentication using environment variables.
 * It returns a fixed user based on NAVIDESK_SESSION_ROLE.
 *
 * LIMITATIONS:
 * - All users get the same role from environment
 * - No actual authentication
 * - No session management
 *
 * PRODUCTION:
 * Replace this with SSOAuthProvider that integrates with your identity provider.
 */
export class MockAuthProvider implements AuthProvider {
  getCurrentUser(): User {
    const role = env.NAVIDESK_SESSION_ROLE;
    return userRepository.getCurrentUser(role);
  }

  isAuthenticated(): boolean {
    // In mock mode, always consider authenticated
    return true;
  }
}

/**
 * Export singleton instance for use throughout the application
 */
export const mockAuthProvider = new MockAuthProvider();

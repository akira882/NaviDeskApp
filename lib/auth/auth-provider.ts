import type { User } from "@/types/domain";

/**
 * Authentication Provider Interface
 *
 * This interface defines the contract for authentication providers.
 * Different implementations can be swapped based on environment:
 * - Development: MockAuthProvider (environment variable based)
 * - Production: SSOAuthProvider (NextAuth.js, Auth0, Okta, etc.)
 */
export interface AuthProvider {
  /**
   * Get the currently authenticated user
   * @returns The authenticated user with their role
   * @throws Error if no user is authenticated
   */
  getCurrentUser(): Promise<User> | User;

  /**
   * Check if a user is currently authenticated
   * @returns true if a user is authenticated, false otherwise
   */
  isAuthenticated(): Promise<boolean> | boolean;
}

/**
 * Authentication error thrown when operations require authentication
 */
export class AuthenticationError extends Error {
  constructor(message: string = "Authentication required") {
    super(message);
    this.name = "AuthenticationError";
  }
}

/**
 * Authorization error thrown when user lacks required permissions
 */
export class AuthorizationError extends Error {
  constructor(message: string = "Insufficient permissions") {
    super(message);
    this.name = "AuthorizationError";
  }
}

import "server-only";

import { env } from "@/lib/env";
import { userRepository } from "@/data/repositories/content-repository";

export function getSessionRole() {
  return env.NAVIDESK_SESSION_ROLE;
}

export function getSessionUser() {
  return userRepository.getCurrentUser(getSessionRole());
}

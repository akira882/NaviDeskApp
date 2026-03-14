import { mockGuideProvider } from "@/lib/ai/providers/mock-guide-provider";
import type { AiResponse, Category, PortalContentState, Role } from "@/types/domain";

type GuideRequest = {
  question: string;
  role: Role;
  state: PortalContentState;
  categories: Category[];
};

/**
 * Provides AI-guided answers based on internal content
 * Currently uses mock provider; future implementations will integrate server-side Gemini API
 */
export function answerGuide(request: GuideRequest): AiResponse {
  return mockGuideProvider(request);
}

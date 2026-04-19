import { mockGuideProvider } from "@/lib/ai/providers/mock-guide-provider";
import { bedrockGuideProvider } from "@/lib/ai/providers/bedrock-guide-provider";
import { geminiGuideProvider } from "@/lib/ai/providers/gemini-guide-provider";
import { env } from "@/lib/env";
import type { AiResponse, Category, PortalContentState, Role } from "@/types/domain";

type GuideRequest = {
  question: string;
  role: Role;
  state: PortalContentState;
  categories: Category[];
};

/**
 * Provides AI-guided answers based on internal content (synchronous)
 * Currently uses mock provider for client-side use
 */
export function answerGuide(request: GuideRequest): AiResponse {
  return mockGuideProvider(request);
}

/**
 * Provides AI-guided answers based on internal content (async, server-side only)
 * Selects provider based on NAVIDESK_AI_PROVIDER environment variable
 * IMPORTANT: This function uses server-side credentials and MUST NOT be called from client components
 */
export async function answerGuideAsync(request: GuideRequest): Promise<AiResponse> {
  const provider = env.NAVIDESK_AI_PROVIDER;

  try {
    switch (provider) {
      case "bedrock":
        return await bedrockGuideProvider(request);
      case "gemini":
        return await geminiGuideProvider(request);
      case "mock":
      default:
        return mockGuideProvider(request);
    }
  } catch (error) {
    console.error(`AI guide provider "${provider}" failed. Falling back to mock guide provider.`, error);
    return mockGuideProvider(request);
  }
}

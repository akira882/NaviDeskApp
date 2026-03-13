import { mockGuideProvider } from "@/lib/ai/providers/mock-guide-provider";
import type { AiResponse, Category, PortalContentState, Role } from "@/types/domain";

export type GuideProviderName = "mock" | "gemini";

type GuideRequest = {
  question: string;
  role: Role;
  state: PortalContentState;
  categories: Category[];
};

export function answerGuide(request: GuideRequest, provider: GuideProviderName = "mock"): AiResponse {
  if (provider === "gemini") {
    // Gemini API key は将来サーバー側実装で接続する前提。
    // 現段階では社内コンテンツ根拠の mock provider に自動フォールバックする。
    return mockGuideProvider(request);
  }

  return mockGuideProvider(request);
}

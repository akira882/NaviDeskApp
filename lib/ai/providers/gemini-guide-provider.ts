import { GoogleGenerativeAI } from "@google/generative-ai";
import { searchContent } from "@/lib/content-helpers";
import { env } from "@/lib/env";
import { buildContextDocs, buildGuidePrompt } from "@/lib/ai/providers/guide-provider-shared";
import type { AiResponse, Category, PortalContentState, Role } from "@/types/domain";

/**
 * Gemini AI Guide Provider
 * IMPORTANT: This provider uses GEMINI_API_KEY and MUST only run on the server side.
 * Never expose API keys to the browser.
 */
export async function geminiGuideProvider(params: {
  question: string;
  role: Role;
  state: PortalContentState;
  categories: Category[];
}): Promise<AiResponse> {
  if (!env.GEMINI_API_KEY) {
    return {
      mode: "fallback",
      message: "AI案内が設定されていません。GEMINI_API_KEY を環境変数に設定してください。",
      suggestions: []
    };
  }

  const suggestions = searchContent(params.state, params.categories, params.question, params.role);

  if (suggestions.length === 0) {
    return {
      mode: "fallback",
      message:
        "社内記事とFAQから根拠を見つけられませんでした。制度や手順を推測せず、通常検索候補のみ提示します。",
      suggestions: []
    };
  }

  const top = suggestions.slice(0, 3);

  if (top[0].score < 10) {
    return {
      mode: "fallback",
      message: "根拠が弱いため、断定回答は避けます。関連度の高い記事とFAQを確認してください。",
      suggestions: top
    };
  }

  const contextDocs = buildContextDocs(top, params.state);
  const prompt = buildGuidePrompt(contextDocs, params.question);

  try {
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent(prompt);
    const aiAnswer = result.response.text();

    if (!aiAnswer) {
      return {
        mode: "fallback",
        message: "AI応答を取得できませんでした。関連度の高い記事とFAQを確認してください。",
        suggestions: top
      };
    }

    return {
      mode: "answer",
      answer: aiAnswer,
      citations: top
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    return {
      mode: "fallback",
      message: "AI案内の取得中にエラーが発生しました。根拠候補から直接確認してください。",
      suggestions: top
    };
  }
}

import { searchContent } from "@/lib/content-helpers";
import type { AiResponse, Category, PortalContentState, Role } from "@/types/domain";

/**
 * Generate answer from article/FAQ content without hallucination
 * Extracts relevant information from the top matching content
 */
function generateAnswerFromContent(params: {
  question: string;
  topResults: Array<{ id: string; type: "article" | "faq"; title: string }>;
  state: PortalContentState;
}): string {
  const { topResults, state } = params;
  const primaryResult = topResults[0];

  if (primaryResult.type === "article") {
    const article = state.articles.find((a) => a.id === primaryResult.id);
    if (!article) {
      return `「${primaryResult.title}」に関連情報があります。詳細は記事本文をご確認ください。`;
    }

    // Extract key points from article content (first few steps if numbered list exists)
    const contentLines = article.content.split("\n").filter((line) => line.trim());
    const numberedSteps = contentLines.filter((line) => /^\d+\./.test(line.trim()));

    if (numberedSteps.length > 0) {
      // Show first 3-4 steps as a summary
      const summary = numberedSteps.slice(0, Math.min(4, numberedSteps.length)).join("\n");
      const hasMore = numberedSteps.length > 4;

      return `「${article.title}」の手順に従ってください：

${summary}${hasMore ? "\n\n※ 続きの手順は記事本文をご確認ください。" : ""}

詳細は記事本文で確認してください。`;
    }

    // If no numbered list, return summary
    return `「${article.title}」が該当します。

${article.summary}

詳細な手順は記事本文をご確認ください。`;
  }

  if (primaryResult.type === "faq") {
    const faq = state.faqs.find((f) => f.id === primaryResult.id);
    if (!faq) {
      return `「${primaryResult.title}」に関連情報があります。詳細はFAQをご確認ください。`;
    }

    return `FAQ「${faq.question}」より：

${faq.answer}`;
  }

  return `「${primaryResult.title}」に関連情報があります。詳細をご確認ください。`;
}

export function mockGuideProvider(params: {
  question: string;
  role: Role;
  state: PortalContentState;
  categories: Category[];
}): AiResponse {
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

  // Lower threshold for strong match (improved scoring gives higher scores)
  const hasStrongMatch = top[0].score >= 10;

  if (!hasStrongMatch) {
    return {
      mode: "fallback",
      message: "根拠が弱いため、断定回答は避けます。関連度の高い記事とFAQを確認してください。",
      suggestions: top
    };
  }

  // Generate answer from actual content without hallucination
  const answer = generateAnswerFromContent({
    question: params.question,
    topResults: top,
    state: params.state
  });

  return {
    mode: "answer",
    answer,
    citations: top
  };
}

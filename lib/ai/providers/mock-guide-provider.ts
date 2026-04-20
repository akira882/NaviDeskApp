import { searchContent } from "@/lib/content-helpers";
import { GUIDE_STRONG_MATCH_THRESHOLD } from "@/lib/ai/providers/guide-provider-shared";
import type { AiResponse, Category, PortalContentState, Role, Article, FAQ } from "@/types/domain";

/**
 * Analyze question pattern to determine response style
 */
function analyzeQuestion(question: string) {
  const lowerQ = question.toLowerCase();

  // Pattern 1: Asking for procedure/method
  if (lowerQ.includes("方法") || lowerQ.includes("手順") || lowerQ.includes("やり方")) {
    return { type: "procedure" as const, style: "step-by-step" as const };
  }

  // Pattern 2: Asking for reason/background
  if (lowerQ.includes("なぜ") || lowerQ.includes("理由") || lowerQ.includes("どうして")) {
    return { type: "reason" as const, style: "explanation" as const };
  }

  // Pattern 3: Asking for definition/overview
  if (lowerQ.includes("とは") || lowerQ.includes("について") || lowerQ.includes("説明")) {
    return { type: "definition" as const, style: "overview" as const };
  }

  // Default
  return { type: "general" as const, style: "informative" as const };
}

/**
 * Extract topic from question
 */
function extractTopic(question: string): string {
  const patterns = [
    /(.+?)について/,
    /(.+?)の(方法|手順|やり方)/,
    /(.+?)を教えて/,
    /(.+?)は\?*/
  ];

  for (const pattern of patterns) {
    const match = question.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  return "";
}

/**
 * Generate intro based on topic and question type
 */
function generateIntro(topic: string, type: string): string {
  if (!topic) {
    return "ご質問の内容について説明します。";
  }

  switch (type) {
    case "procedure":
      return `${topic}の手順について説明します。`;
    case "definition":
      return `${topic}について説明します。`;
    case "reason":
      return `${topic}について、背景を説明します。`;
    default:
      return `${topic}に関する情報をご案内します。`;
  }
}

/**
 * Convert numbered steps to natural language
 */
function convertStepsToNatural(steps: string[]): string {
  return steps
    .slice(0, 4) // First 4 steps
    .map((step, i) => {
      const text = step.replace(/^\d+\.\s*/, "");
      const connector = i === 0 ? "まず、" : i === steps.length - 1 ? "最後に、" : "次に、";
      return connector + text;
    })
    .join("\n\n");
}

/**
 * Convert content to natural language
 */
function convertContentToNatural(content: string): string {
  const lines = content.split("\n").filter((line) => line.trim());

  // Detect numbered list
  const numberedSteps = lines.filter((line) => /^\d+\./.test(line.trim()));

  if (numberedSteps.length > 0) {
    return convertStepsToNatural(numberedSteps);
  } else {
    // Return first few lines for non-procedural content
    return lines.slice(0, 3).join("\n\n");
  }
}

/**
 * Generate footer with source attribution
 */
function generateFooter(sourceTitle: string): string {
  return `この情報は「${sourceTitle}」に基づいています。詳細な内容や追加の注意事項については、記事本文をご確認ください。`;
}

/**
 * Generate natural language answer from article content
 */
function generateAnswerFromArticle(params: {
  question: string;
  article: Article;
}): string {
  const { question, article } = params;
  const questionPattern = analyzeQuestion(question);
  const topic = extractTopic(question) || article.title;

  const intro = generateIntro(topic, questionPattern.type);
  const body = convertContentToNatural(article.content);
  const footer = generateFooter(article.title);

  return `${intro}\n\n${body}\n\n${footer}`;
}

/**
 * Generate natural language answer from FAQ content
 */
function generateAnswerFromFAQ(faq: FAQ): string {
  return `ご質問の件について、以下の通りご案内します。\n\n【${faq.question}】\n\n${faq.answer}\n\nさらに詳しい情報が必要な場合は、関連する記事もご確認ください。`;
}

/**
 * Generate answer from article/FAQ content without hallucination
 * Extracts relevant information from the top matching content
 */
function generateAnswerFromContent(params: {
  question: string;
  topResults: Array<{ id: string; type: "article" | "faq"; title: string }>;
  state: PortalContentState;
}): string {
  const { question, topResults, state } = params;
  const primaryResult = topResults[0];

  if (primaryResult.type === "article") {
    const article = state.articles.find((a) => a.id === primaryResult.id);
    if (!article) {
      return `「${primaryResult.title}」に関連情報があります。詳細は記事本文をご確認ください。`;
    }

    return generateAnswerFromArticle({ question, article });
  }

  if (primaryResult.type === "faq") {
    const faq = state.faqs.find((f) => f.id === primaryResult.id);
    if (!faq) {
      return `「${primaryResult.title}」に関連情報があります。詳細はFAQをご確認ください。`;
    }

    return generateAnswerFromFAQ(faq);
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

  const hasStrongMatch = top[0].score >= GUIDE_STRONG_MATCH_THRESHOLD;

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

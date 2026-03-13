import { searchContent } from "@/lib/content-helpers";
import type { AiResponse, Category, PortalContentState, Role } from "@/types/domain";

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
  const hasStrongMatch = top[0].score >= 2;

  if (!hasStrongMatch) {
    return {
      mode: "fallback",
      message: "根拠が弱いため、断定回答は避けます。関連度の高い記事とFAQを確認してください。",
      suggestions: top
    };
  }

  return {
    mode: "answer",
    answer: `質問に近い社内情報を確認したところ、「${top[0].title}」を起点に確認するのが最短です。${top
      .map((item) => `${item.categoryName}の${item.type === "article" ? "記事" : "FAQ"}「${item.title}」`)
      .join("、")}が関連します。制度や手順の最終判断は各記事本文の記載を優先してください。`,
    citations: top
  };
}

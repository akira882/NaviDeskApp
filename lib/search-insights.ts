import { scoreText } from "@/lib/utils";
import type { Announcement, Article, FAQ, SearchLog } from "@/types/domain";

type SearchTheme = ReturnType<typeof import("@/lib/content-helpers").listFailedSearchThemes>[number];

export type SearchImprovementCandidate = {
  query: string;
  count: number;
  surface: SearchLog["surface"];
  lastSearchedAt: string;
  recommendation: string;
  matchedContentTitle: string | null;
};

export function listSearchImprovementCandidates(params: {
  failedThemes: SearchTheme[];
  articles: Article[];
  faqs: FAQ[];
  announcements: Announcement[];
}) {
  return params.failedThemes.map((theme) => {
    const candidates = [
      ...params.articles.map((article) => ({
        title: article.title,
        score: scoreText(theme.query, `${article.title} ${article.summary} ${article.tags.join(" ")} ${article.content}`)
      })),
      ...params.faqs.map((faq) => ({
        title: faq.question,
        score: scoreText(theme.query, `${faq.question} ${faq.answer} ${faq.tags.join(" ")}`)
      })),
      ...params.announcements.map((announcement) => ({
        title: announcement.title,
        score: scoreText(theme.query, `${announcement.title} ${announcement.body}`)
      }))
    ].sort((a, b) => b.score - a.score);

    const matched = candidates[0] && candidates[0].score > 0 ? candidates[0] : null;

    return {
      query: theme.query,
      count: theme.count,
      surface: theme.surface,
      lastSearchedAt: theme.lastSearchedAt,
      matchedContentTitle: matched?.title ?? null,
      recommendation: matched
        ? `既存コンテンツ「${matched.title}」のタイトル・要約・タグを補強してください。`
        : "新しい FAQ または記事を追加してください。"
    } satisfies SearchImprovementCandidate;
  });
}

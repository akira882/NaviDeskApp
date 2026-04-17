import { formatDate } from "@/lib/utils";
import type { Announcement, Article, FAQ } from "@/types/domain";

export type FeedbackFlagItem = {
  id: string;
  kind: "article" | "faq";
  title: string;
  helpfulCount: number;
  notHelpfulCount: number;
  notHelpfulRate: number;
};

export function listFeedbackFlaggedItems(params: { articles: Article[]; faqs: FAQ[] }): FeedbackFlagItem[] {
  const MIN_VOTES = 5;
  const FLAG_THRESHOLD = 0.3;

  const items: FeedbackFlagItem[] = [
    ...params.articles
      .filter((a) => {
        const total = a.helpfulCount + a.notHelpfulCount;
        return total >= MIN_VOTES && a.notHelpfulCount / total >= FLAG_THRESHOLD;
      })
      .map((a) => ({
        id: a.id,
        kind: "article" as const,
        title: a.title,
        helpfulCount: a.helpfulCount,
        notHelpfulCount: a.notHelpfulCount,
        notHelpfulRate: a.notHelpfulCount / (a.helpfulCount + a.notHelpfulCount)
      })),
    ...params.faqs
      .filter((f) => {
        const total = f.helpfulCount + f.notHelpfulCount;
        return total >= MIN_VOTES && f.notHelpfulCount / total >= FLAG_THRESHOLD;
      })
      .map((f) => ({
        id: f.id,
        kind: "faq" as const,
        title: f.question,
        helpfulCount: f.helpfulCount,
        notHelpfulCount: f.notHelpfulCount,
        notHelpfulRate: f.notHelpfulCount / (f.helpfulCount + f.notHelpfulCount)
      }))
  ];

  return items.sort((a, b) => b.notHelpfulRate - a.notHelpfulRate);
}

type GovernedContent = Article | FAQ | Announcement;

export type FreshnessStatus = "healthy" | "warning" | "critical";

export type ReviewPriorityItem = {
  id: string;
  kind: "article" | "faq" | "announcement";
  title: string;
  updatedAt: string;
  daysSinceUpdate: number;
  freshnessStatus: FreshnessStatus;
  freshnessLabel: string;
};

function diffDays(fromIso: string, now = new Date()) {
  const from = new Date(fromIso);
  const diff = now.getTime() - from.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export function getFreshnessStatus(updatedAt: string, now = new Date()): FreshnessStatus {
  const days = diffDays(updatedAt, now);

  if (days >= 45) {
    return "critical";
  }

  if (days >= 30) {
    return "warning";
  }

  return "healthy";
}

export function getFreshnessLabel(updatedAt: string, now = new Date()) {
  const status = getFreshnessStatus(updatedAt, now);
  const days = diffDays(updatedAt, now);

  if (status === "critical") {
    return `要更新 (${days}日経過)`;
  }

  if (status === "warning") {
    return `更新注意 (${days}日経過)`;
  }

  return `更新良好 (${days}日経過)`;
}

export function listReviewPriorityItems(
  params: {
    articles: Article[];
    faqs: FAQ[];
    announcements: Announcement[];
  },
  now = new Date()
): ReviewPriorityItem[] {
  const items: ReviewPriorityItem[] = [
    ...params.articles.map((article) => mapItem("article", article, article.title, now)),
    ...params.faqs.map((faq) => mapItem("faq", faq, faq.question, now)),
    ...params.announcements.map((announcement) => mapItem("announcement", announcement, announcement.title, now))
  ];

  return items
    .filter((item) => item.freshnessStatus !== "healthy")
    .sort((a, b) => b.daysSinceUpdate - a.daysSinceUpdate);
}

function mapItem(
  kind: ReviewPriorityItem["kind"],
  item: GovernedContent,
  title: string,
  now: Date
): ReviewPriorityItem {
  const daysSinceUpdate = diffDays(item.updatedAt, now);

  return {
    id: item.id,
    kind,
    title,
    updatedAt: item.updatedAt,
    daysSinceUpdate,
    freshnessStatus: getFreshnessStatus(item.updatedAt, now),
    freshnessLabel: getFreshnessLabel(item.updatedAt, now)
  };
}

export function getFreshnessTone(status: FreshnessStatus) {
  return (
    {
      healthy: "bg-accent-green/10 text-accent-green border-accent-green/20",
      warning: "bg-accent-gold/10 text-accent-gold border-accent-gold/20",
      critical: "bg-accent-crimson/10 text-accent-crimson border-accent-crimson/20"
    } satisfies Record<FreshnessStatus, string>
  )[status];
}

export function getFreshnessSummary(updatedAt: string, now = new Date()) {
  return `${getFreshnessLabel(updatedAt, now)} / 最終更新: ${formatDate(updatedAt)}`;
}

import { formatDate } from "@/lib/utils";
import type { Announcement, Article, FAQ } from "@/types/domain";

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
      healthy: "bg-emerald-50 text-emerald-800",
      warning: "bg-amber-50 text-amber-900",
      critical: "bg-rose-50 text-rose-800"
    } satisfies Record<FreshnessStatus, string>
  )[status];
}

export function getFreshnessSummary(updatedAt: string, now = new Date()) {
  return `${getFreshnessLabel(updatedAt, now)} / 最終更新: ${formatDate(updatedAt)}`;
}

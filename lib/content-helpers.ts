import type { Route } from "next";
import { canAccess } from "@/lib/roles";
import { filterSearchLogsByRetention, sanitizeSearchQuery } from "@/lib/search-log-sanitizer";
import { scoreText } from "@/lib/utils";
import type {
  ApprovalStatus,
  Announcement,
  AuditAction,
  AuditLog,
  Category,
  PortalContentState,
  QuickLink,
  Role,
  SearchLog,
  SearchResult,
  User
} from "@/types/domain";

function isApprovedForReaders(status: { status: "draft" | "published"; approvalStatus: ApprovalStatus }) {
  return status.status === "published" && status.approvalStatus === "approved";
}

export function createInitialPortalState(seed: PortalContentState): PortalContentState {
  return {
    articles: [...seed.articles],
    faqs: [...seed.faqs],
    announcements: [...seed.announcements],
    quickLinks: [...seed.quickLinks],
    auditLogs: [...seed.auditLogs],
    searchLogs: filterSearchLogsByRetention([...seed.searchLogs])
  };
}

export function listVisibleArticles(state: PortalContentState, role: Role) {
  return state.articles.filter(
    (article) => isApprovedForReaders(article) && canAccess(role, article.visibilityRole)
  );
}

export function listRecentVisibleArticles(state: PortalContentState, role: Role, limit = 4) {
  return [...listVisibleArticles(state, role)]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, limit);
}

export function listVisibleFaqs(state: PortalContentState, role: Role) {
  return state.faqs.filter((faq) => isApprovedForReaders(faq) && canAccess(role, faq.visibilityRole));
}

export function listPublishedAnnouncements(state: PortalContentState): Announcement[] {
  return [...state.announcements]
    .filter((announcement) => isApprovedForReaders(announcement))
    .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
}

export function listSortedQuickLinks(state: PortalContentState): QuickLink[] {
  return [...state.quickLinks].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function searchFaqs(
  state: PortalContentState,
  params: { query?: string; categoryId?: string; role: Role }
) {
  const query = params.query?.trim().toLowerCase() ?? "";

  return listVisibleFaqs(state, params.role).filter((faq) => {
    const matchesCategory = params.categoryId ? faq.categoryId === params.categoryId : true;
    const haystack = [faq.question, faq.answer, faq.tags.join(" ")].join(" ").toLowerCase();
    const matchesQuery = query ? haystack.includes(query) : true;
    return matchesCategory && matchesQuery;
  });
}

export function searchContent(
  state: PortalContentState,
  categories: Category[],
  query: string,
  role: Role
): SearchResult[] {
  if (!query.trim()) {
    return [];
  }

  const categoryNameById = new Map(categories.map((category) => [category.id, category.name]));
  const articleResults = listVisibleArticles(state, role).map((article) => ({
    id: article.id,
    type: "article" as const,
    title: article.title,
    summary: article.summary,
    href: `/articles/${article.slug}` as Route<`/articles/${string}`>,
    categoryName: categoryNameById.get(article.categoryId) ?? "未分類",
    score: scoreText(
      query,
      `${article.title} ${article.summary} ${article.tags.join(" ")} ${article.content}`
    )
  }));

  const faqResults = listVisibleFaqs(state, role).map((faq) => ({
    id: faq.id,
    type: "faq" as const,
    title: faq.question,
    summary: faq.answer,
    href: `/faq?highlight=${faq.id}` as Route<`/faq?highlight=${string}`>,
    categoryName: categoryNameById.get(faq.categoryId) ?? "未分類",
    score: scoreText(query, `${faq.question} ${faq.answer} ${faq.tags.join(" ")}`)
  }));

  return [...articleResults, ...faqResults]
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}

export function buildAuditLog(params: {
  actorId: string;
  action: AuditAction;
  targetType: AuditLog["targetType"];
  targetId: string;
  detail: string;
}): AuditLog {
  return {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    actorId: params.actorId,
    action: params.action,
    targetType: params.targetType,
    targetId: params.targetId,
    timestamp: new Date().toISOString(),
    detail: params.detail
  };
}

export function resolveActorId(users: User[], role: Role) {
  return users.find((user) => user.role === role)?.id ?? users[0]?.id ?? "u-system";
}

export function createSearchLog(params: {
  query: string;
  surface: SearchLog["surface"];
  resultCount: number;
}): SearchLog {
  const { sanitized } = sanitizeSearchQuery(params.query.trim());
  return {
    id: `search-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    query: sanitized,
    surface: params.surface,
    resultCount: params.resultCount,
    timestamp: new Date().toISOString()
  };
}

export function listFailedSearchThemes(searchLogs: SearchLog[]) {
  const failedLogs = searchLogs.filter((log) => log.resultCount === 0 && log.query.trim().length >= 2);
  const counts = new Map<string, { query: string; count: number; lastSearchedAt: string; surface: SearchLog["surface"] }>();

  failedLogs.forEach((log) => {
    const key = log.query.trim().toLowerCase();
    const current = counts.get(key);

    if (!current) {
      counts.set(key, {
        query: log.query.trim(),
        count: 1,
        lastSearchedAt: log.timestamp,
        surface: log.surface
      });
      return;
    }

    counts.set(key, {
      query: current.query,
      count: current.count + 1,
      lastSearchedAt: current.lastSearchedAt > log.timestamp ? current.lastSearchedAt : log.timestamp,
      surface: current.lastSearchedAt > log.timestamp ? current.surface : log.surface
    });
  });

  return [...counts.values()].sort((a, b) => b.count - a.count || b.lastSearchedAt.localeCompare(a.lastSearchedAt));
}

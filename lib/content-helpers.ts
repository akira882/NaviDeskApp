import type { Route } from "next";
import { canAccess } from "@/lib/roles";
import type {
  Announcement,
  AuditAction,
  AuditLog,
  Category,
  PortalContentState,
  QuickLink,
  Role,
  SearchResult,
  User
} from "@/types/domain";

function scoreText(query: string, text: string) {
  const tokens = query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  return tokens.reduce((score, token) => score + (text.toLowerCase().includes(token) ? 1 : 0), 0);
}

export function createInitialPortalState(seed: PortalContentState): PortalContentState {
  return {
    articles: [...seed.articles],
    faqs: [...seed.faqs],
    announcements: [...seed.announcements],
    quickLinks: [...seed.quickLinks],
    auditLogs: [...seed.auditLogs]
  };
}

export function listVisibleArticles(state: PortalContentState, role: Role) {
  return state.articles.filter(
    (article) => article.status === "published" && canAccess(role, article.visibilityRole)
  );
}

export function listVisibleFaqs(state: PortalContentState, role: Role) {
  return state.faqs.filter((faq) => faq.status === "published" && canAccess(role, faq.visibilityRole));
}

export function listPublishedAnnouncements(state: PortalContentState): Announcement[] {
  return [...state.announcements]
    .filter((announcement) => announcement.status === "published")
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

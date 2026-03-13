import type { Route } from "next";

export const roles = ["employee", "manager", "editor", "admin"] as const;
export type Role = (typeof roles)[number];

export const contentStatuses = ["draft", "published"] as const;
export type ContentStatus = (typeof contentStatuses)[number];

export type User = {
  id: string;
  name: string;
  department: string;
  role: Role;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
  ownerDepartment: string;
};

export type Article = {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  summary: string;
  content: string;
  tags: string[];
  status: ContentStatus;
  visibilityRole: Role;
  relatedArticleIds: string[];
  updatedAt: string;
  updatedBy: string;
};

export type FAQ = {
  id: string;
  question: string;
  answer: string;
  categoryId: string;
  tags: string[];
  status: ContentStatus;
  visibilityRole: Role;
  updatedAt: string;
  updatedBy: string;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  status: ContentStatus;
  publishedAt: string | null;
  updatedAt: string;
  updatedBy: string;
};

export type QuickLink = {
  id: string;
  label: string;
  url: string;
  categoryId: string;
  description: string;
  sortOrder: number;
};

export type AuditAction = "create" | "update" | "delete" | "publish-toggle";

export type AuditLog = {
  id: string;
  actorId: string;
  action: AuditAction;
  targetType: "article" | "faq" | "announcement" | "quick-link";
  targetId: string;
  timestamp: string;
  detail: string;
};

export type SearchResult = {
  id: string;
  type: "article" | "faq";
  title: string;
  summary: string;
  href: Route<`/articles/${string}` | `/faq?highlight=${string}`>;
  categoryName: string;
  score: number;
};

export type AiResponse =
  | {
      mode: "answer";
      answer: string;
      citations: SearchResult[];
    }
  | {
      mode: "fallback";
      message: string;
      suggestions: SearchResult[];
    };

export type PortalContentState = {
  articles: Article[];
  faqs: FAQ[];
  announcements: Announcement[];
  quickLinks: QuickLink[];
  auditLogs: AuditLog[];
};

"use client";

/**
 * ⚠️ WARNING: MVP IMPLEMENTATION ONLY ⚠️
 *
 * This is a client-side state management for prototyping content management UI.
 *
 * CRITICAL LIMITATIONS:
 * 1. All changes are stored in browser memory only (lost on page reload)
 * 2. Changes are not persisted to database
 * 3. Changes are not shared across users or browser tabs
 * 4. Audit logs are generated client-side (tamperable)
 * 5. NOT SUITABLE FOR PRODUCTION USE
 *
 * PRODUCTION REQUIREMENTS:
 * - Replace with Server Actions or API Routes
 * - Persist changes to database
 * - Generate audit logs server-side
 * - Implement optimistic UI updates
 * - Add transaction support
 *
 * See docs/PRODUCTION_ROADMAP.md Phase 2 & 3 for migration plan.
 */

import { createContext, useContext, useMemo, useState } from "react";

import { users } from "@/data/mock/seed";
import { buildAuditLog, resolveActorId } from "@/lib/content-helpers";
import type {
  Announcement,
  Article,
  AuditAction,
  AuditLog,
  ContentStatus,
  FAQ,
  PortalContentState,
  QuickLink,
  Role
} from "@/types/domain";

type ArticleInput = Omit<Article, "id" | "updatedAt" | "updatedBy">;
type FaqInput = Omit<FAQ, "id" | "updatedAt" | "updatedBy">;
type AnnouncementInput = Omit<Announcement, "id" | "updatedAt" | "updatedBy" | "publishedAt"> & {
  publishedAt?: string | null;
};
type QuickLinkInput = Omit<QuickLink, "id">;

type ContentContextValue = PortalContentState & {
  addArticle: (input: ArticleInput, role: Role) => void;
  updateArticle: (id: string, input: ArticleInput, role: Role) => void;
  deleteArticle: (id: string, role: Role) => void;
  toggleArticleStatus: (id: string, role: Role) => void;
  addFaq: (input: FaqInput, role: Role) => void;
  updateFaq: (id: string, input: FaqInput, role: Role) => void;
  deleteFaq: (id: string, role: Role) => void;
  toggleFaqStatus: (id: string, role: Role) => void;
  addAnnouncement: (input: AnnouncementInput, role: Role) => void;
  updateAnnouncement: (id: string, input: AnnouncementInput, role: Role) => void;
  deleteAnnouncement: (id: string, role: Role) => void;
  toggleAnnouncementStatus: (id: string, role: Role) => void;
  addQuickLink: (input: QuickLinkInput, role: Role) => void;
  updateQuickLink: (id: string, input: QuickLinkInput, role: Role) => void;
  deleteQuickLink: (id: string, role: Role) => void;
};

type MutationDetails = {
  action: AuditAction;
  targetType: AuditLog["targetType"];
  targetId: string;
  detail: string;
};

type MutationResult = {
  nextState: PortalContentState;
  audit: MutationDetails;
} | null;

const ContentContext = createContext<ContentContextValue | null>(null);

function appendLog(state: PortalContentState, log: AuditLog) {
  return {
    ...state,
    auditLogs: [log, ...state.auditLogs]
  };
}

function addAuditFields<T extends { updatedAt: string; updatedBy: string }>(
  item: Omit<T, "updatedAt" | "updatedBy">,
  timestamp: string,
  actorId: string
): T {
  return {
    ...item,
    updatedAt: timestamp,
    updatedBy: actorId
  } as T;
}

function createMutation(nextState: PortalContentState, audit: MutationDetails): MutationResult {
  return { nextState, audit };
}

function updateAnnouncementPublishedAt(
  currentPublishedAt: string | null,
  nextStatus: ContentStatus,
  requestedPublishedAt: string | null | undefined,
  timestamp: string
) {
  if (nextStatus !== "published") {
    return null;
  }

  return requestedPublishedAt ?? currentPublishedAt ?? timestamp;
}

export function ContentProvider({
  children,
  initialState
}: {
  children: React.ReactNode;
  initialState: PortalContentState;
}) {
  const [state, setState] = useState<PortalContentState>(initialState);

  const value = useMemo<ContentContextValue>(() => {
    const actorIdForRole = (role: Role) => resolveActorId(users, role);

    function runMutation(role: Role, buildNextState: (current: PortalContentState, timestamp: string, actorId: string) => MutationResult) {
      setState((current) => {
        const timestamp = new Date().toISOString();
        const actorId = actorIdForRole(role);
        const result = buildNextState(current, timestamp, actorId);

        if (!result) {
          return current;
        }

        return appendLog(
          result.nextState,
          buildAuditLog({
            actorId,
            action: result.audit.action,
            targetType: result.audit.targetType,
            targetId: result.audit.targetId,
            detail: result.audit.detail
          })
        );
      });
    }

    return {
      ...state,
      addArticle(input, role) {
        runMutation(role, (current, timestamp, actorId) => {
          const id = `art-${Date.now()}`;
          const nextArticle = addAuditFields<Article>({ ...input, id }, timestamp, actorId);

          return createMutation(
            {
              ...current,
              articles: [nextArticle, ...current.articles]
            },
            {
              action: "create",
              targetType: "article",
              targetId: id,
              detail: `記事「${input.title}」を作成`
            }
          );
        });
      },
      updateArticle(id, input, role) {
        runMutation(role, (current, timestamp, actorId) =>
          createMutation(
            {
              ...current,
              articles: current.articles.map((article) =>
                article.id === id ? addAuditFields<Article>({ ...article, ...input }, timestamp, actorId) : article
              )
            },
            {
              action: "update",
              targetType: "article",
              targetId: id,
              detail: `記事「${input.title}」を更新`
            }
          )
        );
      },
      deleteArticle(id, role) {
        runMutation(role, (current) => {
          const title = current.articles.find((article) => article.id === id)?.title ?? id;

          return createMutation(
            {
              ...current,
              articles: current.articles.filter((article) => article.id !== id)
            },
            {
              action: "delete",
              targetType: "article",
              targetId: id,
              detail: `記事「${title}」を削除`
            }
          );
        });
      },
      toggleArticleStatus(id, role) {
        runMutation(role, (current, timestamp, actorId) => {
          const target = current.articles.find((article) => article.id === id);

          if (!target) {
            return null;
          }

          const nextStatus = target.status === "published" ? "draft" : "published";

          return createMutation(
            {
              ...current,
              articles: current.articles.map((article) =>
                article.id === id
                  ? addAuditFields<Article>({ ...article, status: nextStatus }, timestamp, actorId)
                  : article
              )
            },
            {
              action: "publish-toggle",
              targetType: "article",
              targetId: id,
              detail: `記事「${target.title}」を${nextStatus === "published" ? "公開" : "下書き化"}`
            }
          );
        });
      },
      addFaq(input, role) {
        runMutation(role, (current, timestamp, actorId) => {
          const id = `faq-${Date.now()}`;
          const nextFaq = addAuditFields<FAQ>({ ...input, id }, timestamp, actorId);

          return createMutation(
            {
              ...current,
              faqs: [nextFaq, ...current.faqs]
            },
            {
              action: "create",
              targetType: "faq",
              targetId: id,
              detail: `FAQ「${input.question}」を作成`
            }
          );
        });
      },
      updateFaq(id, input, role) {
        runMutation(role, (current, timestamp, actorId) =>
          createMutation(
            {
              ...current,
              faqs: current.faqs.map((faq) =>
                faq.id === id ? addAuditFields<FAQ>({ ...faq, ...input }, timestamp, actorId) : faq
              )
            },
            {
              action: "update",
              targetType: "faq",
              targetId: id,
              detail: `FAQ「${input.question}」を更新`
            }
          )
        );
      },
      deleteFaq(id, role) {
        runMutation(role, (current) => {
          const question = current.faqs.find((faq) => faq.id === id)?.question ?? id;

          return createMutation(
            {
              ...current,
              faqs: current.faqs.filter((faq) => faq.id !== id)
            },
            {
              action: "delete",
              targetType: "faq",
              targetId: id,
              detail: `FAQ「${question}」を削除`
            }
          );
        });
      },
      toggleFaqStatus(id, role) {
        runMutation(role, (current, timestamp, actorId) => {
          const target = current.faqs.find((faq) => faq.id === id);

          if (!target) {
            return null;
          }

          const nextStatus = target.status === "published" ? "draft" : "published";

          return createMutation(
            {
              ...current,
              faqs: current.faqs.map((faq) =>
                faq.id === id ? addAuditFields<FAQ>({ ...faq, status: nextStatus }, timestamp, actorId) : faq
              )
            },
            {
              action: "publish-toggle",
              targetType: "faq",
              targetId: id,
              detail: `FAQ「${target.question}」を${nextStatus === "published" ? "公開" : "下書き化"}`
            }
          );
        });
      },
      addAnnouncement(input, role) {
        runMutation(role, (current, timestamp, actorId) => {
          const id = `ann-${Date.now()}`;
          const nextAnnouncement = addAuditFields<Announcement>(
            {
              ...input,
              id,
              publishedAt: updateAnnouncementPublishedAt(null, input.status, input.publishedAt, timestamp)
            },
            timestamp,
            actorId
          );

          return createMutation(
            {
              ...current,
              announcements: [nextAnnouncement, ...current.announcements]
            },
            {
              action: "create",
              targetType: "announcement",
              targetId: id,
              detail: `お知らせ「${input.title}」を作成`
            }
          );
        });
      },
      updateAnnouncement(id, input, role) {
        runMutation(role, (current, timestamp, actorId) =>
          createMutation(
            {
              ...current,
              announcements: current.announcements.map((announcement) =>
                announcement.id === id
                  ? addAuditFields<Announcement>(
                      {
                        ...announcement,
                        ...input,
                        publishedAt: updateAnnouncementPublishedAt(
                          announcement.publishedAt,
                          input.status,
                          input.publishedAt,
                          timestamp
                        )
                      },
                      timestamp,
                      actorId
                    )
                  : announcement
              )
            },
            {
              action: "update",
              targetType: "announcement",
              targetId: id,
              detail: `お知らせ「${input.title}」を更新`
            }
          )
        );
      },
      deleteAnnouncement(id, role) {
        runMutation(role, (current) => {
          const title = current.announcements.find((announcement) => announcement.id === id)?.title ?? id;

          return createMutation(
            {
              ...current,
              announcements: current.announcements.filter((announcement) => announcement.id !== id)
            },
            {
              action: "delete",
              targetType: "announcement",
              targetId: id,
              detail: `お知らせ「${title}」を削除`
            }
          );
        });
      },
      toggleAnnouncementStatus(id, role) {
        runMutation(role, (current, timestamp, actorId) => {
          const target = current.announcements.find((announcement) => announcement.id === id);

          if (!target) {
            return null;
          }

          const nextStatus = target.status === "published" ? "draft" : "published";

          return createMutation(
            {
              ...current,
              announcements: current.announcements.map((announcement) =>
                announcement.id === id
                  ? addAuditFields<Announcement>(
                      {
                        ...announcement,
                        status: nextStatus,
                        publishedAt: updateAnnouncementPublishedAt(
                          announcement.publishedAt,
                          nextStatus,
                          undefined,
                          timestamp
                        )
                      },
                      timestamp,
                      actorId
                    )
                  : announcement
              )
            },
            {
              action: "publish-toggle",
              targetType: "announcement",
              targetId: id,
              detail: `お知らせ「${target.title}」を${nextStatus === "published" ? "公開" : "下書き化"}`
            }
          );
        });
      },
      addQuickLink(input, role) {
        runMutation(role, (current) => {
          const id = `ql-${Date.now()}`;
          const nextQuickLink: QuickLink = { ...input, id };

          return createMutation(
            {
              ...current,
              quickLinks: [...current.quickLinks, nextQuickLink]
            },
            {
              action: "create",
              targetType: "quick-link",
              targetId: id,
              detail: `クイックリンク「${input.label}」を作成`
            }
          );
        });
      },
      updateQuickLink(id, input, role) {
        runMutation(role, (current) =>
          createMutation(
            {
              ...current,
              quickLinks: current.quickLinks.map((quickLink) =>
                quickLink.id === id ? { ...quickLink, ...input } : quickLink
              )
            },
            {
              action: "update",
              targetType: "quick-link",
              targetId: id,
              detail: `クイックリンク「${input.label}」を更新`
            }
          )
        );
      },
      deleteQuickLink(id, role) {
        runMutation(role, (current) => {
          const label = current.quickLinks.find((quickLink) => quickLink.id === id)?.label ?? id;

          return createMutation(
            {
              ...current,
              quickLinks: current.quickLinks.filter((quickLink) => quickLink.id !== id)
            },
            {
              action: "delete",
              targetType: "quick-link",
              targetId: id,
              detail: `クイックリンク「${label}」を削除`
            }
          );
        });
      }
    };
  }, [state]);

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const context = useContext(ContentContext);

  if (!context) {
    throw new Error("useContent must be used within ContentProvider");
  }

  return context;
}

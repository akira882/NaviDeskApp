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

import { buildAuditLog, createSearchLog } from "@/lib/content-helpers";
import { canApproveContent, canManageContent } from "@/lib/roles";
import type {
  Announcement,
  ApprovalStatus,
  Article,
  AuditAction,
  AuditLog,
  FAQ,
  PortalContentState,
  QuickLink,
  Role,
  SearchSurface
} from "@/types/domain";

type ReviewFields = {
  approvalStatus: ApprovalStatus;
  reviewComment: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
};

type ArticleInput = Omit<
  Article,
  "id" | "updatedAt" | "updatedBy" | "approvalStatus" | "reviewComment" | "reviewedAt" | "reviewedBy" | "helpfulCount" | "notHelpfulCount" | "ownerId"
>;
type FaqInput = Omit<
  FAQ,
  "id" | "updatedAt" | "updatedBy" | "approvalStatus" | "reviewComment" | "reviewedAt" | "reviewedBy" | "helpfulCount" | "notHelpfulCount"
>;
type AnnouncementInput = Omit<
  Announcement,
  "id" | "updatedAt" | "updatedBy" | "publishedAt" | "approvalStatus" | "reviewComment" | "reviewedAt" | "reviewedBy"
> & {
  publishedAt?: string | null;
};
type QuickLinkInput = Omit<QuickLink, "id">;

type ContentContextValue = PortalContentState & {
  addArticle: (input: ArticleInput, role: Role) => void;
  updateArticle: (id: string, input: ArticleInput, role: Role) => void;
  deleteArticle: (id: string, role: Role) => void;
  toggleArticleStatus: (id: string, role: Role) => void;
  requestArticleReview: (id: string, role: Role) => void;
  approveArticle: (id: string, comment: string | null, role: Role) => void;
  rejectArticle: (id: string, comment: string | null, role: Role) => void;
  addFaq: (input: FaqInput, role: Role) => void;
  updateFaq: (id: string, input: FaqInput, role: Role) => void;
  deleteFaq: (id: string, role: Role) => void;
  toggleFaqStatus: (id: string, role: Role) => void;
  requestFaqReview: (id: string, role: Role) => void;
  approveFaq: (id: string, comment: string | null, role: Role) => void;
  rejectFaq: (id: string, comment: string | null, role: Role) => void;
  addAnnouncement: (input: AnnouncementInput, role: Role) => void;
  updateAnnouncement: (id: string, input: AnnouncementInput, role: Role) => void;
  deleteAnnouncement: (id: string, role: Role) => void;
  toggleAnnouncementStatus: (id: string, role: Role) => void;
  requestAnnouncementReview: (id: string, role: Role) => void;
  approveAnnouncement: (id: string, comment: string | null, role: Role) => void;
  rejectAnnouncement: (id: string, comment: string | null, role: Role) => void;
  addQuickLink: (input: QuickLinkInput, role: Role) => void;
  updateQuickLink: (id: string, input: QuickLinkInput, role: Role) => void;
  deleteQuickLink: (id: string, role: Role) => void;
  recordSearch: (params: { query: string; surface: SearchSurface; resultCount: number }) => void;
  markArticleHelpful: (id: string, helpful: boolean) => void;
  markFaqHelpful: (id: string, helpful: boolean) => void;
};

type ActorIdByRole = Record<Role, string>;

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

type ReviewableBase = {
  id: string;
  status: "draft" | "published";
  approvalStatus: ApprovalStatus;
  reviewComment: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  updatedAt: string;
  updatedBy: string;
};

type ReviewableTargetType = "article" | "faq" | "announcement";

const ContentContext = createContext<ContentContextValue | null>(null);

function appendLog(state: PortalContentState, log: AuditLog) {
  return {
    ...state,
    auditLogs: [log, ...state.auditLogs]
  };
}

function createMutation(nextState: PortalContentState, audit: MutationDetails): MutationResult {
  return { nextState, audit };
}

function applyReviewFields<T extends ReviewableBase>(
  item: Omit<T, keyof ReviewFields | "updatedAt" | "updatedBy"> & Partial<ReviewFields>,
  review: ReviewFields,
  timestamp: string,
  actorId: string
): T {
  return {
    ...item,
    ...review,
    updatedAt: timestamp,
    updatedBy: actorId
  } as T;
}

function getReviewFieldsForSave(
  role: Role,
  status: "draft" | "published",
  timestamp: string,
  actorId: string
): ReviewFields {
  if (canApproveContent(role) && status === "published") {
    return {
      approvalStatus: "approved",
      reviewComment: "管理者が公開状態で保存",
      reviewedAt: timestamp,
      reviewedBy: actorId
    };
  }

  return {
    approvalStatus: "not_requested",
    reviewComment: null,
    reviewedAt: null,
    reviewedBy: null
  };
}

function getPendingReviewFields(): ReviewFields {
  return {
    approvalStatus: "pending",
    reviewComment: null,
    reviewedAt: null,
    reviewedBy: null
  };
}

function getApprovedReviewFields(comment: string | null, timestamp: string, actorId: string): ReviewFields {
  return {
    approvalStatus: "approved",
    reviewComment: comment,
    reviewedAt: timestamp,
    reviewedBy: actorId
  };
}

function getRejectedReviewFields(comment: string | null, timestamp: string, actorId: string): ReviewFields {
  return {
    approvalStatus: "changes_requested",
    reviewComment: comment,
    reviewedAt: timestamp,
    reviewedBy: actorId
  };
}

function updateAnnouncementPublishedAt(
  status: "draft" | "published",
  approvalStatus: ApprovalStatus,
  currentPublishedAt: string | null,
  requestedPublishedAt: string | null | undefined,
  timestamp: string
) {
  if (status !== "published" || approvalStatus !== "approved") {
    return null;
  }

  return requestedPublishedAt ?? currentPublishedAt ?? timestamp;
}

export function ContentProvider({
  children,
  initialState,
  actorIdByRole
}: {
  children: React.ReactNode;
  initialState: PortalContentState;
  actorIdByRole: ActorIdByRole;
}) {
  const [state, setState] = useState<PortalContentState>(initialState);

  const value = useMemo<ContentContextValue>(() => {
    const actorIdForRole = (role: Role) => actorIdByRole[role] ?? "u-system";

    function runMutation(
      role: Role,
      buildNextState: (current: PortalContentState, timestamp: string, actorId: string) => MutationResult
    ) {
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

    function requestReview<T extends ReviewableBase & { title?: string; question?: string }>(
      role: Role,
      collection: keyof Pick<PortalContentState, "articles" | "faqs" | "announcements">,
      targetType: ReviewableTargetType,
      id: string,
      getLabel: (item: T) => string
    ) {
      runMutation(role, (current, timestamp, actorId) => {
        if (!canManageContent(role) || canApproveContent(role)) {
          return null;
        }

        const items = current[collection] as unknown as T[];
        const target = items.find((item) => item.id === id);

        if (!target) {
          return null;
        }

        const nextItems = items.map((item) =>
          item.id === id
            ? applyReviewFields<T>(
                {
                  ...item,
                  status: "published"
                },
                getPendingReviewFields(),
                timestamp,
                actorId
              )
            : item
        );

        return createMutation(
          {
            ...current,
            [collection]: nextItems
          },
          {
            action: "submit-review",
            targetType,
            targetId: id,
            detail: `${targetType === "announcement" ? "お知らせ" : targetType === "faq" ? "FAQ" : "記事"}「${getLabel(target)}」を承認申請`
          }
        );
      });
    }

    function reviewItem<T extends ReviewableBase & { title?: string; question?: string; publishedAt?: string | null }>(
      role: Role,
      collection: keyof Pick<PortalContentState, "articles" | "faqs" | "announcements">,
      targetType: ReviewableTargetType,
      id: string,
      comment: string | null,
      approve: boolean,
      getLabel: (item: T) => string
    ) {
      runMutation(role, (current, timestamp, actorId) => {
        if (!canApproveContent(role)) {
          return null;
        }

        const items = current[collection] as unknown as T[];
        const target = items.find((item) => item.id === id);

        if (!target) {
          return null;
        }

        const reviewFields = approve
          ? getApprovedReviewFields(comment, timestamp, actorId)
          : getRejectedReviewFields(comment, timestamp, actorId);

        const nextItems = items.map((item) => {
          if (item.id !== id) {
            return item;
          }

          const nextStatus = approve ? "published" : "draft";

          if (targetType === "announcement") {
            const announcement = item as unknown as Announcement;

            return applyReviewFields<Announcement>(
              {
                ...announcement,
                status: nextStatus,
                publishedAt: updateAnnouncementPublishedAt(
                  nextStatus,
                  reviewFields.approvalStatus,
                  announcement.publishedAt,
                  announcement.publishedAt,
                  timestamp
                )
              },
              reviewFields,
              timestamp,
              actorId
            ) as unknown as T;
          }

          return applyReviewFields<T>(
            {
              ...item,
              status: nextStatus
            },
            reviewFields,
            timestamp,
            actorId
          );
        });

        return createMutation(
          {
            ...current,
            [collection]: nextItems
          },
          {
            action: approve ? "approve" : "reject",
            targetType,
            targetId: id,
            detail: `${targetType === "announcement" ? "お知らせ" : targetType === "faq" ? "FAQ" : "記事"}「${getLabel(target)}」を${approve ? "承認" : "差し戻し"}`
          }
        );
      });
    }

    return {
      ...state,
      addArticle(input, role) {
        runMutation(role, (current, timestamp, actorId) => {
          if (!canManageContent(role)) {
            return null;
          }

          const id = `art-${Date.now()}`;
          const nextStatus = canApproveContent(role) ? input.status : "draft";
          const nextArticle = applyReviewFields<Article>(
            {
              ...input,
              id,
              status: nextStatus,
              helpfulCount: 0,
              notHelpfulCount: 0,
              ownerId: actorId
            },
            getReviewFieldsForSave(role, nextStatus, timestamp, actorId),
            timestamp,
            actorId
          );

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
        runMutation(role, (current, timestamp, actorId) => {
          if (!canManageContent(role)) {
            return null;
          }

          return createMutation(
            {
              ...current,
              articles: current.articles.map((article) => {
                if (article.id !== id) {
                  return article;
                }

                const nextStatus = canApproveContent(role) ? input.status : "draft";

                return applyReviewFields<Article>(
                  {
                    ...article,
                    ...input,
                    status: nextStatus
                  },
                  getReviewFieldsForSave(role, nextStatus, timestamp, actorId),
                  timestamp,
                  actorId
                );
              })
            },
            {
              action: "update",
              targetType: "article",
              targetId: id,
              detail: `記事「${input.title}」を更新`
            }
          );
        });
      },
      deleteArticle(id, role) {
        runMutation(role, (current) => {
          if (!canManageContent(role)) {
            return null;
          }

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
          if (!canApproveContent(role)) {
            return null;
          }

          const target = current.articles.find((article) => article.id === id);

          if (!target) {
            return null;
          }

          const nextStatus = target.status === "published" ? "draft" : "published";
          const reviewFields = getReviewFieldsForSave(role, nextStatus, timestamp, actorId);

          return createMutation(
            {
              ...current,
              articles: current.articles.map((article) =>
                article.id === id
                  ? applyReviewFields<Article>(
                      {
                        ...article,
                        status: nextStatus
                      },
                      reviewFields,
                      timestamp,
                      actorId
                    )
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
      requestArticleReview(id, role) {
        requestReview<Article>(role, "articles", "article", id, (article) => article.title);
      },
      approveArticle(id, comment, role) {
        reviewItem<Article>(role, "articles", "article", id, comment, true, (article) => article.title);
      },
      rejectArticle(id, comment, role) {
        reviewItem<Article>(role, "articles", "article", id, comment, false, (article) => article.title);
      },
      addFaq(input, role) {
        runMutation(role, (current, timestamp, actorId) => {
          if (!canManageContent(role)) {
            return null;
          }

          const id = `faq-${Date.now()}`;
          const nextStatus = canApproveContent(role) ? input.status : "draft";
          const nextFaq = applyReviewFields<FAQ>(
            {
              ...input,
              id,
              status: nextStatus,
              helpfulCount: 0,
              notHelpfulCount: 0
            },
            getReviewFieldsForSave(role, nextStatus, timestamp, actorId),
            timestamp,
            actorId
          );

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
        runMutation(role, (current, timestamp, actorId) => {
          if (!canManageContent(role)) {
            return null;
          }

          return createMutation(
            {
              ...current,
              faqs: current.faqs.map((faq) => {
                if (faq.id !== id) {
                  return faq;
                }

                const nextStatus = canApproveContent(role) ? input.status : "draft";

                return applyReviewFields<FAQ>(
                  {
                    ...faq,
                    ...input,
                    status: nextStatus
                  },
                  getReviewFieldsForSave(role, nextStatus, timestamp, actorId),
                  timestamp,
                  actorId
                );
              })
            },
            {
              action: "update",
              targetType: "faq",
              targetId: id,
              detail: `FAQ「${input.question}」を更新`
            }
          );
        });
      },
      deleteFaq(id, role) {
        runMutation(role, (current) => {
          if (!canManageContent(role)) {
            return null;
          }

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
          if (!canApproveContent(role)) {
            return null;
          }

          const target = current.faqs.find((faq) => faq.id === id);

          if (!target) {
            return null;
          }

          const nextStatus = target.status === "published" ? "draft" : "published";
          const reviewFields = getReviewFieldsForSave(role, nextStatus, timestamp, actorId);

          return createMutation(
            {
              ...current,
              faqs: current.faqs.map((faq) =>
                faq.id === id
                  ? applyReviewFields<FAQ>(
                      {
                        ...faq,
                        status: nextStatus
                      },
                      reviewFields,
                      timestamp,
                      actorId
                    )
                  : faq
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
      requestFaqReview(id, role) {
        requestReview<FAQ>(role, "faqs", "faq", id, (faq) => faq.question);
      },
      approveFaq(id, comment, role) {
        reviewItem<FAQ>(role, "faqs", "faq", id, comment, true, (faq) => faq.question);
      },
      rejectFaq(id, comment, role) {
        reviewItem<FAQ>(role, "faqs", "faq", id, comment, false, (faq) => faq.question);
      },
      addAnnouncement(input, role) {
        runMutation(role, (current, timestamp, actorId) => {
          if (!canManageContent(role)) {
            return null;
          }

          const id = `ann-${Date.now()}`;
          const nextStatus = canApproveContent(role) ? input.status : "draft";
          const reviewFields = getReviewFieldsForSave(role, nextStatus, timestamp, actorId);
          const nextAnnouncement = applyReviewFields<Announcement>(
            {
              ...input,
              id,
              status: nextStatus,
              publishedAt: updateAnnouncementPublishedAt(
                nextStatus,
                reviewFields.approvalStatus,
                null,
                input.publishedAt,
                timestamp
              )
            },
            reviewFields,
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
        runMutation(role, (current, timestamp, actorId) => {
          if (!canManageContent(role)) {
            return null;
          }

          return createMutation(
            {
              ...current,
              announcements: current.announcements.map((announcement) => {
                if (announcement.id !== id) {
                  return announcement;
                }

                const nextStatus = canApproveContent(role) ? input.status : "draft";
                const reviewFields = getReviewFieldsForSave(role, nextStatus, timestamp, actorId);

                return applyReviewFields<Announcement>(
                  {
                    ...announcement,
                    ...input,
                    status: nextStatus,
                    publishedAt: updateAnnouncementPublishedAt(
                      nextStatus,
                      reviewFields.approvalStatus,
                      announcement.publishedAt,
                      input.publishedAt,
                      timestamp
                    )
                  },
                  reviewFields,
                  timestamp,
                  actorId
                );
              })
            },
            {
              action: "update",
              targetType: "announcement",
              targetId: id,
              detail: `お知らせ「${input.title}」を更新`
            }
          );
        });
      },
      deleteAnnouncement(id, role) {
        runMutation(role, (current) => {
          if (!canManageContent(role)) {
            return null;
          }

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
          if (!canApproveContent(role)) {
            return null;
          }

          const target = current.announcements.find((announcement) => announcement.id === id);

          if (!target) {
            return null;
          }

          const nextStatus = target.status === "published" ? "draft" : "published";
          const reviewFields = getReviewFieldsForSave(role, nextStatus, timestamp, actorId);

          return createMutation(
            {
              ...current,
              announcements: current.announcements.map((announcement) =>
                announcement.id === id
                  ? applyReviewFields<Announcement>(
                      {
                        ...announcement,
                        status: nextStatus,
                        publishedAt: updateAnnouncementPublishedAt(
                          nextStatus,
                          reviewFields.approvalStatus,
                          announcement.publishedAt,
                          announcement.publishedAt,
                          timestamp
                        )
                      },
                      reviewFields,
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
      requestAnnouncementReview(id, role) {
        requestReview<Announcement>(role, "announcements", "announcement", id, (announcement) => announcement.title);
      },
      approveAnnouncement(id, comment, role) {
        reviewItem<Announcement>(
          role,
          "announcements",
          "announcement",
          id,
          comment,
          true,
          (announcement) => announcement.title
        );
      },
      rejectAnnouncement(id, comment, role) {
        reviewItem<Announcement>(
          role,
          "announcements",
          "announcement",
          id,
          comment,
          false,
          (announcement) => announcement.title
        );
      },
      addQuickLink(input, role) {
        runMutation(role, (current) => {
          if (!canManageContent(role)) {
            return null;
          }

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
        runMutation(role, (current) => {
          if (!canManageContent(role)) {
            return null;
          }

          return createMutation(
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
          );
        });
      },
      deleteQuickLink(id, role) {
        runMutation(role, (current) => {
          if (!canManageContent(role)) {
            return null;
          }

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
      },
      recordSearch(params) {
        setState((current) => ({
          ...current,
          searchLogs: [createSearchLog(params), ...current.searchLogs].slice(0, 100)
        }));
      },
      markArticleHelpful(id, helpful) {
        setState((current) => ({
          ...current,
          articles: current.articles.map((article) =>
            article.id === id
              ? {
                  ...article,
                  helpfulCount: helpful ? article.helpfulCount + 1 : article.helpfulCount,
                  notHelpfulCount: helpful ? article.notHelpfulCount : article.notHelpfulCount + 1
                }
              : article
          )
        }));
      },
      markFaqHelpful(id, helpful) {
        setState((current) => ({
          ...current,
          faqs: current.faqs.map((faq) =>
            faq.id === id
              ? {
                  ...faq,
                  helpfulCount: helpful ? faq.helpfulCount + 1 : faq.helpfulCount,
                  notHelpfulCount: helpful ? faq.notHelpfulCount : faq.notHelpfulCount + 1
                }
              : faq
          )
        }));
      }
    };
  }, [actorIdByRole, state]);

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const context = useContext(ContentContext);

  if (!context) {
    throw new Error("useContent must be used within ContentProvider");
  }

  return context;
}

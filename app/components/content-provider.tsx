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
"use client";

import { createContext, useContext, useMemo, useState } from "react";

import { users } from "@/data/mock/seed";
import { buildAuditLog, resolveActorId } from "@/lib/content-helpers";
import type {
  Announcement,
  Article,
  FAQ,
  PortalContentState,
  QuickLink,
  Role
} from "@/types/domain";

type ContentContextValue = PortalContentState & {
  addArticle: (input: Omit<Article, "id" | "updatedAt" | "updatedBy">, role: Role) => void;
  updateArticle: (id: string, input: Omit<Article, "id" | "updatedAt" | "updatedBy">, role: Role) => void;
  deleteArticle: (id: string, role: Role) => void;
  toggleArticleStatus: (id: string, role: Role) => void;
  addFaq: (input: Omit<FAQ, "id" | "updatedAt" | "updatedBy">, role: Role) => void;
  updateFaq: (id: string, input: Omit<FAQ, "id" | "updatedAt" | "updatedBy">, role: Role) => void;
  deleteFaq: (id: string, role: Role) => void;
  toggleFaqStatus: (id: string, role: Role) => void;
  addAnnouncement: (
    input: Omit<Announcement, "id" | "updatedAt" | "updatedBy" | "publishedAt"> & {
      publishedAt?: string | null;
    },
    role: Role
  ) => void;
  updateAnnouncement: (
    id: string,
    input: Omit<Announcement, "id" | "updatedAt" | "updatedBy" | "publishedAt"> & {
      publishedAt?: string | null;
    },
    role: Role
  ) => void;
  deleteAnnouncement: (id: string, role: Role) => void;
  toggleAnnouncementStatus: (id: string, role: Role) => void;
  addQuickLink: (input: Omit<QuickLink, "id">, role: Role) => void;
  updateQuickLink: (id: string, input: Omit<QuickLink, "id">, role: Role) => void;
  deleteQuickLink: (id: string, role: Role) => void;
};

const ContentContext = createContext<ContentContextValue | null>(null);

function appendLog(state: PortalContentState, log: PortalContentState["auditLogs"][number]) {
  return {
    ...state,
    auditLogs: [log, ...state.auditLogs]
  };
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
    function actorId(role: Role) {
      return resolveActorId(users, role);
    }

    return {
      ...state,
      addArticle(input, role) {
        const id = `art-${Date.now()}`;
        const nextArticle: Article = {
          ...input,
          id,
          updatedAt: new Date().toISOString(),
          updatedBy: actorId(role)
        };

        setState((current) =>
          appendLog(
            {
              ...current,
              articles: [nextArticle, ...current.articles]
            },
            buildAuditLog({
              actorId: actorId(role),
              action: "create",
              targetType: "article",
              targetId: id,
              detail: `記事「${input.title}」を作成`
            })
          )
        );
      },
      updateArticle(id, input, role) {
        setState((current) =>
          appendLog(
            {
              ...current,
              articles: current.articles.map((article) =>
                article.id === id
                  ? { ...article, ...input, updatedAt: new Date().toISOString(), updatedBy: actorId(role) }
                  : article
              )
            },
            buildAuditLog({
              actorId: actorId(role),
              action: "update",
              targetType: "article",
              targetId: id,
              detail: `記事「${input.title}」を更新`
            })
          )
        );
      },
      deleteArticle(id, role) {
        const title = state.articles.find((article) => article.id === id)?.title ?? id;
        setState((current) =>
          appendLog(
            {
              ...current,
              articles: current.articles.filter((article) => article.id !== id)
            },
            buildAuditLog({
              actorId: actorId(role),
              action: "delete",
              targetType: "article",
              targetId: id,
              detail: `記事「${title}」を削除`
            })
          )
        );
      },
      toggleArticleStatus(id, role) {
        const target = state.articles.find((article) => article.id === id);
        if (!target) {
          return;
        }
        const nextStatus = target.status === "published" ? "draft" : "published";

        setState((current) =>
          appendLog(
            {
              ...current,
              articles: current.articles.map((article) =>
                article.id === id
                  ? { ...article, status: nextStatus, updatedAt: new Date().toISOString(), updatedBy: actorId(role) }
                  : article
              )
            },
            buildAuditLog({
              actorId: actorId(role),
              action: "publish-toggle",
              targetType: "article",
              targetId: id,
              detail: `記事「${target.title}」を${nextStatus === "published" ? "公開" : "下書き化"}`
            })
          )
        );
      },
      addFaq(input, role) {
        const id = `faq-${Date.now()}`;
        const nextFaq: FAQ = {
          ...input,
          id,
          updatedAt: new Date().toISOString(),
          updatedBy: actorId(role)
        };

        setState((current) =>
          appendLog(
            {
              ...current,
              faqs: [nextFaq, ...current.faqs]
            },
            buildAuditLog({
              actorId: actorId(role),
              action: "create",
              targetType: "faq",
              targetId: id,
              detail: `FAQ「${input.question}」を作成`
            })
          )
        );
      },
      updateFaq(id, input, role) {
        setState((current) =>
          appendLog(
            {
              ...current,
              faqs: current.faqs.map((faq) =>
                faq.id === id
                  ? { ...faq, ...input, updatedAt: new Date().toISOString(), updatedBy: actorId(role) }
                  : faq
              )
            },
            buildAuditLog({
              actorId: actorId(role),
              action: "update",
              targetType: "faq",
              targetId: id,
              detail: `FAQ「${input.question}」を更新`
            })
          )
        );
      },
      deleteFaq(id, role) {
        const question = state.faqs.find((faq) => faq.id === id)?.question ?? id;
        setState((current) =>
          appendLog(
            {
              ...current,
              faqs: current.faqs.filter((faq) => faq.id !== id)
            },
            buildAuditLog({
              actorId: actorId(role),
              action: "delete",
              targetType: "faq",
              targetId: id,
              detail: `FAQ「${question}」を削除`
            })
          )
        );
      },
      toggleFaqStatus(id, role) {
        const target = state.faqs.find((faq) => faq.id === id);
        if (!target) {
          return;
        }
        const nextStatus = target.status === "published" ? "draft" : "published";

        setState((current) =>
          appendLog(
            {
              ...current,
              faqs: current.faqs.map((faq) =>
                faq.id === id
                  ? { ...faq, status: nextStatus, updatedAt: new Date().toISOString(), updatedBy: actorId(role) }
                  : faq
              )
            },
            buildAuditLog({
              actorId: actorId(role),
              action: "publish-toggle",
              targetType: "faq",
              targetId: id,
              detail: `FAQ「${target.question}」を${nextStatus === "published" ? "公開" : "下書き化"}`
            })
          )
        );
      },
      addAnnouncement(input, role) {
        const id = `ann-${Date.now()}`;
        const nextAnnouncement: Announcement = {
          ...input,
          id,
          publishedAt: input.status === "published" ? input.publishedAt ?? new Date().toISOString() : null,
          updatedAt: new Date().toISOString(),
          updatedBy: actorId(role)
        };

        setState((current) =>
          appendLog(
            {
              ...current,
              announcements: [nextAnnouncement, ...current.announcements]
            },
            buildAuditLog({
              actorId: actorId(role),
              action: "create",
              targetType: "announcement",
              targetId: id,
              detail: `お知らせ「${input.title}」を作成`
            })
          )
        );
      },
      updateAnnouncement(id, input, role) {
        setState((current) =>
          appendLog(
            {
              ...current,
              announcements: current.announcements.map((announcement) =>
                announcement.id === id
                  ? {
                      ...announcement,
                      ...input,
                      publishedAt:
                        input.status === "published"
                          ? input.publishedAt ?? announcement.publishedAt ?? new Date().toISOString()
                          : null,
                      updatedAt: new Date().toISOString(),
                      updatedBy: actorId(role)
                    }
                  : announcement
              )
            },
            buildAuditLog({
              actorId: actorId(role),
              action: "update",
              targetType: "announcement",
              targetId: id,
              detail: `お知らせ「${input.title}」を更新`
            })
          )
        );
      },
      deleteAnnouncement(id, role) {
        const title = state.announcements.find((announcement) => announcement.id === id)?.title ?? id;
        setState((current) =>
          appendLog(
            {
              ...current,
              announcements: current.announcements.filter((announcement) => announcement.id !== id)
            },
            buildAuditLog({
              actorId: actorId(role),
              action: "delete",
              targetType: "announcement",
              targetId: id,
              detail: `お知らせ「${title}」を削除`
            })
          )
        );
      },
      toggleAnnouncementStatus(id, role) {
        const target = state.announcements.find((announcement) => announcement.id === id);
        if (!target) {
          return;
        }
        const nextStatus = target.status === "published" ? "draft" : "published";
        setState((current) =>
          appendLog(
            {
              ...current,
              announcements: current.announcements.map((announcement) =>
                announcement.id === id
                  ? {
                      ...announcement,
                      status: nextStatus,
                      publishedAt: nextStatus === "published" ? new Date().toISOString() : null,
                      updatedAt: new Date().toISOString(),
                      updatedBy: actorId(role)
                    }
                  : announcement
              )
            },
            buildAuditLog({
              actorId: actorId(role),
              action: "publish-toggle",
              targetType: "announcement",
              targetId: id,
              detail: `お知らせ「${target.title}」を${nextStatus === "published" ? "公開" : "下書き化"}`
            })
          )
        );
      },
      addQuickLink(input, role) {
        const id = `ql-${Date.now()}`;
        const nextQuickLink: QuickLink = { ...input, id };
        setState((current) =>
          appendLog(
            {
              ...current,
              quickLinks: [...current.quickLinks, nextQuickLink]
            },
            buildAuditLog({
              actorId: actorId(role),
              action: "create",
              targetType: "quick-link",
              targetId: id,
              detail: `クイックリンク「${input.label}」を作成`
            })
          )
        );
      },
      updateQuickLink(id, input, role) {
        setState((current) =>
          appendLog(
            {
              ...current,
              quickLinks: current.quickLinks.map((quickLink) =>
                quickLink.id === id ? { ...quickLink, ...input } : quickLink
              )
            },
            buildAuditLog({
              actorId: actorId(role),
              action: "update",
              targetType: "quick-link",
              targetId: id,
              detail: `クイックリンク「${input.label}」を更新`
            })
          )
        );
      },
      deleteQuickLink(id, role) {
        const label = state.quickLinks.find((quickLink) => quickLink.id === id)?.label ?? id;
        setState((current) =>
          appendLog(
            {
              ...current,
              quickLinks: current.quickLinks.filter((quickLink) => quickLink.id !== id)
            },
            buildAuditLog({
              actorId: actorId(role),
              action: "delete",
              targetType: "quick-link",
              targetId: id,
              detail: `クイックリンク「${label}」を削除`
            })
          )
        );
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

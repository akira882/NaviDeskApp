import "server-only";

import {
  announcements,
  articles,
  auditLogs,
  faqs,
  quickLinks,
  searchLogs
} from "@/data/mock/seed";
import { canAccess, canManageContent, canViewAuditLog } from "@/lib/roles";
import { createInitialPortalState } from "@/lib/content-helpers";
import type { PortalContentState, Role } from "@/types/domain";

function isApprovedForReaders(status: { status: "draft" | "published"; approvalStatus: "not_requested" | "pending" | "approved" | "changes_requested" }) {
  return status.status === "published" && status.approvalStatus === "approved";
}

function filterStateForReader(role: Role): PortalContentState {
  return createInitialPortalState({
    articles: articles.filter(
      (article) => isApprovedForReaders(article) && canAccess(role, article.visibilityRole)
    ),
    faqs: faqs.filter(
      (faq) => isApprovedForReaders(faq) && canAccess(role, faq.visibilityRole)
    ),
    announcements: announcements.filter((announcement) => isApprovedForReaders(announcement)),
    quickLinks,
    auditLogs: canViewAuditLog(role) ? auditLogs : [],
    searchLogs
  });
}

export function buildInitialStateForRole(role: Role): PortalContentState {
  if (canManageContent(role)) {
    return createInitialPortalState({
      articles,
      faqs,
      announcements,
      quickLinks,
      auditLogs: canViewAuditLog(role) ? auditLogs : [],
      searchLogs
    });
  }

  return filterStateForReader(role);
}

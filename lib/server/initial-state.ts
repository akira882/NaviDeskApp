import "server-only";

import {
  announcements,
  articles,
  auditLogs,
  faqs,
  quickLinks
} from "@/data/mock/seed";
import { canAccess, canManageContent, canViewAuditLog } from "@/lib/roles";
import { createInitialPortalState } from "@/lib/content-helpers";
import type { PortalContentState, Role } from "@/types/domain";

function filterStateForReader(role: Role): PortalContentState {
  return createInitialPortalState({
    articles: articles.filter(
      (article) => article.status === "published" && canAccess(role, article.visibilityRole)
    ),
    faqs: faqs.filter(
      (faq) => faq.status === "published" && canAccess(role, faq.visibilityRole)
    ),
    announcements: announcements.filter((announcement) => announcement.status === "published"),
    quickLinks,
    auditLogs: canViewAuditLog(role) ? auditLogs : []
  });
}

export function buildInitialStateForRole(role: Role): PortalContentState {
  if (canManageContent(role)) {
    return createInitialPortalState({
      articles,
      faqs,
      announcements,
      quickLinks,
      auditLogs: canViewAuditLog(role) ? auditLogs : []
    });
  }

  return filterStateForReader(role);
}

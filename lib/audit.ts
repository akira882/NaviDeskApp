import type { AuditAction, AuditLog } from "@/types/domain";

export function getAuditActionLabel(action: AuditAction) {
  return (
    {
      create: "作成",
      update: "更新",
      delete: "削除",
      "publish-toggle": "公開切替",
      "submit-review": "承認申請",
      approve: "承認",
      reject: "差し戻し"
    } satisfies Record<AuditAction, string>
  )[action];
}

export function getAuditTargetLabel(targetType: AuditLog["targetType"]) {
  return (
    {
      article: "記事",
      faq: "FAQ",
      announcement: "お知らせ",
      "quick-link": "クイックリンク"
    } satisfies Record<AuditLog["targetType"], string>
  )[targetType];
}

export function listAuditActionOptions() {
  return [
    "create",
    "update",
    "delete",
    "publish-toggle",
    "submit-review",
    "approve",
    "reject"
  ] satisfies AuditAction[];
}

export function listAuditTargetOptions() {
  return ["article", "faq", "announcement", "quick-link"] satisfies AuditLog["targetType"][];
}

export function listAuditLogsForTarget(
  logs: AuditLog[],
  targetType: AuditLog["targetType"],
  targetId: string,
  limit = 5
) {
  return logs
    .filter((log) => log.targetType === targetType && log.targetId === targetId)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, limit);
}

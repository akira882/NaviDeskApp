"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getAuditActionLabel } from "@/lib/audit";
import { getFreshnessLabel, getFreshnessStatus, getFreshnessTone } from "@/lib/content-governance";
import { formatDateTime } from "@/lib/utils";
import type { ApprovalStatus, AuditLog } from "@/types/domain";

function getApprovalLabel(status: ApprovalStatus) {
  return (
    {
      not_requested: "未申請",
      pending: "承認待ち",
      approved: "承認済み",
      changes_requested: "差し戻し"
    } satisfies Record<ApprovalStatus, string>
  )[status];
}

function getApprovalTone(status: ApprovalStatus) {
  return (
    {
      not_requested: "border-line-mid bg-surface-2 text-text-muted",
      pending: "border-accent-gold/25 bg-accent-gold/10 text-accent-gold",
      approved: "border-accent-green/25 bg-accent-green/10 text-accent-green",
      changes_requested: "border-accent-crimson/25 bg-accent-crimson/10 text-accent-crimson"
    } satisfies Record<ApprovalStatus, string>
  )[status];
}

export function ContentGovernanceCard({
  approvalStatus,
  reviewedAt,
  reviewerName,
  reviewComment,
  updatedAt,
  auditLogs
}: {
  approvalStatus: ApprovalStatus;
  reviewedAt: string | null;
  reviewerName: string | null;
  reviewComment: string | null;
  updatedAt: string;
  auditLogs: AuditLog[];
}) {
  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-text-primary sm:text-lg">運用・承認情報</h3>
          <div className="flex flex-wrap gap-2">
            <Badge className={getApprovalTone(approvalStatus)}>{getApprovalLabel(approvalStatus)}</Badge>
            <Badge className={getFreshnessTone(getFreshnessStatus(updatedAt))}>{getFreshnessLabel(updatedAt)}</Badge>
          </div>
        </div>

        <div className="space-y-1 text-sm text-text-secondary">
          <p>レビュー日時: {formatDateTime(reviewedAt)}</p>
          <p>レビュー担当: {reviewerName ?? "未設定"}</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-text-primary">レビューコメント</p>
          <p className="rounded-lg border border-line-subtle bg-surface-2 p-3 text-sm leading-6 text-text-secondary">
            {reviewComment ?? "レビューコメントはありません。"}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-text-primary">最近の変更履歴</p>
          {auditLogs.length > 0 ? (
            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="rounded-lg border border-line-subtle bg-ink-soft p-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge className="border-line-mid bg-surface-2 text-text-muted">{getAuditActionLabel(log.action)}</Badge>
                    <span className="text-xs text-text-muted">{formatDateTime(log.timestamp)}</span>
                  </div>
                  <p className="mt-2 text-sm text-text-secondary">{log.detail}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted">このコンテンツに紐づく履歴はまだありません。</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

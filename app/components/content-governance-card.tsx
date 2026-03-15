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
      not_requested: "bg-slate-50 text-slate-700",
      pending: "bg-amber-50 text-amber-900",
      approved: "bg-emerald-50 text-emerald-800",
      changes_requested: "bg-rose-50 text-rose-800"
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
          <h3 className="text-base font-semibold text-ink sm:text-lg">運用・承認情報</h3>
          <Badge className={getApprovalTone(approvalStatus)}>{getApprovalLabel(approvalStatus)}</Badge>
          <Badge className={getFreshnessTone(getFreshnessStatus(updatedAt))}>{getFreshnessLabel(updatedAt)}</Badge>
        </div>

        <div className="space-y-1 text-sm text-slate-600">
          <p>レビュー日時: {formatDateTime(reviewedAt)}</p>
          <p>レビュー担当: {reviewerName ?? "未設定"}</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-ink">レビューコメント</p>
          <p className="rounded-xl bg-surface-muted p-3 text-sm leading-6 text-slate-600">
            {reviewComment ?? "レビューコメントはありません。"}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-ink">最近の変更履歴</p>
          {auditLogs.length > 0 ? (
            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge className="bg-slate-50">{getAuditActionLabel(log.action)}</Badge>
                    <span className="text-xs text-slate-500">{formatDateTime(log.timestamp)}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{log.detail}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-600">このコンテンツに紐づく履歴はまだありません。</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

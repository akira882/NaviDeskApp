"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, Td, Th } from "@/components/ui/table";
import {
  getAuditActionLabel,
  getAuditTargetLabel,
  listAuditActionOptions,
  listAuditTargetOptions
} from "@/lib/audit";
import { formatDateTime } from "@/lib/utils";
import type { AuditAction, AuditLog, User } from "@/types/domain";

export function AuditLogTable({ users, auditLogs }: { users: User[]; auditLogs: AuditLog[] }) {
  const [query, setQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<AuditAction | "all">("all");
  const [targetFilter, setTargetFilter] = useState<AuditLog["targetType"] | "all">("all");

  const filteredLogs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return auditLogs.filter((log) => {
      const actorName = users.find((user) => user.id === log.actorId)?.name ?? "不明";
      const matchesQuery = normalizedQuery
        ? `${log.detail} ${actorName} ${log.targetId}`.toLowerCase().includes(normalizedQuery)
        : true;
      const matchesAction = actionFilter === "all" ? true : log.action === actionFilter;
      const matchesTarget = targetFilter === "all" ? true : log.targetType === targetFilter;
      return matchesQuery && matchesAction && matchesTarget;
    });
  }, [actionFilter, auditLogs, query, targetFilter, users]);

  const summary = useMemo(() => ({
    total: filteredLogs.length,
    approvals: filteredLogs.filter((log) => log.action === "approve").length,
    reviewRequests: filteredLogs.filter((log) => log.action === "submit-review").length,
    deletions: filteredLogs.filter((log) => log.action === "delete").length
  }), [filteredLogs]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="表示件数" value={summary.total} />
        <MetricCard label="承認" value={summary.approvals} />
        <MetricCard label="承認申請" value={summary.reviewRequests} />
        <MetricCard label="削除" value={summary.deletions} />
      </div>

      <Card>
        <CardContent className="grid gap-3 sm:grid-cols-[1.4fr_0.7fr_0.7fr]">
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="詳細、対象ID、実行者で検索" />
          <Select value={actionFilter} onChange={(event) => setActionFilter(event.target.value as AuditAction | "all")}>
            <option value="all">すべての操作</option>
            {listAuditActionOptions().map((action) => (
              <option key={action} value={action}>{getAuditActionLabel(action)}</option>
            ))}
          </Select>
          <Select value={targetFilter} onChange={(event) => setTargetFilter(event.target.value as AuditLog["targetType"] | "all")}>
            <option value="all">すべての対象</option>
            {listAuditTargetOptions().map((target) => (
              <option key={target} value={target}>{getAuditTargetLabel(target)}</option>
            ))}
          </Select>
        </CardContent>
      </Card>

      <div className="overflow-x-auto rounded-xl border border-line-subtle">
        <Table>
          <thead className="bg-ink-soft">
            <tr>
              <Th>日時</Th>
              <Th>実行者</Th>
              <Th>操作</Th>
              <Th>対象</Th>
              <Th>詳細</Th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-surface-1 transition-colors">
                <Td>{formatDateTime(log.timestamp)}</Td>
                <Td>{users.find((user) => user.id === log.actorId)?.name ?? "不明"}</Td>
                <Td><Badge>{getAuditActionLabel(log.action)}</Badge></Td>
                <Td>{`${getAuditTargetLabel(log.targetType)} / ${log.targetId}`}</Td>
                <Td>{log.detail}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
        {filteredLogs.length === 0 ? (
          <p className="border-t border-line-subtle bg-surface-1 p-4 text-sm text-text-muted">
            条件に一致する監査ログはありません。
          </p>
        ) : null}
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-line-subtle bg-surface-1 p-4">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="mt-2 text-3xl font-bold text-text-primary">{value}</p>
    </div>
  );
}

"use client";

import Link from "next/link";

import { useRole } from "@/components/role-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { canManageContent, canViewAuditLog, getRoleLabel } from "@/lib/roles";

export function AdminGate({ children }: { children: React.ReactNode }) {
  const { role } = useRole();

  if (!canManageContent(role)) {
    return (
      <Card>
        <CardContent className="space-y-3">
          <h2 className="text-xl font-semibold text-ink">閲覧権限がありません</h2>
          <p className="text-sm text-slate-600">
            現在のロールは {getRoleLabel(role)} です。管理画面は editor または admin のみ利用できます。
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-end gap-2">
        <Link href="/admin/search-insights">
          <Button variant="secondary">検索分析を見る</Button>
        </Link>
        <Link href="/admin/audit-log">
          <Button variant="secondary">監査ログを見る</Button>
        </Link>
      </div>
      {children}
    </div>
  );
}

export function AuditGate({ children }: { children: React.ReactNode }) {
  const { role } = useRole();

  if (!canViewAuditLog(role)) {
    return (
        <Card>
          <CardContent className="space-y-3">
            <h2 className="text-xl font-semibold text-ink">監査ログは管理者のみ閲覧可能です</h2>
            <p className="text-sm text-slate-600">
            現在のロールは {getRoleLabel(role)} です。監査ログの確認には admin セッションが必要です。
            </p>
            <Link href="/admin">
              <Button variant="secondary">管理画面へ戻る</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}

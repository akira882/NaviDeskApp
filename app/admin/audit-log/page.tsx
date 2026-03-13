import { AuditGate } from "@/components/role-gate";
import { AppShell } from "@/components/app-shell";
import { AuditLogTable } from "@/components/audit-log-table";
import { Card, CardContent } from "@/components/ui/card";

export default function AuditLogPage() {
  return (
    <AppShell
      title="監査ログ"
      description="作成、更新、削除、公開切替などの操作履歴を確認できます。変更主体と対象を追跡できるよう、監査性を意識した構成にしています。"
    >
      <AuditGate>
        <Card>
          <CardContent className="overflow-x-auto">
            <AuditLogTable />
          </CardContent>
        </Card>
      </AuditGate>
    </AppShell>
  );
}

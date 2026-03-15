import { AuditGate } from "@/components/role-gate";
import { AppShell } from "@/components/app-shell";
import { AuditLogTable } from "@/components/audit-log-table";
import { Card, CardContent } from "@/components/ui/card";
import { userRepository } from "@/data/repositories/content-repository";
import { buildInitialStateForRole } from "@/lib/server/initial-state";
import { getSessionRole } from "@/lib/server/session";

export default function AuditLogPage() {
  const role = getSessionRole();
  const initialState = buildInitialStateForRole(role);

  const auditLogs = initialState.auditLogs;
  const referencedUserIds = new Set(auditLogs.map((log) => log.actorId));
  const users = userRepository.listUsers().filter((user) => referencedUserIds.has(user.id));

  return (
    <AppShell
      title="監査ログ"
      description="作成、更新、削除、公開切替などの操作履歴を確認できます。変更主体と対象を追跡できるよう、監査性を意識した構成にしています。"
    >
      <AuditGate>
        <Card>
          <CardContent>
            <AuditLogTable users={users} auditLogs={auditLogs} />
          </CardContent>
        </Card>
      </AuditGate>
    </AppShell>
  );
}

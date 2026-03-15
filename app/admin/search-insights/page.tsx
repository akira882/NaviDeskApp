import { AppShell } from "@/components/app-shell";
import { SearchInsightsDashboard } from "@/components/search-insights-dashboard";
import { AdminGate } from "@/components/role-gate";
import { buildInitialStateForRole } from "@/lib/server/initial-state";
import { getSessionRole } from "@/lib/server/session";

export default function SearchInsightsPage() {
  const role = getSessionRole();
  const initialState = buildInitialStateForRole(role);

  const { articles, faqs, announcements, searchLogs } = initialState;

  return (
    <AppShell
      title="検索分析"
      description="検索失敗テーマ、既存コンテンツとの一致度、改善候補を確認し、次に整備すべき情報を判断できます。"
    >
      <AdminGate>
        <SearchInsightsDashboard
          articles={articles}
          faqs={faqs}
          announcements={announcements}
          searchLogs={searchLogs}
        />
      </AdminGate>
    </AppShell>
  );
}

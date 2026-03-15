import { AppShell } from "@/components/app-shell";
import { AiGuideClient } from "@/components/ai-guide-client";
import { categoryRepository } from "@/data/repositories/content-repository";
import { listVisibleArticles, listVisibleFaqs } from "@/lib/content-helpers";
import { getSessionRole } from "@/lib/server/session";
import { buildInitialStateForRole } from "@/lib/server/initial-state";

export default function AiGuidePage() {
  const role = getSessionRole();
  const initialState = buildInitialStateForRole(role);

  const visibleArticles = listVisibleArticles(initialState, role);
  const visibleFaqs = listVisibleFaqs(initialState, role);
  const searchLogs = initialState.searchLogs;

  return (
    <AppShell
      title="AI案内"
      description="自然文で質問すると、社内記事と FAQ を先に検索して案内します。根拠が弱い場合は通常検索候補にフォールバックします。"
    >
      <AiGuideClient
        categories={categoryRepository.list()}
        preloadedArticles={visibleArticles}
        preloadedFaqs={visibleFaqs}
        searchLogs={searchLogs}
      />
    </AppShell>
  );
}

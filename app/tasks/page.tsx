import { AppShell } from "@/components/app-shell";
import { TaskHubClient } from "@/components/task-hub-client";
import { categoryRepository } from "@/data/repositories/content-repository";
import { listSortedQuickLinks, listVisibleArticles } from "@/lib/content-helpers";
import { buildInitialStateForRole } from "@/lib/server/initial-state";
import { getSessionRole } from "@/lib/server/session";
import { listTaskHubsForRole } from "@/lib/task-hubs";

export default function TasksPage() {
  const role = getSessionRole();
  const initialState = buildInitialStateForRole(role);

  const visibleArticles = listVisibleArticles(initialState, role);
  const quickLinks = listSortedQuickLinks(initialState);
  const visibleArticleSlugs = new Set(visibleArticles.map((article) => article.slug));
  const taskHubs = listTaskHubsForRole(role, visibleArticleSlugs);

  return (
    <AppShell
      title="タスクハブ"
      description="組織名ではなく、やりたい業務から最短で必要な情報と申請導線へ到達するための業務ハブです。"
    >
      <TaskHubClient
        categories={categoryRepository.list()}
        taskHubs={taskHubs}
        preloadedArticles={visibleArticles}
        preloadedQuickLinks={quickLinks}
      />
    </AppShell>
  );
}

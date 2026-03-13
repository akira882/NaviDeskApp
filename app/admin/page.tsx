import { AdminDashboard } from "@/components/admin-dashboard";
import { AdminGate } from "@/components/role-gate";
import { AppShell } from "@/components/app-shell";
import { categoryRepository } from "@/data/repositories/content-repository";

export default function AdminPage() {
  return (
    <AppShell
      title="管理画面"
      description="記事、FAQ、お知らせ、クイックリンクの作成・編集・削除・公開切替を統制し、運用変更を監査可能な形で反映します。"
    >
      <AdminGate>
        <AdminDashboard categories={categoryRepository.list()} />
      </AdminGate>
    </AppShell>
  );
}

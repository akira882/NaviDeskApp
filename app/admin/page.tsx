import { AdminDashboard } from "@/components/admin-dashboard";
import { AdminGate } from "@/components/role-gate";
import { AppShell } from "@/components/app-shell";
import { categoryRepository } from "@/data/repositories/content-repository";

export default function AdminPage() {
  return (
    <AppShell
      title="管理画面"
      description="記事、FAQ、お知らせ、クイックリンクの作成・編集・削除・公開切替を一画面で扱います。MVP では共有ストアを使い、将来 DB へ差し替えやすい構成にしています。"
    >
      <AdminGate>
        <AdminDashboard categories={categoryRepository.list()} />
      </AdminGate>
    </AppShell>
  );
}

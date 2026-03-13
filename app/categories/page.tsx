import { AppShell } from "@/components/app-shell";
import { CategoriesClient } from "@/components/categories-client";
import { categoryRepository } from "@/data/repositories/content-repository";

export default function CategoriesPage() {
  return (
    <AppShell
      title="カテゴリ別一覧"
      description="主管部門ごとに社内情報を整理しています。カテゴリを起点に、手順書・FAQ・関連リンクへ移動できます。"
    >
      <CategoriesClient categories={categoryRepository.list()} />
    </AppShell>
  );
}

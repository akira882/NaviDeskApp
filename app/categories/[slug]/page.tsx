import { AppShell } from "@/components/app-shell";
import { CategoryDetailClient } from "@/components/category-detail-client";
import { categoryRepository } from "@/data/repositories/content-repository";
import { listSortedQuickLinks, listVisibleArticles } from "@/lib/content-helpers";
import { getSessionRole } from "@/lib/server/session";
import { buildInitialStateForRole } from "@/lib/server/initial-state";

export function generateStaticParams() {
  return categoryRepository.list().map((category) => ({ slug: category.slug }));
}

export default async function CategoryDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = categoryRepository.findBySlug(slug);
  const role = getSessionRole();
  const initialState = buildInitialStateForRole(role);

  const visibleArticles = category
    ? listVisibleArticles(initialState, role).filter((article) => article.categoryId === category.id)
    : [];
  const quickLinksForCategory = category
    ? listSortedQuickLinks(initialState).filter((link) => link.categoryId === category.id)
    : [];

  return (
    <AppShell
      title={category?.name ?? "カテゴリ詳細"}
      description={category?.description ?? "カテゴリに紐づく記事、FAQ、関連リンクを表示します。"}
    >
      <CategoryDetailClient
        category={category ?? null}
        visibleArticles={visibleArticles}
        quickLinksForCategory={quickLinksForCategory}
      />
    </AppShell>
  );
}

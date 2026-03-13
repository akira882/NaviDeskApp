import { AppShell } from "@/components/app-shell";
import { CategoryDetailClient } from "@/components/category-detail-client";
import { categoryRepository } from "@/data/repositories/content-repository";

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

  return (
    <AppShell
      title={category?.name ?? "カテゴリ詳細"}
      description={category?.description ?? "カテゴリに紐づく記事、FAQ、関連リンクを表示します。"}
    >
      <CategoryDetailClient slug={slug} />
    </AppShell>
  );
}

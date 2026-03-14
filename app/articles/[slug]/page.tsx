import { AppShell } from "@/components/app-shell";
import { ArticleDetailClient } from "@/components/article-detail-client";
import { articleRepository } from "@/data/repositories/content-repository";

/**
 * Generate static params for article pages
 *
 * SECURITY: Only published articles visible to 'employee' role are included.
 * This prevents leaking the existence of draft or manager-only articles.
 *
 * PRODUCTION: Consider moving manager/admin articles to dynamic rendering
 * for additional security and flexibility.
 */
export function generateStaticParams() {
  // Only include published articles visible to the lowest privilege level
  return articleRepository.list("employee").map((article) => ({ slug: article.slug }));
}

export default async function ArticleDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <AppShell
      title="記事詳細"
      description="タイトル、要約、本文、タグ、更新情報、関連情報を確認できます。公開ロールに応じて閲覧可否を制御しています。"
    >
      <ArticleDetailClient slug={slug} />
    </AppShell>
  );
}

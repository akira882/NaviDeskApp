import { AppShell } from "@/components/app-shell";
import { ArticleDetailClient } from "@/components/article-detail-client";
import { articleRepository } from "@/data/repositories/content-repository";

export function generateStaticParams() {
  return articleRepository.listAllForAdmin().map((article) => ({ slug: article.slug }));
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

import { AppShell } from "@/components/app-shell";
import { ArticleDetailClient } from "@/components/article-detail-client";
import { articleRepository, categoryRepository, userRepository } from "@/data/repositories/content-repository";
import { buildInitialStateForRole } from "@/lib/server/initial-state";
import { getSessionRole } from "@/lib/server/session";

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
  const role = getSessionRole();
  const initialState = buildInitialStateForRole(role);
  const categoryNameById = Object.fromEntries(
    categoryRepository.list().map((category) => [category.id, category.name])
  );
  const visibleUserIds = new Set(
    initialState.articles.flatMap((article) =>
      [article.updatedBy, article.reviewedBy].filter((value): value is string => Boolean(value))
    )
  );
  const userNameById = Object.fromEntries(
    userRepository
      .listUsers()
      .filter((user) => visibleUserIds.has(user.id))
      .map((user) => [user.id, user.name])
  );

  return (
    <AppShell
      title="記事詳細"
      description="タイトル、要約、本文、タグ、更新情報、関連情報を確認できます。公開ロールに応じて閲覧可否を制御しています。"
    >
      <ArticleDetailClient slug={slug} categoryNameById={categoryNameById} userNameById={userNameById} />
    </AppShell>
  );
}

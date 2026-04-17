"use client";

import { QuickLinkItem } from "@/components/quick-link-item";
import { ArticleList } from "@/components/article-list";
import { Card, CardContent } from "@/components/ui/card";
import type { Article, Category, QuickLink } from "@/types/domain";

export function CategoryDetailClient({
  category,
  visibleArticles,
  quickLinksForCategory
}: {
  category: Category | null;
  visibleArticles: Article[];
  quickLinksForCategory: QuickLink[];
}) {
  if (!category) {
    return (
      <Card>
        <CardContent className="text-sm text-text-secondary">カテゴリが見つかりませんでした。</CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-text-primary">記事一覧</h2>
        {visibleArticles.length > 0 ? (
          <ArticleList articles={visibleArticles} categories={[category]} />
        ) : (
          <Card>
            <CardContent className="text-sm text-text-secondary">このロールで閲覧可能な記事はありません。</CardContent>
          </Card>
        )}
      </section>
      <aside className="space-y-4">
        <Card>
          <CardContent className="space-y-2">
            <h3 className="text-lg font-semibold text-text-primary">カテゴリ概要</h3>
            <p className="text-sm leading-6 text-text-secondary">{category.description}</p>
            <p className="text-sm text-text-muted">主管部門: {category.ownerDepartment}</p>
          </CardContent>
        </Card>
        {quickLinksForCategory.length > 0 && (
          <Card>
            <CardContent className="space-y-3">
              <h3 className="text-lg font-semibold text-text-primary">関連リンク</h3>
              {quickLinksForCategory.map((link) => (
                <QuickLinkItem
                  key={link.id}
                  link={link}
                  className="block rounded-lg border border-line-subtle p-3.5 hover:bg-surface-2 transition-colors"
                />
              ))}
            </CardContent>
          </Card>
        )}
      </aside>
    </div>
  );
}

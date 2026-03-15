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
        <CardContent className="text-sm text-slate-600">カテゴリが見つかりませんでした。</CardContent>
      </Card>
    );
  }

  const categoryArticles = visibleArticles;
  const quickLinks = quickLinksForCategory;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-ink">記事一覧</h2>
        {categoryArticles.length > 0 ? (
          <ArticleList articles={categoryArticles} categories={[category]} />
        ) : (
          <Card>
            <CardContent className="text-sm text-slate-600">このロールで閲覧可能な記事はありません。</CardContent>
          </Card>
        )}
      </section>
      <aside className="space-y-4">
        <Card>
          <CardContent className="space-y-2">
            <h3 className="text-lg font-semibold text-ink">カテゴリ概要</h3>
            <p className="text-sm leading-6 text-slate-600">{category.description}</p>
            <p className="text-sm text-slate-500">主管部門: {category.ownerDepartment}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3">
            <h3 className="text-lg font-semibold text-ink">関連リンク</h3>
            {quickLinks.map((link) => (
              <QuickLinkItem
                key={link.id}
                link={link}
                className="block rounded-xl border border-slate-200 p-4 hover:bg-slate-50"
              />
            ))}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

"use client";

import { useContent } from "@/components/content-provider";
import { useRole } from "@/components/role-provider";
import { categoryRepository } from "@/data/repositories/content-repository";
import { ArticleList } from "@/components/article-list";
import { Card, CardContent } from "@/components/ui/card";
import { listSortedQuickLinks, listVisibleArticles } from "@/lib/content-helpers";

export function CategoryDetailClient({ slug }: { slug: string }) {
  const { role } = useRole();
  const content = useContent();
  const category = categoryRepository.findBySlug(slug);

  if (!category) {
    return (
      <Card>
        <CardContent className="text-sm text-slate-600">カテゴリが見つかりませんでした。</CardContent>
      </Card>
    );
  }

  const categoryArticles = listVisibleArticles(content, role).filter((article) => article.categoryId === category.id);
  const quickLinks = listSortedQuickLinks(content).filter((link) => link.categoryId === category.id);

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
              <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className="block rounded-xl border border-slate-200 p-4 hover:bg-slate-50">
                <p className="font-medium text-ink">{link.label}</p>
                <p className="mt-1 text-sm text-slate-600">{link.description}</p>
              </a>
            ))}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

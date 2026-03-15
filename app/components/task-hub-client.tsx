"use client";

import type { Route } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { TaskHub } from "@/lib/task-hubs";
import type { Article, Category, QuickLink } from "@/types/domain";

export function TaskHubClient({
  categories,
  taskHubs,
  preloadedArticles,
  preloadedQuickLinks
}: {
  categories: Category[];
  taskHubs: TaskHub[];
  preloadedArticles: Article[];
  preloadedQuickLinks: QuickLink[];
}) {
  const visibleArticles = preloadedArticles;
  const quickLinks = preloadedQuickLinks;
  const categoriesById = new Map(categories.map((category) => [category.id, category]));

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-2">
        {taskHubs.map((hub, index) => {
          const matchedArticles = visibleArticles.filter((article) => hub.articleSlugs.includes(article.slug));
          const matchedQuickLinks = quickLinks.filter((link) => hub.quickLinkUrls.includes(link.url as Route));

          return (
            <Card key={hub.slug} className="border-slate-200">
              <CardContent className="space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-teal-50 text-teal-900">優先度 {hub.priority}</Badge>
                  {index < 2 ? <Badge className="bg-amber-50 text-amber-900">最重要導線</Badge> : null}
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-ink">{hub.title}</h2>
                  <p className="text-sm leading-6 text-slate-600">{hub.summary}</p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-ink">関連カテゴリ</h3>
                  <div className="flex flex-wrap gap-2">
                    {hub.categories.map((categoryId) => {
                      const category = categoriesById.get(categoryId);
                      if (!category) {
                        return null;
                      }

                      return (
                        <Link key={category.id} href={`/categories/${category.slug}` as Route}>
                          <Badge className="bg-slate-50">{category.name}</Badge>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-ink">着手チェック</h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {hub.checklist.map((item) => (
                      <li key={item} className="rounded-xl bg-surface-muted p-3">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-ink">推奨記事</h3>
                    {matchedArticles.map((article) => (
                      <Link
                        key={article.id}
                        href={`/articles/${article.slug}` as Route}
                        className="block rounded-xl border border-slate-200 p-3 hover:bg-slate-50"
                      >
                        <p className="text-sm font-medium text-ink">{article.title}</p>
                        <p className="mt-1 text-xs text-slate-600">{article.summary}</p>
                      </Link>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-ink">業務ツール</h3>
                    {matchedQuickLinks.map((link) => (
                      <Link
                        key={link.id}
                        href={link.url as Route}
                        className="block rounded-xl border border-slate-200 p-3 hover:bg-slate-50"
                      >
                        <p className="text-sm font-medium text-ink">{link.label}</p>
                        <p className="mt-1 text-xs text-slate-600">{link.description}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}

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
            <Card key={hub.slug}>
              <CardContent className="space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="border-accent-gold/25 bg-accent-gold/10 text-accent-gold">
                    優先度 {hub.priority}
                  </Badge>
                  {index < 2 ? (
                    <Badge className="border-accent-teal/25 bg-accent-teal/10 text-accent-teal">最重要導線</Badge>
                  ) : null}
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-lg font-semibold text-text-primary">{hub.title}</h2>
                  <p className="text-sm leading-6 text-text-secondary">{hub.summary}</p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-text-primary">関連カテゴリ</h3>
                  <div className="flex flex-wrap gap-2">
                    {hub.categories.map((categoryId) => {
                      const category = categoriesById.get(categoryId);
                      if (!category) return null;
                      return (
                        <Link key={category.id} href={`/categories/${category.slug}` as Route}>
                          <Badge className="border-line-mid bg-surface-2 text-text-secondary hover:border-accent-teal/30 hover:text-accent-teal transition-colors">
                            {category.name}
                          </Badge>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-text-primary">着手チェック</h3>
                  <ul className="space-y-1.5 text-sm text-text-secondary">
                    {hub.checklist.map((item) => (
                      <li key={item} className="flex items-start gap-2 rounded-lg bg-surface-2 p-3 leading-5">
                        <span className="mt-0.5 text-accent-teal shrink-0">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-text-primary">推奨記事</h3>
                    {matchedArticles.map((article) => (
                      <Link
                        key={article.id}
                        href={`/articles/${article.slug}` as Route}
                        className="block rounded-lg border border-line-subtle p-3 hover:bg-surface-2 transition-colors"
                      >
                        <p className="text-sm font-medium text-text-primary">{article.title}</p>
                        <p className="mt-1 text-xs text-text-secondary leading-5">{article.summary}</p>
                      </Link>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-text-primary">業務ツール</h3>
                    {matchedQuickLinks.map((link) => (
                      <Link
                        key={link.id}
                        href={link.url as Route}
                        className="block rounded-lg border border-line-subtle p-3 hover:bg-surface-2 transition-colors"
                      >
                        <p className="text-sm font-medium text-text-primary">{link.label}</p>
                        <p className="mt-1 text-xs text-text-secondary leading-5">{link.description}</p>
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

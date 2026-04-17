import type { Route } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { Article, Category } from "@/types/domain";

export function ArticleList({
  articles,
  categories
}: {
  articles: Article[];
  categories: Category[];
}) {
  return (
    <div className="space-y-3">
      {articles.map((article) => {
        const categoryName = categories.find((category) => category.id === article.categoryId)?.name ?? "未分類";

        return (
          <Link key={article.id} href={`/articles/${article.slug}` as Route}>
            <Card className="hover:-translate-y-0.5">
              <CardContent className="space-y-2.5 p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{categoryName}</Badge>
                  <Badge className="border-line-mid bg-surface-2 text-text-muted">{article.visibilityRole}</Badge>
                  {article.helpfulCount > 0 && (
                    <Badge className="border-accent-green/25 bg-accent-green/10 text-accent-green">
                      {article.helpfulCount}人が解決
                    </Badge>
                  )}
                  <span className="text-xs text-text-muted">更新日: {formatDate(article.updatedAt)}</span>
                </div>
                <h2 className="text-base font-semibold text-text-primary sm:text-lg">{article.title}</h2>
                <p className="text-sm leading-6 text-text-secondary">{article.summary}</p>
                {article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {article.tags.map((tag) => (
                      <Badge key={tag} className="border-line-mid bg-surface-2 text-text-muted">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

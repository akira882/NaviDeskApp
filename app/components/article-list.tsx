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
    <div className="space-y-4">
      {articles.map((article) => {
        const categoryName = categories.find((category) => category.id === article.categoryId)?.name ?? "未分類";

        return (
          <Link key={article.id} href={`/articles/${article.slug}` as Route}>
            <Card className="transition hover:-translate-y-0.5">
              <CardContent className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{categoryName}</Badge>
                  <Badge className="bg-slate-50">{article.visibilityRole}</Badge>
                  <span className="text-xs text-slate-500">更新日: {formatDate(article.updatedAt)}</span>
                </div>
                <h2 className="text-xl font-semibold text-ink">{article.title}</h2>
                <p className="text-sm leading-6 text-slate-600">{article.summary}</p>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <Badge key={tag} className="bg-teal-50">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

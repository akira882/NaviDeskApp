"use client";

import type { Route } from "next";
import Link from "next/link";

import { useContent } from "@/components/content-provider";
import { useRole } from "@/components/role-provider";
import { categoryRepository, userRepository } from "@/data/repositories/content-repository";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { listVisibleArticles } from "@/lib/content-helpers";
import { formatDate } from "@/lib/utils";

export function ArticleDetailClient({ slug }: { slug: string }) {
  const { role } = useRole();
  const content = useContent();
  const visibleArticles = listVisibleArticles(content, role);
  const article = visibleArticles.find((item) => item.slug === slug);

  if (!article) {
    return (
      <Card>
        <CardContent className="text-sm text-slate-600">
          記事が見つからないか、このロールでは閲覧できません。
        </CardContent>
      </Card>
    );
  }

  const category = categoryRepository.findById(article.categoryId);
  const relatedArticles = visibleArticles.filter((item) => article.relatedArticleIds.includes(item.id));
  const editor = userRepository.listUsers().find((user) => user.id === article.updatedBy);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
      <article className="space-y-6">
        <Card>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{category?.name ?? "未分類"}</Badge>
              <Badge className="bg-slate-50">{article.visibilityRole}</Badge>
              {article.tags.map((tag) => (
                <Badge key={tag} className="bg-teal-50">
                  #{tag}
                </Badge>
              ))}
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-ink">{article.title}</h2>
            <p className="rounded-xl bg-surface-muted p-4 text-sm leading-7 text-slate-700">{article.summary}</p>
            <div className="space-y-1 text-sm text-slate-500">
              <p>最終更新日: {formatDate(article.updatedAt)}</p>
              <p>更新者: {editor?.name ?? "不明"}</p>
            </div>
            <div className="whitespace-pre-line text-sm leading-8 text-slate-700">{article.content}</div>
          </CardContent>
        </Card>
      </article>
      <aside className="space-y-4">
        <Card>
          <CardContent className="space-y-3">
            <h3 className="text-lg font-semibold text-ink">関連情報</h3>
            {relatedArticles.length > 0 ? (
              relatedArticles.map((related) => (
                <Link key={related.id} href={`/articles/${related.slug}` as Route} className="block rounded-xl border border-slate-200 p-4 hover:bg-slate-50">
                  <p className="font-medium text-ink">{related.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{related.summary}</p>
                </Link>
              ))
            ) : (
              <p className="text-sm text-slate-600">関連情報は登録されていません。</p>
            )}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

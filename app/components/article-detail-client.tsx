"use client";

import type { Route } from "next";
import Link from "next/link";

import { useContent } from "@/components/content-provider";
import { ContentGovernanceCard } from "@/components/content-governance-card";
import { useRole } from "@/components/role-provider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { listAuditLogsForTarget } from "@/lib/audit";
import { listVisibleArticles } from "@/lib/content-helpers";
import { formatDate, formatDateTime } from "@/lib/utils";

export function ArticleDetailClient({
  slug,
  categoryNameById,
  userNameById
}: {
  slug: string;
  categoryNameById: Record<string, string>;
  userNameById: Record<string, string>;
}) {
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

  const relatedArticles = visibleArticles.filter((item) => article.relatedArticleIds.includes(item.id));
  const articleLogs = listAuditLogsForTarget(content.auditLogs, "article", article.id);

  return (
    <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-[1.35fr_0.65fr]">
      <article className="space-y-4 sm:space-y-6">
        <Card>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <Badge className="text-xs">{categoryNameById[article.categoryId] ?? "未分類"}</Badge>
              <Badge className="bg-slate-50 text-xs">{article.visibilityRole}</Badge>
              {article.tags.map((tag) => (
                <Badge key={tag} className="bg-teal-50 text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl lg:text-3xl">{article.title}</h2>
            <p className="rounded-xl bg-surface-muted p-3 text-xs leading-6 text-slate-700 sm:p-4 sm:text-sm sm:leading-7">{article.summary}</p>
            <div className="space-y-0.5 text-xs text-slate-500 sm:space-y-1 sm:text-sm">
              <p>最終更新日: {formatDate(article.updatedAt)}</p>
              <p>更新者: {userNameById[article.updatedBy] ?? "不明"}</p>
              <p>レビュー日時: {formatDateTime(article.reviewedAt)}</p>
            </div>
            <div className="whitespace-pre-line text-xs leading-7 text-slate-700 sm:text-sm sm:leading-8">{article.content}</div>
          </CardContent>
        </Card>
      </article>
      <aside className="space-y-3 sm:space-y-4">
        <ContentGovernanceCard
          approvalStatus={article.approvalStatus}
          reviewedAt={article.reviewedAt}
          reviewerName={article.reviewedBy ? userNameById[article.reviewedBy] ?? null : null}
          reviewComment={article.reviewComment}
          updatedAt={article.updatedAt}
          auditLogs={articleLogs}
        />
        <Card>
          <CardContent className="space-y-2.5 sm:space-y-3">
            <h3 className="text-base font-semibold text-ink sm:text-lg">関連情報</h3>
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

"use client";

import type { Route } from "next";
import Link from "next/link";

import { useContent } from "@/components/content-provider";
import { ContentGovernanceCard } from "@/components/content-governance-card";
import { ArticleActionBar } from "@/components/article-action-bar";
import { ArticleReferralBanner } from "@/components/article-referral-banner";
import { HelpfulFeedback } from "@/components/helpful-feedback";
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
        <CardContent className="text-sm text-text-secondary">
          記事が見つからないか、このロールでは閲覧できません。
        </CardContent>
      </Card>
    );
  }

  const relatedArticles = visibleArticles.filter((item) => article.relatedArticleIds.includes(item.id));
  const articleLogs = listAuditLogsForTarget(content.auditLogs, "article", article.id);

  return (
    <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-[1.35fr_0.65fr]" data-article-grid>
      <article className="space-y-4 sm:space-y-6">
        <ArticleReferralBanner />
        <Card>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{categoryNameById[article.categoryId] ?? "未分類"}</Badge>
                <Badge className="border-line-mid bg-surface-2 text-text-muted">{article.visibilityRole}</Badge>
                {article.tags.map((tag) => (
                  <Badge key={tag} className="border-accent-teal/15 bg-accent-teal/8 text-accent-teal">
                    #{tag}
                  </Badge>
                ))}
              </div>
              <ArticleActionBar />
            </div>
            <h2 className="text-xl font-bold text-text-primary sm:text-2xl lg:text-3xl">{article.title}</h2>
            <p className="rounded-lg border border-line-subtle bg-surface-2 p-3.5 text-sm leading-7 text-text-secondary sm:p-4">
              {article.summary}
            </p>
            <div className="rounded-lg border border-line-subtle bg-ink-soft p-3.5 sm:p-4">
              <h3 className="mb-2 text-sm font-semibold text-text-primary">情報鮮度</h3>
              <div className="space-y-0.5 text-sm text-text-secondary">
                <p>最終更新: {formatDate(article.updatedAt)}</p>
                <p>更新担当: {userNameById[article.updatedBy] ?? "不明"}</p>
                <p>レビュー承認: {formatDateTime(article.reviewedAt)}</p>
              </div>
            </div>
            <div className="whitespace-pre-line text-sm leading-8 text-text-secondary">{article.content}</div>
            <HelpfulFeedback
              id={article.id}
              type="article"
              helpfulCount={article.helpfulCount}
              notHelpfulCount={article.notHelpfulCount}
              onVote={(helpful) => content.markArticleHelpful(article.id, helpful)}
            />
          </CardContent>
        </Card>
        <Card data-print-hidden>
          <CardContent className="space-y-2">
            <p className="text-sm font-semibold text-text-primary">この記事で解決しない場合</p>
            <p className="text-sm leading-6 text-text-secondary">
              記事の内容だけでは解決できない場合は、社内IT企画部門へお問い合わせください。
            </p>
            <Link href="/articles/helpdesk-contact" className="inline-block text-sm text-accent-teal hover:underline underline-offset-4">
              社内IT企画部門へ問い合わせ →
            </Link>
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
          <CardContent className="space-y-2.5">
            <h3 className="text-base font-semibold text-text-primary sm:text-lg">関連情報</h3>
            {relatedArticles.length > 0 ? (
              relatedArticles.map((related) => (
                <Link
                  key={related.id}
                  href={`/articles/${related.slug}` as Route}
                  className="block rounded-lg border border-line-subtle p-3.5 hover:bg-surface-2 transition-colors"
                >
                  <p className="font-semibold text-text-primary text-sm">{related.title}</p>
                  <p className="mt-1 text-xs text-text-secondary leading-5">{related.summary}</p>
                </Link>
              ))
            ) : (
              <p className="text-sm text-text-muted">関連情報は登録されていません。</p>
            )}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

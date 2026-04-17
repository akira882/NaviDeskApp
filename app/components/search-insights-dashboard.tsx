"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { listReviewPriorityItems } from "@/lib/content-governance";
import { listFailedSearchThemes } from "@/lib/content-helpers";
import { listSearchImprovementCandidates } from "@/lib/search-insights";
import { formatDateTime } from "@/lib/utils";
import type { Announcement, Article, FAQ, SearchLog } from "@/types/domain";

export function SearchInsightsDashboard({
  articles,
  faqs,
  announcements,
  searchLogs
}: {
  articles: Article[];
  faqs: FAQ[];
  announcements: Announcement[];
  searchLogs: SearchLog[];
}) {
  const failedThemes = listFailedSearchThemes(searchLogs);
  const staleItems = listReviewPriorityItems({ articles, faqs, announcements });
  const candidates = listSearchImprovementCandidates({ failedThemes, articles, faqs, announcements });

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <MetricCard label="検索不足テーマ" value={failedThemes.length} />
          <MetricCard label="要レビューコンテンツ" value={staleItems.length} />
          <MetricCard label="改善候補" value={candidates.length} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-text-primary">改善候補一覧</h2>
            <p className="text-sm text-text-secondary">ゼロ件検索と既存コンテンツを突き合わせ、次に改善すべきテーマを整理しています。</p>
          </div>
          {candidates.length > 0 ? (
            <div className="space-y-3">
              {candidates.slice(0, 10).map((candidate) => (
                <div key={`${candidate.query}-${candidate.surface}`} className="rounded-lg border border-line-subtle bg-surface-2 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="border-accent-crimson/25 bg-accent-crimson/10 text-accent-crimson">
                      ゼロ件 {candidate.count}回
                    </Badge>
                    <Badge className="border-line-mid bg-surface-1 text-text-muted">
                      {candidate.surface === "home" ? "ホーム検索" : candidate.surface === "faq" ? "FAQ検索" : "AI案内"}
                    </Badge>
                  </div>
                  <p className="mt-3 text-base font-semibold text-text-primary">{candidate.query}</p>
                  <p className="mt-1 text-sm text-text-muted">最終検索: {formatDateTime(candidate.lastSearchedAt)}</p>
                  <p className="mt-3 text-sm text-text-secondary">{candidate.recommendation}</p>
                  <p className="mt-2 text-sm text-text-muted">
                    {candidate.matchedContentTitle
                      ? `関連候補: ${candidate.matchedContentTitle}`
                      : "関連候補: 既存コンテンツとの一致が弱いため、新規作成を推奨"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-line-subtle bg-surface-2 p-4 text-sm text-text-muted">
              分析対象の検索不足テーマはありません。
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-line-subtle bg-surface-1 p-4">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="mt-2 text-3xl font-bold text-text-primary">{value}</p>
    </div>
  );
}

"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { useContent } from "@/components/content-provider";
import { SearchBar } from "@/components/search-bar";
import { SearchResults } from "@/components/search-results";
import { useSearchTelemetry } from "@/components/use-search-telemetry";
import { QuickLinkItem } from "@/components/quick-link-item";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRole } from "@/components/role-provider";
import {
  listPublishedAnnouncements,
  listRecentVisibleArticles,
  listSortedQuickLinks,
  searchContent
} from "@/lib/content-helpers";
import { listTaskHubsForRole } from "@/lib/task-hubs";
import { formatDate } from "@/lib/utils";
import type { Category } from "@/types/domain";

const HERO_PREVIEW_LIMIT = 5;
const HERO_SEARCH_LIMIT = 50;

export function HomeClient({ categories }: { categories: Category[] }) {
  const { role } = useRole();
  const content = useContent();
  const router = useRouter();
  const [query, setQuery] = useState("");

  const results = useMemo(
    () => searchContent(content, categories, query, role, { limit: HERO_SEARCH_LIMIT }),
    [categories, content, query, role]
  );
  const announcements = useMemo(() => listPublishedAnnouncements(content), [content]);
  const quickLinks = useMemo(() => listSortedQuickLinks(content), [content]);
  const taskHubs = useMemo(() => listTaskHubsForRole(role).slice(0, 3), [role]);
  const recentArticles = useMemo(() => listRecentVisibleArticles(content, role, 4), [content, role]);
  useSearchTelemetry({ query, surface: "home", resultCount: results.length });

  function handleSearchSubmit() {
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  }

  const trimmedQuery = query.trim();
  const previewResults = results.slice(0, HERO_PREVIEW_LIMIT);
  const hasMore = results.length > HERO_PREVIEW_LIMIT;
  const searchPageHref = `/search?q=${encodeURIComponent(trimmedQuery)}` as Route;

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* ヒーロー検索: 全幅・最上段。モバイルでもファーストビューに収まる */}
      <section
        aria-label="社内情報検索"
        className="rounded-xl border border-line-subtle bg-surface-1 shadow-panel p-5 sm:p-6"
      >
        <h2 className="text-base font-semibold text-text-primary sm:text-lg">社内情報を検索</h2>
        <p className="mt-0.5 mb-4 text-xs text-text-muted">
          記事・FAQ・お知らせを横断して検索できます
        </p>
        <SearchBar value={query} onChange={setQuery} onSubmit={handleSearchSubmit} />
        <div className="mt-4">
          {trimmedQuery ? (
            <SearchResults
              results={previewResults}
              footer={
                hasMore ? (
                  <Link
                    href={searchPageHref}
                    className="block rounded-lg border border-line-subtle bg-surface-2 p-3 text-center text-sm text-accent-teal hover:underline underline-offset-4"
                  >
                    すべての結果を見る（{results.length}件）
                  </Link>
                ) : null
              }
            />
          ) : (
            <p className="rounded-lg border border-line-subtle/50 bg-ink-soft p-3 text-xs text-text-muted">
              Enterで全件検索ページへ移動します
            </p>
          )}
        </div>
      </section>

      <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-5 sm:space-y-6">
          {/* タスクハブ */}
          <div className="rounded-xl border border-line-subtle bg-surface-1 shadow-panel overflow-hidden">
            <div className="border-b border-line-subtle px-5 py-4 sm:px-6">
              <p className="text-xs font-medium text-text-muted mb-1">業務を始める</p>
              <h2 className="text-base font-semibold text-text-primary sm:text-lg">優先タスクから着手する</h2>
              <p className="mt-1 text-sm text-text-secondary">
                重要度と利用頻度が高い業務フローを整理しています。
              </p>
            </div>
            <div className="grid gap-0 md:grid-cols-3 divide-x divide-line-subtle/50">
              {taskHubs.map((hub) => (
                <Link
                  key={hub.slug}
                  href="/tasks"
                  className="p-4 hover:bg-surface-2 transition-colors group block"
                >
                  <Badge className="border-accent-gold/25 bg-accent-gold/10 text-accent-gold mb-2.5">
                    優先度 {hub.priority}
                  </Badge>
                  <p className="text-sm font-semibold text-text-primary group-hover:text-accent-teal transition-colors">{hub.title}</p>
                  <p className="mt-1 text-xs text-text-secondary leading-5">{hub.summary}</p>
                </Link>
              ))}
            </div>
            <div className="border-t border-line-subtle/50 px-5 py-3">
              <Link href="/tasks" className="text-sm text-accent-teal hover:underline underline-offset-4">
                すべてのタスクを見る →
              </Link>
            </div>
          </div>

          {/* カテゴリ */}
          <section className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => (
              <Link key={category.id} href={`/categories/${category.slug}` as Route}>
                <Card className="h-full hover:-translate-y-0.5">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-text-primary">{category.name}</h3>
                      <Badge className="shrink-0 border-line-mid bg-surface-2 text-text-muted text-[11px]">
                        {category.ownerDepartment}
                      </Badge>
                    </div>
                    <p className="text-xs leading-5 text-text-secondary">{category.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </section>
        </div>

        <div className="space-y-5 sm:space-y-6">
          {/* 最近更新された記事（旧「よく見られている」を実装に即した名称へ） */}
          <Card>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-text-primary sm:text-base">最近更新された記事</h2>
              </div>
              <div className="space-y-1">
                {recentArticles.map((article, i) => (
                  <Link
                    key={article.id}
                    href={`/articles/${article.slug}` as Route}
                    className="flex items-start gap-3 rounded-lg p-3 hover:bg-surface-2 transition-colors"
                  >
                    <span className="mt-0.5 shrink-0 w-5 h-5 rounded flex items-center justify-center text-xs font-semibold text-accent-teal bg-accent-teal/10">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs text-text-muted">{formatDate(article.updatedAt)}</p>
                      <p className="mt-0.5 text-sm font-semibold text-text-primary">{article.title}</p>
                      <p className="mt-0.5 text-xs text-text-secondary line-clamp-2 leading-5">{article.summary}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* お知らせ */}
          <Card>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-text-primary sm:text-base">お知らせ</h2>
                <Link href="/announcements">
                  <Button variant="ghost" size="sm">すべて見る</Button>
                </Link>
              </div>
              <div className="space-y-2">
                {announcements.slice(0, 3).map((announcement) => (
                  <div key={announcement.id} className="rounded-lg border border-line-subtle bg-surface-2 p-3 sm:p-3.5">
                    <p className="text-xs text-text-muted">{formatDate(announcement.publishedAt)}</p>
                    <p className="mt-1 text-sm font-semibold text-text-primary">{announcement.title}</p>
                    <p className="mt-1 text-xs text-text-secondary leading-5">{announcement.body}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* クイックリンク */}
          <Card>
            <CardContent className="space-y-3">
              <h2 className="text-sm font-semibold text-text-primary sm:text-base">クイックリンク</h2>
              <div className="space-y-1">
                {quickLinks.map((link) => (
                  <QuickLinkItem
                    key={link.id}
                    link={link}
                    className="flex items-start gap-2 rounded-lg p-2.5 hover:bg-surface-2 transition-colors"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

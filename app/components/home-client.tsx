"use client";

import type { Route } from "next";
import Link from "next/link";
import { useMemo, useState } from "react";

import { useContent } from "@/components/content-provider";
import { SearchBar } from "@/components/search-bar";
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

export function HomeClient({ categories }: { categories: Category[] }) {
  const { role } = useRole();
  const content = useContent();
  const [query, setQuery] = useState("");

  const results = useMemo(
    () => searchContent(content, categories, query, role),
    [categories, content, query, role]
  );
  const announcements = useMemo(() => listPublishedAnnouncements(content), [content]);
  const quickLinks = useMemo(() => listSortedQuickLinks(content), [content]);
  const taskHubs = useMemo(() => listTaskHubsForRole(role).slice(0, 3), [role]);
  const recentArticles = useMemo(() => listRecentVisibleArticles(content, role, 4), [content, role]);
  useSearchTelemetry({ query, surface: "home", resultCount: results.length });

  return (
    <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-[1.4fr_0.9fr]">
      <div className="space-y-4 sm:space-y-6">
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-teal-600 via-cyan-700 to-ink text-white">
          <CardContent className="space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-teal-100">優先タスク導線</p>
              <h2 className="text-lg font-semibold sm:text-xl">最重要タスクから業務を開始</h2>
              <p className="text-sm leading-6 text-cyan-50">
                重要度と利用頻度が高い業務フローを優先順で整理し、迷わず着手できるようにしています。
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {taskHubs.map((hub) => (
                <Link
                  key={hub.slug}
                  href="/tasks"
                  className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur transition hover:bg-white/15"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge className="border-white/20 bg-white/15 text-white">優先度 {hub.priority}</Badge>
                  </div>
                  <p className="mt-3 text-base font-semibold">{hub.title}</p>
                  <p className="mt-2 text-sm leading-6 text-cyan-50">{hub.summary}</p>
                </Link>
              ))}
            </div>
            <Link href="/tasks" className="inline-flex text-sm font-medium text-white underline underline-offset-4">
              タスクハブ全体を見る
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="space-y-1.5 sm:space-y-2">
              <h2 className="text-lg font-semibold text-ink sm:text-xl">社内情報を横断検索</h2>
              <p className="text-xs text-slate-500 sm:text-sm">記事と FAQ をまとめて検索し、最短ルートで業務情報へ到達します。</p>
            </div>
            <SearchBar value={query} onChange={setQuery} />
            <div className="space-y-3">
              {query ? (
                results.length > 0 ? (
                  results.map((result) => (
                    <Link key={result.id} href={result.href} className="block rounded-xl border border-slate-200 p-4 hover:bg-slate-50">
                      <div className="mb-2 flex items-center gap-2">
                        <Badge>{result.type === "article" ? "記事" : "FAQ"}</Badge>
                        <span className="text-xs text-slate-500">{result.categoryName}</span>
                      </div>
                      <p className="font-medium text-ink">{result.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{result.summary}</p>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-xl bg-surface-muted p-4 text-sm text-slate-600">
                    <p>一致する記事または FAQ が見つかりませんでした。</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link href="/tasks" className="text-sm font-medium text-teal-700 underline underline-offset-4">タスクハブを見る</Link>
                      <Link href="/categories" className="text-sm font-medium text-teal-700 underline underline-offset-4">カテゴリから探す</Link>
                      <Link href="/ai-guide" className="text-sm font-medium text-teal-700 underline underline-offset-4">AI案内を試す</Link>
                      <Link href="/articles/helpdesk-contact" className="text-sm font-medium text-teal-700 underline underline-offset-4">社内IT企画部門へ問い合わせ</Link>
                    </div>
                  </div>
                )
              ) : (
                <p className="rounded-xl bg-surface-muted p-4 text-sm text-slate-600">
                  例: 「VPN 接続できない」「有給 申請」「勤怠 修正」
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <Link key={category.id} href={`/categories/${category.slug}` as Route}>
              <Card className="h-full transition hover:-translate-y-0.5">
                <CardContent className="space-y-2 sm:space-y-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-base font-semibold text-ink sm:text-lg">{category.name}</h3>
                    <Badge className="w-fit bg-teal-50 text-xs">{category.ownerDepartment}</Badge>
                  </div>
                  <p className="text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">{category.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <Card>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-ink sm:text-lg">よく見られている記事</h2>
              <Badge className="bg-teal-50 text-xs text-teal-700">人気</Badge>
            </div>
            <div className="space-y-2.5 sm:space-y-3">
              {recentArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/articles/${article.slug}` as Route}
                  className="block rounded-xl border border-slate-200 p-3 hover:bg-slate-50 sm:p-4"
                >
                  <p className="text-xs text-slate-500">{formatDate(article.updatedAt)}</p>
                  <p className="mt-1 text-sm font-medium text-ink sm:text-base">{article.title}</p>
                  <p className="mt-1 text-xs text-slate-600 sm:text-sm">{article.summary}</p>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-ink sm:text-lg">お知らせ</h2>
              <Link href="/announcements">
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm">一覧へ</Button>
              </Link>
            </div>
            <div className="space-y-2.5 sm:space-y-3">
              {announcements.slice(0, 3).map((announcement) => (
                <div key={announcement.id} className="rounded-xl border border-slate-200 p-3 sm:p-4">
                  <p className="text-xs text-slate-500">{formatDate(announcement.publishedAt)}</p>
                  <p className="mt-1 text-sm font-medium text-ink sm:text-base">{announcement.title}</p>
                  <p className="mt-1.5 text-xs text-slate-600 sm:mt-2 sm:text-sm">{announcement.body}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 sm:space-y-4">
            <h2 className="text-base font-semibold text-ink sm:text-lg">クイックリンク</h2>
            <div className="space-y-2.5 sm:space-y-3">
              {quickLinks.map((link) => (
                <QuickLinkItem
                  key={link.id}
                  link={link}
                  className="block rounded-xl border border-slate-200 p-3 hover:bg-slate-50 sm:p-4"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import type { Route } from "next";
import Link from "next/link";
import { useMemo, useState } from "react";

import { useContent } from "@/components/content-provider";
import { SearchBar } from "@/components/search-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRole } from "@/components/role-provider";
import { searchContent, listPublishedAnnouncements, listSortedQuickLinks } from "@/lib/content-helpers";
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

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
      <div className="space-y-6">
        <Card>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-ink">社内情報を横断検索</h2>
              <p className="text-sm text-slate-500">記事と FAQ をまとめて検索し、最短ルートで業務情報へ到達します。</p>
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
                  <p className="rounded-xl bg-surface-muted p-4 text-sm text-slate-600">一致する記事または FAQ が見つかりませんでした。</p>
                )
              ) : (
                <p className="rounded-xl bg-surface-muted p-4 text-sm text-slate-600">
                  例: 「VPN 接続できない」「有休 申請」「勤怠 修正」
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <Link key={category.id} href={`/categories/${category.slug}` as Route}>
              <Card className="h-full transition hover:-translate-y-0.5">
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-ink">{category.name}</h3>
                    <Badge className="bg-teal-50">{category.ownerDepartment}</Badge>
                  </div>
                  <p className="text-sm leading-6 text-slate-600">{category.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>
      </div>

      <div className="space-y-6">
        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink">お知らせ</h2>
              <Link href="/announcements">
                <Button variant="ghost" size="sm">一覧へ</Button>
              </Link>
            </div>
            <div className="space-y-3">
              {announcements.slice(0, 3).map((announcement) => (
                <div key={announcement.id} className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs text-slate-500">{formatDate(announcement.publishedAt)}</p>
                  <p className="mt-1 font-medium text-ink">{announcement.title}</p>
                  <p className="mt-2 text-sm text-slate-600">{announcement.body}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4">
            <h2 className="text-lg font-semibold text-ink">クイックリンク</h2>
            <div className="space-y-3">
              {quickLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-xl border border-slate-200 p-4 hover:bg-slate-50"
                >
                  <p className="font-medium text-ink">{link.label}</p>
                  <p className="mt-1 text-sm text-slate-600">{link.description}</p>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";

import { useContent } from "@/components/content-provider";
import { QuickLinkItem } from "@/components/quick-link-item";
import { SearchBar } from "@/components/search-bar";
import { SearchResults } from "@/components/search-results";
import { useRole } from "@/components/role-provider";
import { useSearchTelemetry } from "@/components/use-search-telemetry";
import {
  listPublishedAnnouncements,
  listRecentVisibleArticles,
  listSortedQuickLinks,
  searchContent
} from "@/lib/content-helpers";
import { listTaskHubsForRole } from "@/lib/task-hubs";
import { formatDate } from "@/lib/utils";
import type { Category } from "@/types/domain";

/**
 * ホーム画面 v2 — Editorial Enterprise (Gothic)
 *
 * 設計意図:
 * - 社内マニュアル基盤のため、装飾ではなく「情報階層とタイポグラフィ」で差別化する。
 * - 可読性を最優先: 本文 18px (text-lg)、行間 1.6〜1.75、見出しは 24 / 30 / 40px で明確な階層。
 * - 書体は視認性の高いゴシック体 (ヒラギノ角ゴ / 游ゴシック / メイリオ) 統一。
 * - セクション番号は等幅の補助ラベル (12px) に抑え、主役は本文と見出し。
 * - 色は既存トークン (accent-teal / accent-gold) のみ。
 * - データ経路 (useContent / useRole / searchContent 等) は v1 と完全に同一。UI層だけを刷新。
 */

const HERO_PREVIEW_LIMIT = 5;
const HERO_SEARCH_LIMIT = 50;
const RECENT_ARTICLE_LIMIT = 5;
const TASK_HUB_LIMIT = 3;
const ANNOUNCEMENT_LIMIT = 3;

const displayFont = { fontFamily: "var(--font-display)" } as const;
const monoFont = { fontFamily: "var(--font-mono)" } as const;

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
  const taskHubs = useMemo(
    () => listTaskHubsForRole(role).slice(0, TASK_HUB_LIMIT),
    [role]
  );
  const recentArticles = useMemo(
    () => listRecentVisibleArticles(content, role, RECENT_ARTICLE_LIMIT),
    [content, role]
  );
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
    <div className="space-y-14 sm:space-y-20">
      {/* 00 / COMMAND — Hero search */}
      <section aria-label="社内情報検索" className="animate-fade-in">
        <SectionLabel number="00" label="COMMAND" />
        <h2
          style={displayFont}
          className="mt-3 text-3xl font-bold leading-[1.3] text-text-primary sm:text-4xl"
        >
          社内情報を検索
        </h2>
        <p className="mt-3 max-w-2xl text-lg leading-8 text-text-secondary">
          記事・FAQ・お知らせを横断し、必要な根拠に最短で辿り着きます。
        </p>

        <div className="mt-7 max-w-3xl">
          <SearchBar value={query} onChange={setQuery} onSubmit={handleSearchSubmit} />
        </div>

        <div className="mt-5 max-w-3xl">
          {trimmedQuery ? (
            <SearchResults
              results={previewResults}
              query={trimmedQuery}
              footer={
                hasMore ? (
                  <Link
                    href={searchPageHref}
                    className="mt-1 block rounded-lg border border-line-subtle bg-surface-2 px-4 py-3 text-center text-base text-accent-teal transition-colors hover:bg-surface-3"
                  >
                    すべての結果を見る（{results.length}件） →
                  </Link>
                ) : null
              }
            />
          ) : (
            <p
              style={monoFont}
              className="text-xs uppercase tracking-[0.2em] text-text-muted"
            >
              ENTER ▸ 全件検索 &nbsp;·&nbsp; ⌘K ▸ コマンドパレット
            </p>
          )}
        </div>
      </section>

      <Divider />

      {/* 01 / PRIORITY — Task Hubs */}
      <section
        className="animate-fade-in"
        style={{ animationDelay: "60ms", animationFillMode: "both" }}
      >
        <SectionHeader number="01" label="PRIORITY" title="今すぐ着手する" />
        <ol className="mt-8 border-y border-line-subtle">
          {taskHubs.map((hub, idx) => (
            <li
              key={hub.slug}
              className={idx > 0 ? "border-t border-line-subtle/60" : undefined}
            >
              <Link
                href="/tasks"
                className="group grid grid-cols-[3rem_1fr_auto] items-start gap-4 px-1 py-6 transition-colors hover:bg-surface-1/50 sm:gap-6"
              >
                <span
                  style={monoFont}
                  className="pt-1 text-sm text-accent-gold"
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <p
                    style={monoFont}
                    className="text-xs uppercase tracking-[0.22em] text-accent-gold"
                  >
                    priority {hub.priority}
                  </p>
                  <p
                    style={displayFont}
                    className="mt-2 text-xl font-semibold leading-snug text-text-primary transition-colors group-hover:text-accent-teal sm:text-2xl"
                  >
                    {hub.title}
                  </p>
                  <p className="mt-2 line-clamp-2 text-base leading-7 text-text-secondary">
                    {hub.summary}
                  </p>
                </div>
                <ArrowUpRight
                  className="mt-2 h-5 w-5 shrink-0 text-text-muted transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-teal"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ol>
        <div className="mt-4 text-right">
          <Link
            href="/tasks"
            style={monoFont}
            className="text-xs uppercase tracking-[0.22em] text-accent-teal underline-offset-4 hover:underline"
          >
            view all tasks →
          </Link>
        </div>
      </section>

      <Divider />

      {/* 02 / TODAY — Announcements + Recent Articles */}
      <section
        className="animate-fade-in"
        style={{ animationDelay: "120ms", animationFillMode: "both" }}
      >
        <SectionHeader number="02" label="TODAY" title="本日の要点" />
        <div className="mt-8 grid gap-10 md:grid-cols-2 md:gap-10 lg:gap-14">
          <ColumnList
            labelMono="— announcements"
            trailing={
              <Link
                href="/announcements"
                style={monoFont}
                className="text-xs uppercase tracking-[0.22em] text-text-muted transition-colors hover:text-accent-teal"
              >
                all →
              </Link>
            }
          >
            {announcements.slice(0, ANNOUNCEMENT_LIMIT).map((a) => (
              <li key={a.id} className="py-5">
                <p
                  style={monoFont}
                  className="text-xs uppercase tracking-[0.22em] text-text-muted"
                >
                  {formatDate(a.publishedAt)}
                </p>
                <p
                  style={displayFont}
                  className="mt-2 text-lg font-semibold leading-8 text-text-primary"
                >
                  {a.title}
                </p>
                <p className="mt-2 line-clamp-2 text-base leading-7 text-text-secondary">
                  {a.body}
                </p>
              </li>
            ))}
          </ColumnList>

          <ColumnList labelMono="— recently updated">
            {recentArticles.map((article, i) => (
              <li key={article.id}>
                <Link
                  href={`/articles/${article.slug}` as Route}
                  className="group grid grid-cols-[2.5rem_1fr] items-baseline gap-3 py-5"
                >
                  <span
                    style={monoFont}
                    className="text-sm text-text-muted transition-colors group-hover:text-accent-teal"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <p
                      style={monoFont}
                      className="text-xs uppercase tracking-[0.22em] text-text-muted"
                    >
                      {formatDate(article.updatedAt)}
                    </p>
                    <p
                      style={displayFont}
                      className="mt-2 text-lg font-semibold leading-8 text-text-primary transition-colors group-hover:text-accent-teal"
                    >
                      {article.title}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ColumnList>
        </div>
      </section>

      <Divider />

      {/* 03 / DOMAINS — Categories */}
      <section
        className="animate-fade-in"
        style={{ animationDelay: "180ms", animationFillMode: "both" }}
      >
        <SectionHeader number="03" label="DOMAINS" title="領域から辿る" />
        <ul className="mt-8 grid border-t border-line-subtle sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, idx) => (
            <li key={category.id} className="border-b border-line-subtle/60">
              <Link
                href={`/categories/${category.slug}` as Route}
                className="group flex h-full flex-col p-6 transition-colors hover:bg-surface-1/50"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span
                    style={monoFont}
                    className="text-xs uppercase tracking-[0.22em] text-text-muted"
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span
                    style={monoFont}
                    className="text-xs uppercase tracking-[0.18em] text-text-muted"
                  >
                    {category.ownerDepartment}
                  </span>
                </div>
                <h3
                  style={displayFont}
                  className="mt-4 text-2xl font-semibold leading-snug text-text-primary transition-colors group-hover:text-accent-teal"
                >
                  {category.name}
                </h3>
                <p className="mt-3 text-base leading-7 text-text-secondary">
                  {category.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <Divider />

      {/* 04 / EXTERNAL — Quick Links */}
      <section
        className="animate-fade-in"
        style={{ animationDelay: "240ms", animationFillMode: "both" }}
      >
        <SectionHeader number="04" label="EXTERNAL" title="外部参照" />
        <ul className="mt-8 border-y border-line-subtle">
          {quickLinks.map((link, idx) => (
            <li
              key={link.id}
              className={idx > 0 ? "border-t border-line-subtle/60" : undefined}
            >
              <QuickLinkItem
                link={link}
                className="block px-1 py-5 transition-colors hover:bg-surface-1/50"
              />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function SectionLabel({ number, label }: { number: string; label: string }) {
  return (
    <p
      style={monoFont}
      className="text-xs uppercase tracking-[0.3em] text-accent-teal"
    >
      {number} / {label}
    </p>
  );
}

function SectionHeader({
  number,
  label,
  title
}: {
  number: string;
  label: string;
  title: string;
}) {
  return (
    <div>
      <SectionLabel number={number} label={label} />
      <h2
        style={displayFont}
        className="mt-3 text-3xl font-bold leading-[1.3] text-text-primary sm:text-4xl"
      >
        {title}
      </h2>
    </div>
  );
}

function ColumnList({
  labelMono,
  trailing,
  children
}: {
  labelMono: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between border-b border-line-subtle pb-3">
        <h3
          style={monoFont}
          className="text-xs uppercase tracking-[0.24em] text-text-muted"
        >
          {labelMono}
        </h3>
        {trailing}
      </div>
      <ul className="divide-y divide-line-subtle/60">{children}</ul>
    </div>
  );
}

function Divider() {
  return <div aria-hidden className="h-px bg-line-subtle/50" />;
}

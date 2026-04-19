"use client";

import type { Route } from "next";
import Link from "next/link";
import { Bot } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { SearchResult } from "@/types/domain";

/**
 * 横断検索結果のカードリスト表示（純粋コンポーネント）。
 * ホームのヒーロー検索と /search ページで同一の見た目・挙動を保つためのSSOT。
 * 「もっと見る」など周辺UIは呼び出し側に委ねるため footer slot を採用。
 * query を渡すとゼロ件時にAI案内へクエリを引き継いだCTAを表示する。
 */
export function SearchResults({
  results,
  query,
  footer,
  emptyFallback
}: {
  results: SearchResult[];
  query?: string;
  footer?: React.ReactNode;
  emptyFallback?: React.ReactNode;
}) {
  if (results.length === 0) {
    if (emptyFallback) return <>{emptyFallback}</>;

    const aiGuideHref = query
      ? (`/ai-guide?q=${encodeURIComponent(query)}` as Route)
      : "/ai-guide";

    return (
      <div className="space-y-3">
        {/* AI案内への主導線 — ゼロ件時の主役 */}
        <Link
          href={aiGuideHref}
          className="group flex items-start gap-3 rounded-xl border border-accent-teal/30 bg-accent-teal/5 p-4 transition-colors hover:border-accent-teal/50 hover:bg-accent-teal/10"
        >
          <Bot className="mt-0.5 h-5 w-5 shrink-0 text-accent-teal" aria-hidden />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-accent-teal">
              AI案内で探してみてください
            </p>
            <p className="mt-0.5 text-xs leading-5 text-text-secondary">
              {query
                ? `「${query}」について、社内記事・FAQをもとに自然文で案内します。`
                : "自然文で質問すると、社内記事・FAQをもとに案内します。"}
            </p>
          </div>
          <span className="ml-auto shrink-0 text-xs text-accent-teal opacity-70 transition-opacity group-hover:opacity-100">
            →
          </span>
        </Link>

        {/* 二次導線 */}
        <div className="flex flex-wrap gap-3 px-1">
          <Link href="/tasks" className="text-xs text-text-muted transition-colors hover:text-accent-teal">
            タスクハブを見る
          </Link>
          <Link href="/categories" className="text-xs text-text-muted transition-colors hover:text-accent-teal">
            カテゴリから探す
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {results.map((result) => (
        <Link
          key={`${result.type}-${result.id}`}
          href={result.href}
          className="block rounded-lg border border-line-subtle bg-surface-2 p-3.5 transition-all hover:border-accent-teal/30 hover:bg-surface-3 animate-fade-in"
        >
          <div className="mb-1.5 flex items-center gap-2">
            <Badge>{result.type === "article" ? "記事" : "FAQ"}</Badge>
            <span className="text-xs text-text-muted">{result.categoryName}</span>
          </div>
          <p className="text-sm font-semibold text-text-primary">{result.title}</p>
          <p className="mt-1 text-xs leading-5 text-text-secondary">{result.summary}</p>
        </Link>
      ))}
      {footer}
    </div>
  );
}

"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import type { SearchResult } from "@/types/domain";

/**
 * 横断検索結果のカードリスト表示（純粋コンポーネント）。
 * ホームのヒーロー検索と /search ページで同一の見た目・挙動を保つためのSSOT。
 * 「もっと見る」など周辺UIは呼び出し側に委ねるため footer slot を採用。
 */
export function SearchResults({
  results,
  footer,
  emptyFallback
}: {
  results: SearchResult[];
  footer?: React.ReactNode;
  emptyFallback?: React.ReactNode;
}) {
  if (results.length === 0) {
    return (
      emptyFallback ?? (
        <div className="rounded-lg border border-line-subtle bg-surface-2 p-4 text-sm text-text-secondary">
          <p>一致する記事または FAQ が見つかりませんでした。</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link href="/tasks" className="text-sm text-accent-teal hover:underline underline-offset-4">
              タスクハブを見る
            </Link>
            <Link href="/categories" className="text-sm text-accent-teal hover:underline underline-offset-4">
              カテゴリから探す
            </Link>
            <Link href="/ai-guide" className="text-sm text-accent-teal hover:underline underline-offset-4">
              AI案内を試す
            </Link>
          </div>
        </div>
      )
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

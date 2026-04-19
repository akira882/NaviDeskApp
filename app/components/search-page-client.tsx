"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useContent } from "@/components/content-provider";
import { SearchBar } from "@/components/search-bar";
import { SearchResults } from "@/components/search-results";
import { useSearchTelemetry } from "@/components/use-search-telemetry";
import { Card, CardContent } from "@/components/ui/card";
import { useRole } from "@/components/role-provider";
import { searchContent } from "@/lib/content-helpers";
import type { Category } from "@/types/domain";

const SEARCH_PAGE_LIMIT = 50;

/**
 * /search?q=... 専用検索ページのクライアント本体。
 *
 * 設計方針:
 * - URL の q が正本 (SSOT)。ブラウザの戻る/進む・共有URLでの着地に対応するため
 *   useSearchParams を監視し、state と同期する。
 * - タイピング中は URL を更新しない。機密を含みうるクエリが履歴/監査ログを汚染するのを避け、
 *   Enter 押下時のみ router.replace で反映する（history push すると戻るボタンが連打に耐えない）。
 * - 検索ロジック (searchContent) はホームと共通。limit のみ拡張して全件を見せる。
 */
export function SearchPageClient({
  categories,
  initialQuery
}: {
  categories: Category[];
  initialQuery: string;
}) {
  const { role } = useRole();
  const content = useContent();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);

  // URL q の変更（ブラウザ戻る/進む、外部からの遷移）に state を追従させる。
  // setQuery の functional update で前回値と比較するため query を依存に含めない（ループ防止）。
  useEffect(() => {
    const urlQuery = searchParams.get("q") ?? "";
    setQuery((prev) => (prev === urlQuery ? prev : urlQuery));
  }, [searchParams]);

  const trimmedQuery = query.trim();
  const results = useMemo(
    () => searchContent(content, categories, query, role, { limit: SEARCH_PAGE_LIMIT }),
    [categories, content, query, role]
  );
  useSearchTelemetry({ query, surface: "search-page", resultCount: results.length });

  function handleSubmit() {
    const next = query.trim();
    if (next) {
      router.replace(`/search?q=${encodeURIComponent(next)}`);
    } else {
      router.replace("/search");
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardContent className="space-y-3 sm:space-y-4">
          <SearchBar value={query} onChange={setQuery} onSubmit={handleSubmit} />
          <p className="text-xs text-text-muted">
            Enterで検索URLを確定 · 共有可能なリンクになります
          </p>
        </CardContent>
      </Card>

      {trimmedQuery ? (
        <>
          <p className="text-sm text-text-secondary">
            「<span className="font-semibold text-text-primary">{trimmedQuery}</span>」の検索結果：{results.length}件
          </p>
          <SearchResults results={results} query={trimmedQuery} />
        </>
      ) : (
        <Card>
          <CardContent className="text-sm text-text-secondary">
            検索ワードを入力してください。記事・FAQ・お知らせを横断して検索できます。
          </CardContent>
        </Card>
      )}
    </div>
  );
}

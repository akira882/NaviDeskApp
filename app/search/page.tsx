import { Suspense } from "react";

import { AppShell } from "@/components/app-shell";
import { SearchPageClient } from "@/components/search-page-client";
import { categoryRepository } from "@/data/repositories/content-repository";

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const initialQuery = typeof q === "string" ? q : "";

  return (
    <AppShell
      title="検索"
      description="社内記事、FAQ、お知らせを横断して検索します。ロールに応じて閲覧範囲が制御されます。"
    >
      <Suspense fallback={null}>
        <SearchPageClient
          categories={categoryRepository.list()}
          initialQuery={initialQuery}
        />
      </Suspense>
    </AppShell>
  );
}

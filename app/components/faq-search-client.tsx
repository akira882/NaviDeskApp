"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { useContent } from "@/components/content-provider";
import { SearchBar } from "@/components/search-bar";
import { useSearchTelemetry } from "@/components/use-search-telemetry";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { useRole } from "@/components/role-provider";
import { listVisibleFaqs, searchFaqs } from "@/lib/content-helpers";
import { formatDate } from "@/lib/utils";
import type { Category, FAQ } from "@/types/domain";

export function FAQSearchClient({
  categories,
  highlightId
}: {
  categories: Category[];
  highlightId?: string;
}) {
  const { role } = useRole();
  const content = useContent();
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const results = useMemo(() => searchFaqs(content, { query, categoryId, role }), [categoryId, content, query, role]);
  const displayFaqs: FAQ[] = query || categoryId ? results : listVisibleFaqs(content, role);
  useSearchTelemetry({ query, surface: "faq", resultCount: results.length });

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardContent className="grid gap-3 sm:gap-4 sm:grid-cols-[1.6fr_0.6fr]">
          <SearchBar value={query} onChange={setQuery} placeholder="質問文、キーワード、タグで検索" />
          <Select value={categoryId} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setCategoryId(event.target.value)}>
            <option value="">すべてのカテゴリ</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </CardContent>
      </Card>

      <div className="space-y-3 sm:space-y-4">
        {displayFaqs.map((faq) => {
          const isHighlight = faq.id === highlightId;
          const categoryName = categories.find((category) => category.id === faq.categoryId)?.name ?? "未分類";

          return (
            <Card key={faq.id} className={isHighlight ? "border-teal-600" : undefined}>
              <CardContent className="space-y-2.5 sm:space-y-3">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <Badge className="text-xs">{categoryName}</Badge>
                  {faq.tags.map((tag) => (
                    <Badge key={tag} className="bg-slate-50 text-xs">
                      {tag}
                    </Badge>
                  ))}
                  <span className="text-xs text-slate-500">更新日: {formatDate(faq.updatedAt)}</span>
                </div>
                <h2 className="text-base font-semibold text-ink sm:text-lg">{faq.question}</h2>
                <p className="text-xs leading-6 text-slate-700 sm:text-sm sm:leading-7">{faq.answer}</p>
              </CardContent>
            </Card>
          );
        })}
        {displayFaqs.length === 0 ? (
          <Card>
            <CardContent className="space-y-3 text-xs text-slate-600 sm:text-sm">
              <p>条件に一致する FAQ が見つかりませんでした。</p>
              <div className="flex flex-wrap gap-2">
                <Link href="/categories" className="font-medium text-teal-700 underline underline-offset-4">カテゴリから確認する</Link>
                <Link href="/ai-guide" className="font-medium text-teal-700 underline underline-offset-4">AI案内で関連候補を見る</Link>
                <Link href="/articles/helpdesk-contact" className="font-medium text-teal-700 underline underline-offset-4">ITサポートデスクへ問い合わせ</Link>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

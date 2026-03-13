"use client";

import { useMemo, useState } from "react";

import { useContent } from "@/components/content-provider";
import { SearchBar } from "@/components/search-bar";
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

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="grid gap-4 md:grid-cols-[1.6fr_0.6fr]">
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

      <div className="space-y-4">
        {displayFaqs.map((faq) => {
          const isHighlight = faq.id === highlightId;
          const categoryName = categories.find((category) => category.id === faq.categoryId)?.name ?? "未分類";

          return (
            <Card key={faq.id} className={isHighlight ? "border-teal-600" : undefined}>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{categoryName}</Badge>
                  {faq.tags.map((tag) => (
                    <Badge key={tag} className="bg-slate-50">
                      {tag}
                    </Badge>
                  ))}
                  <span className="text-xs text-slate-500">更新日: {formatDate(faq.updatedAt)}</span>
                </div>
                <h2 className="text-lg font-semibold text-ink">{faq.question}</h2>
                <p className="text-sm leading-7 text-slate-700">{faq.answer}</p>
              </CardContent>
            </Card>
          );
        })}
        {displayFaqs.length === 0 ? (
          <Card>
            <CardContent className="text-sm text-slate-600">条件に一致する FAQ が見つかりませんでした。</CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

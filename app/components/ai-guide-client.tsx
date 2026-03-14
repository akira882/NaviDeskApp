"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { useContent } from "@/components/content-provider";
import { useRole } from "@/components/role-provider";
import { SearchBar } from "@/components/search-bar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { categoryRepository } from "@/data/repositories/content-repository";
import { answerGuide } from "@/lib/ai/guide-service";

export function AiGuideClient() {
  const { role } = useRole();
  const content = useContent();
  const [question, setQuestion] = useState("");
  const result = useMemo(
    () => answerGuide({ question, role, state: content, categories: categoryRepository.list() }),
    [content, question, role]
  );

  return (
    <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
      <Card>
        <CardContent className="space-y-3 sm:space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-ink sm:text-xl">AI案内</h2>
            <p className="mt-1.5 text-xs leading-5 text-slate-600 sm:mt-2 sm:text-sm sm:leading-6">
              先に社内記事と FAQ を検索し、根拠が弱い場合は断定せず通常検索候補へフォールバックします。
            </p>
          </div>
          <SearchBar value={question} onChange={setQuestion} placeholder="例: VPNに接続できないときの確認手順は？" />
          <p className="rounded-xl bg-surface-muted p-3 text-xs text-slate-600 sm:p-4 sm:text-sm">
            AI は制度や手順を創作しません。根拠がない場合は「分からない」と返し、候補のみ表示します。
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 sm:space-y-4">
          <h2 className="text-lg font-semibold text-ink sm:text-xl">回答結果</h2>
          {!question ? (
            <p className="text-sm text-slate-600">質問を入力すると、社内コンテンツを根拠にした案内を表示します。</p>
          ) : result.mode === "answer" ? (
            <>
              <div className="rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm leading-7 text-slate-700">
                {result.answer}
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium text-ink">根拠候補</p>
                {result.citations.map((citation) => (
                  <Link key={citation.id} href={citation.href} className="block rounded-xl border border-slate-200 p-4 hover:bg-slate-50">
                    <div className="mb-2 flex items-center gap-2">
                      <Badge>{citation.type === "article" ? "記事" : "FAQ"}</Badge>
                      <Badge className="bg-slate-50">{citation.categoryName}</Badge>
                    </div>
                    <p className="font-medium text-ink">{citation.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{citation.summary}</p>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-slate-700">
                {result.message}
              </div>
              <div className="space-y-3">
                {result.suggestions.length > 0 ? (
                  result.suggestions.map((suggestion) => (
                    <Link key={suggestion.id} href={suggestion.href} className="block rounded-xl border border-slate-200 p-4 hover:bg-slate-50">
                      <div className="mb-2 flex items-center gap-2">
                        <Badge>{suggestion.type === "article" ? "記事" : "FAQ"}</Badge>
                        <Badge className="bg-slate-50">{suggestion.categoryName}</Badge>
                      </div>
                      <p className="font-medium text-ink">{suggestion.title}</p>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-slate-600">関連候補は見つかりませんでした。別キーワードで再検索してください。</p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useRole } from "@/components/role-provider";
import { SearchBar } from "@/components/search-bar";
import { Button } from "@/components/ui/button";
import { useSearchTelemetry } from "@/components/use-search-telemetry";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { AiResponse } from "@/types/domain";

function isAiResponse(value: unknown): value is AiResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return candidate.mode === "answer" || candidate.mode === "fallback";
}

function buildImprovementReport(params: {
  question: string;
  details: string;
  result: Extract<AiResponse, { mode: "fallback" }>;
}) {
  const { question, details, result } = params;
  const suggestionsText = result.suggestions.length > 0
    ? result.suggestions.map((suggestion, index) => `${index + 1}. ${suggestion.title} (${suggestion.categoryName})`).join("\n")
    : "候補なし";

  return [
    "件名: AI案内 改善要求レポート",
    "",
    `質問内容: ${question}`,
    `AI案内の結果: ${result.message}`,
    "",
    "関連候補:",
    suggestionsText,
    "",
    "改善してほしい内容:",
    details.trim() || "入力なし",
    "",
    "期待する対応:",
    "- AI案内で自然言語の回答を返せるようにしたい",
    "- 必要に応じて記事やFAQの根拠強化を行ってほしい"
  ].join("\n");
}

export function AiGuideClient() {
  const { role } = useRole();
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<AiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportDetails, setReportDetails] = useState("");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  useEffect(() => {
    if (!question.trim()) {
      setResult(null);
      setShowReportForm(false);
      setReportDetails("");
      setCopyStatus("idle");
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    // Call AI guide API with debounce
    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch("/api/ai-guide", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ question, role })
        });
        const payload: unknown = await response.json().catch(() => null);

        if (!response.ok && !isAiResponse(payload)) {
          throw new Error("API request failed");
        }

        if (!isAiResponse(payload)) {
          throw new Error("Invalid AI response");
        }

        if (!cancelled) {
          setResult(payload);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("AI guide API error:", error);
        if (!cancelled) {
          setResult({
            mode: "fallback",
            message: "AI案内の取得中にエラーが発生しました。通常の検索をお試しください。",
            suggestions: []
          });
          setIsLoading(false);
        }
      }
    }, 500); // 500ms debounce

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [question, role]);

  useSearchTelemetry({
    query: question,
    surface: "ai-guide",
    resultCount: result?.mode === "answer" ? result.citations.length : result?.suggestions.length ?? 0
  });

  const canReportWeakEvidence = result?.mode === "fallback" && result.suggestions.length > 0;

  async function handleCopyReport() {
    if (!result || result.mode !== "fallback") {
      return;
    }

    const reportBody = buildImprovementReport({
      question,
      details: reportDetails,
      result
    });

    try {
      await navigator.clipboard.writeText(reportBody);
      setCopyStatus("copied");
    } catch (error) {
      console.error("Failed to copy improvement report:", error);
      setCopyStatus("error");
    }
  }

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
          ) : isLoading ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-600">
              AI案内を生成中...
            </div>
          ) : !result ? (
            <p className="text-sm text-slate-600">質問を入力してください。</p>
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
                  <>
                    {result.suggestions.map((suggestion) => (
                      <Link key={suggestion.id} href={suggestion.href} className="block rounded-xl border border-slate-200 p-4 hover:bg-slate-50">
                        <div className="mb-2 flex items-center gap-2">
                          <Badge>{suggestion.type === "article" ? "記事" : "FAQ"}</Badge>
                          <Badge className="bg-slate-50">{suggestion.categoryName}</Badge>
                        </div>
                        <p className="font-medium text-ink">{suggestion.title}</p>
                      </Link>
                    ))}

                    {canReportWeakEvidence ? (
                      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-ink">運営社へ改善要求をレポート</p>
                          <p className="text-sm text-slate-600">
                            根拠が弱く自然言語の回答を返せなかった場合、質問内容と候補記事を含むレポート下書きを作成できます。
                          </p>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button type="button" variant="secondary" onClick={() => setShowReportForm((current) => !current)}>
                            {showReportForm ? "レポート入力を閉じる" : "改善要求を作成"}
                          </Button>
                          <Link href="/articles/helpdesk-contact" className="inline-flex h-10 items-center rounded-lg border border-line-subtle px-4 text-sm font-medium text-ink hover:bg-white">
                            問い合わせ先を確認
                          </Link>
                        </div>

                        {showReportForm ? (
                          <div className="mt-4 space-y-3">
                            <Textarea
                              value={reportDetails}
                              onChange={(event) => {
                                setReportDetails(event.target.value);
                                setCopyStatus("idle");
                              }}
                              placeholder="例: VPNの記事は見つかるが、接続エラー時の切り分け手順を自然文で返してほしい"
                            />
                            <div className="rounded-lg bg-white p-3 text-xs leading-6 text-slate-600">
                              <p className="font-medium text-ink">レポートに含まれる内容</p>
                              <p>質問文、AI案内メッセージ、関連候補、追加の改善要望を自動でまとめます。</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <Button type="button" onClick={handleCopyReport}>
                                レポート内容をコピー
                              </Button>
                              {copyStatus === "copied" ? (
                                <p className="text-sm text-teal-700">コピーしました。運営社への報告にそのまま使えます。</p>
                              ) : null}
                              {copyStatus === "error" ? (
                                <p className="text-sm text-rose-700">コピーに失敗しました。ブラウザの権限を確認してください。</p>
                              ) : null}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="space-y-2 text-sm text-slate-600">
                    <p>関連候補は見つかりませんでした。別キーワードで再検索してください。</p>
                    <Link href="/articles/helpdesk-contact" className="inline-block font-medium text-teal-700 underline underline-offset-4">ITサポートデスクへ問い合わせ</Link>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

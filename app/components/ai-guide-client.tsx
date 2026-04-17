"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bot, AlertTriangle, CheckCircle2, Copy, Check } from "lucide-react";

import { useRole } from "@/components/role-provider";
import { SearchBar } from "@/components/search-bar";
import { Button } from "@/components/ui/button";
import { useSearchTelemetry } from "@/components/use-search-telemetry";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { AiResponse } from "@/types/domain";

function isAiResponse(value: unknown): value is AiResponse {
  if (!value || typeof value !== "object") return false;
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
    ? result.suggestions.map((s, i) => `${i + 1}. ${s.title} (${s.categoryName})`).join("\n")
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

    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch("/api/ai-guide", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question, role })
        });
        const payload: unknown = await response.json().catch(() => null);
        if (!response.ok && !isAiResponse(payload)) throw new Error("API request failed");
        if (!isAiResponse(payload)) throw new Error("Invalid AI response");
        if (!cancelled) { setResult(payload); setIsLoading(false); }
      } catch (error) {
        console.error("AI guide API error:", error);
        if (!cancelled) {
          setResult({ mode: "fallback", message: "AI案内の取得中にエラーが発生しました。通常の検索をお試しください。", suggestions: [] });
          setIsLoading(false);
        }
      }
    }, 500);

    return () => { cancelled = true; clearTimeout(timeoutId); };
  }, [question, role]);

  useSearchTelemetry({
    query: question,
    surface: "ai-guide",
    resultCount: result?.mode === "answer" ? result.citations.length : result?.suggestions.length ?? 0
  });

  const canReportWeakEvidence = result?.mode === "fallback" && result.suggestions.length > 0;

  async function handleCopyReport() {
    if (!result || result.mode !== "fallback") return;
    try {
      await navigator.clipboard.writeText(buildImprovementReport({ question, details: reportDetails, result }));
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  }

  return (
    <div className="grid gap-5 sm:gap-6 md:grid-cols-2">
      <Card>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Bot className="h-4 w-4 text-accent-teal" />
              <h2 className="text-base font-semibold text-text-primary sm:text-lg">AI案内</h2>
            </div>
            <p className="text-sm leading-6 text-text-secondary">
              先に社内記事と FAQ を検索し、根拠が弱い場合は断定せず候補のみ表示します。
            </p>
          </div>
          <SearchBar value={question} onChange={setQuestion} placeholder="例: VPNに接続できないときの確認手順は？" />
          <div className="rounded-lg border border-line-subtle bg-surface-2 p-3.5 text-sm text-text-secondary leading-6">
            AI は制度や手順を創作しません。根拠がない場合は「分からない」と返し、候補のみ表示します。
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-text-primary sm:text-lg">回答結果</h2>
            {result?.mode === "answer" && (
              <Badge className="border-accent-green/25 bg-accent-green/10 text-accent-green">回答あり</Badge>
            )}
            {result?.mode === "fallback" && (
              <Badge className="border-accent-gold/25 bg-accent-gold/10 text-accent-gold">根拠不足</Badge>
            )}
          </div>

          {!question ? (
            <p className="text-sm text-text-muted">質問を入力すると、社内コンテンツをもとにした案内を表示します。</p>
          ) : isLoading ? (
            <div className="flex items-center gap-2 rounded-lg border border-line-subtle bg-surface-2 p-4 text-sm text-text-secondary">
              <Bot className="h-4 w-4 text-accent-teal animate-pulse" />
              AI案内を生成中...
            </div>
          ) : !result ? (
            <p className="text-sm text-text-muted">質問を入力してください。</p>
          ) : result.mode === "answer" ? (
            <>
              <div className="rounded-lg border border-accent-teal/20 bg-accent-teal/5 p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-accent-teal" />
                  <span className="text-xs font-medium text-accent-teal">回答</span>
                </div>
                <p className="text-sm leading-7 text-text-secondary">{result.answer}</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-text-muted">根拠候補</p>
                {result.citations.map((citation) => (
                  <Link key={citation.id} href={citation.href} className="block rounded-lg border border-line-subtle p-3.5 hover:bg-surface-2 transition-colors">
                    <div className="mb-1.5 flex items-center gap-2">
                      <Badge>{citation.type === "article" ? "記事" : "FAQ"}</Badge>
                      <span className="text-xs text-text-muted">{citation.categoryName}</span>
                    </div>
                    <p className="text-sm font-semibold text-text-primary">{citation.title}</p>
                    <p className="mt-1 text-xs text-text-secondary">{citation.summary}</p>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="rounded-lg border border-accent-gold/20 bg-accent-gold/5 p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-accent-gold" />
                  <span className="text-xs font-medium text-accent-gold">根拠が不十分のため案内できません</span>
                </div>
                <p className="text-sm leading-7 text-text-secondary">{result.message}</p>
              </div>
              <div className="space-y-2">
                {result.suggestions.length > 0 ? (
                  <>
                    <p className="text-xs font-medium text-text-muted">関連する候補</p>
                    {result.suggestions.map((suggestion) => (
                      <Link key={suggestion.id} href={suggestion.href} className="block rounded-lg border border-line-subtle p-3.5 hover:bg-surface-2 transition-colors">
                        <div className="mb-1.5 flex items-center gap-2">
                          <Badge>{suggestion.type === "article" ? "記事" : "FAQ"}</Badge>
                          <span className="text-xs text-text-muted">{suggestion.categoryName}</span>
                        </div>
                        <p className="text-sm font-semibold text-text-primary">{suggestion.title}</p>
                      </Link>
                    ))}

                    {canReportWeakEvidence ? (
                      <div className="rounded-lg border border-line-subtle bg-surface-2 p-4 mt-2">
                        <p className="text-sm font-semibold text-text-primary">改善要求レポートを作成</p>
                        <p className="mt-1 text-xs text-text-secondary leading-5">
                          根拠が弱く回答できなかった場合、質問内容と候補記事を含むレポート下書きを作成できます。
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button type="button" variant="secondary" size="sm" onClick={() => setShowReportForm((c) => !c)}>
                            {showReportForm ? "閉じる" : "改善要求を作成"}
                          </Button>
                          <Link href="/articles/helpdesk-contact" className="inline-flex h-7 items-center rounded-lg border border-line-mid px-3 text-xs font-medium text-text-secondary hover:bg-surface-1 transition-colors">
                            問い合わせ先を確認
                          </Link>
                        </div>

                        {showReportForm ? (
                          <div className="mt-4 space-y-3">
                            <Textarea
                              value={reportDetails}
                              onChange={(e) => { setReportDetails(e.target.value); setCopyStatus("idle"); }}
                              placeholder="例: VPNの記事は見つかるが、接続エラー時の切り分け手順を自然文で返してほしい"
                            />
                            <p className="text-xs text-text-muted leading-5">
                              質問文、AI案内メッセージ、関連候補、追加の改善要望を自動でまとめます。
                            </p>
                            <div className="flex flex-wrap items-center gap-2">
                              <Button type="button" size="sm" onClick={handleCopyReport}>
                                {copyStatus === "copied" ? <><Check className="mr-1.5 h-3 w-3" />コピー済み</> : <><Copy className="mr-1.5 h-3 w-3" />レポートをコピー</>}
                              </Button>
                              {copyStatus === "error" ? <p className="text-xs text-accent-crimson">コピーに失敗しました。</p> : null}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="space-y-2 text-sm text-text-secondary">
                    <p>関連候補は見つかりませんでした。別のキーワードで再検索してください。</p>
                    <Link href="/articles/helpdesk-contact" className="inline-block text-sm text-accent-teal hover:underline underline-offset-4">
                      社内IT企画部門へ問い合わせ →
                    </Link>
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

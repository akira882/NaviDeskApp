"use client";

import { ExternalLink, ThumbsDown, ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { INQUIRY_FORM_URL } from "@/lib/public-env";

type Vote = "helpful" | "not-helpful";

function getStorageKey(type: "article" | "faq", id: string) {
  return `navidesk:feedback:${type}:${id}`;
}

function readStoredVote(type: "article" | "faq", id: string): Vote | null {
  try {
    const stored = localStorage.getItem(getStorageKey(type, id));
    if (stored === "helpful" || stored === "not-helpful") return stored;
  } catch {}
  return null;
}

export function HelpfulFeedback({
  id,
  type,
  helpfulCount,
  notHelpfulCount,
  onVote
}: {
  id: string;
  type: "article" | "faq";
  helpfulCount: number;
  notHelpfulCount: number;
  onVote: (helpful: boolean) => void;
}) {
  const [voted, setVoted] = useState<Vote | null>(null);

  useEffect(() => {
    setVoted(readStoredVote(type, id));
  }, [type, id]);

  function handleVote(helpful: boolean) {
    const vote: Vote = helpful ? "helpful" : "not-helpful";
    setVoted(vote);
    try {
      localStorage.setItem(getStorageKey(type, id), vote);
    } catch {}
    onVote(helpful);
  }

  const displayHelpful = helpfulCount + (voted === "helpful" ? 1 : 0);
  const displayNotHelpful = notHelpfulCount + (voted === "not-helpful" ? 1 : 0);

  return (
    <div className="rounded-lg border border-line-subtle bg-surface-2 p-4">
      <p className="text-sm font-medium text-text-primary mb-3">この内容は役に立ちましたか？</p>
      {voted ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-sm text-text-secondary">フィードバックをありがとうございます。</p>
            <div className="flex items-center gap-4 text-xs text-text-muted">
              <span className={voted === "helpful" ? "text-accent-green font-medium" : ""}>
                <ThumbsUp className="inline h-3 w-3 mr-1" />
                {displayHelpful} 件
              </span>
              <span className={voted === "not-helpful" ? "text-accent-crimson font-medium" : ""}>
                <ThumbsDown className="inline h-3 w-3 mr-1" />
                {displayNotHelpful} 件
              </span>
            </div>
          </div>
          {voted === "not-helpful" && INQUIRY_FORM_URL ? (
            <div className="rounded-lg border border-line-subtle bg-surface-1 p-3">
              <p className="text-xs text-text-secondary leading-5">
                解決しなかった内容を教えていただけると、記事の改善に役立てます。
              </p>
              <a
                href={INQUIRY_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs text-accent-teal hover:underline underline-offset-4"
              >
                <ExternalLink className="h-3 w-3" />
                社内IT企画部門へ問い合わせ（フォームが開きます）
              </a>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => handleVote(true)}>
            <ThumbsUp className="mr-1.5 h-3.5 w-3.5" />
            役に立った ({helpfulCount})
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => handleVote(false)}>
            <ThumbsDown className="mr-1.5 h-3.5 w-3.5" />
            解決しなかった ({notHelpfulCount})
          </Button>
        </div>
      )}
    </div>
  );
}

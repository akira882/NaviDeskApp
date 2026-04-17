"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

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

"use client";

import { Check, Link2, Printer } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function ArticleActionBar() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      // ?from= などの参照元パラメータを除いた正規URLをコピーする
      const canonical = `${window.location.origin}${window.location.pathname}`;
      await navigator.clipboard.writeText(canonical);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="flex items-center gap-1.5" data-print-hidden>
      <Button type="button" variant="ghost" size="sm" onClick={handleCopy}>
        {copied ? (
          <>
            <Check className="mr-1.5 h-3.5 w-3.5 text-accent-green" />
            コピー済み
          </>
        ) : (
          <>
            <Link2 className="mr-1.5 h-3.5 w-3.5" />
            URLをコピー
          </>
        )}
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={handlePrint}>
        <Printer className="mr-1.5 h-3.5 w-3.5" />
        印刷 / PDF
      </Button>
    </div>
  );
}

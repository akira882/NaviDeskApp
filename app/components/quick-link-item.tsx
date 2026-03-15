"use client";

import type { Route } from "next";
import Link from "next/link";

import { isExternalQuickLink, isInternalQuickLink } from "@/lib/quick-link-catalog";
import type { QuickLink } from "@/types/domain";

export function QuickLinkItem({
  link,
  className
}: {
  link: QuickLink;
  className: string;
}) {
  if (isExternalQuickLink(link.url)) {
    return (
      <a href={link.url} target="_blank" rel="noreferrer" className={className}>
        <p className="text-sm font-medium text-ink sm:text-base">{link.label}</p>
        <p className="mt-1 text-xs text-slate-600 sm:text-sm">{link.description}</p>
      </a>
    );
  }

  if (!isInternalQuickLink(link.url)) {
    return (
      <div className={className}>
        <p className="text-sm font-medium text-ink sm:text-base">{link.label}</p>
        <p className="mt-1 text-xs text-rose-700 sm:text-sm">リンク設定が不正です。管理画面から確認してください。</p>
      </div>
    );
  }

  return (
    <Link href={link.url as Route} className={className}>
      <p className="text-sm font-medium text-ink sm:text-base">{link.label}</p>
      <p className="mt-1 text-xs text-slate-600 sm:text-sm">{link.description}</p>
    </Link>
  );
}

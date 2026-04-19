"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListChecks,
  MessageSquareText,
  Newspaper,
  Search,
  ShieldCheck,
  Bot
} from "lucide-react";

import { getRoleLabel } from "@/lib/roles";
import { useRole } from "@/components/role-provider";
import { useCommandPalette } from "@/components/command-palette";

const navItems: Array<{ href: Route; label: string; icon: typeof Search }> = [
  { href: "/", label: "ホーム", icon: Search },
  { href: "/tasks", label: "タスクハブ", icon: ListChecks },
  { href: "/ai-guide", label: "AI案内", icon: Bot },
  { href: "/categories", label: "カテゴリ", icon: LayoutDashboard },
  { href: "/faq", label: "FAQ検索", icon: MessageSquareText },
  { href: "/announcements", label: "お知らせ", icon: Newspaper },
  { href: "/admin", label: "管理", icon: ShieldCheck }
];

export function SiteHeader() {
  const { role } = useRole();
  const pathname = usePathname();
  const { open: openCommandPalette } = useCommandPalette();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line-subtle bg-ink-soft/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
        {/* Logo */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal/50">
            <span className="text-2xl font-extrabold tracking-tighter text-text-primary">NaviDesk</span>
          </Link>
          {/* Mobile actions */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={openCommandPalette}
              aria-label="検索を開く"
              className="inline-flex items-center justify-center rounded-lg border border-line-subtle bg-surface-1 p-1.5 text-text-muted transition-colors hover:bg-surface-2 hover:text-text-secondary"
            >
              <Search className="h-4 w-4" />
            </button>
            <span className="text-xs text-text-muted">ロール</span>
            <span className="rounded border border-accent-teal/25 bg-accent-teal/10 px-2 py-0.5 text-xs font-medium text-accent-teal">
              {getRoleLabel(role)}
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-wrap gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition-all duration-150",
                  active
                    ? "bg-accent-teal/10 text-accent-teal border border-accent-teal/20"
                    : "text-text-muted border border-transparent hover:bg-surface-1 hover:text-text-secondary hover:border-line-subtle"
                ].join(" ")}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <button
            type="button"
            onClick={openCommandPalette}
            aria-label="検索を開く"
            title="検索 (⌘K)"
            className="inline-flex items-center gap-2 rounded-lg border border-line-subtle bg-surface-1 px-3 py-1.5 text-sm text-text-muted transition-colors hover:bg-surface-2 hover:text-text-secondary"
          >
            <Search className="h-4 w-4" />
            <span>検索</span>
            <kbd className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[11px]">⌘K</kbd>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">ロール</span>
            <span className="rounded border border-accent-teal/25 bg-accent-teal/10 px-2 py-0.5 text-xs font-medium text-accent-teal">
              {getRoleLabel(role)}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

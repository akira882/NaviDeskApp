"use client";

import type { Route } from "next";
import Link from "next/link";
import { LayoutDashboard, MessageSquareText, Newspaper, Search, ShieldCheck } from "lucide-react";

import { getRoleLabel } from "@/lib/roles";
import { useRole } from "@/components/role-provider";
import { Badge } from "@/components/ui/badge";

const navItems: Array<{ href: Route; label: string; icon: typeof Search }> = [
  { href: "/", label: "ホーム", icon: Search },
  { href: "/ai-guide", label: "AI案内", icon: Search },
  { href: "/categories", label: "カテゴリ", icon: LayoutDashboard },
  { href: "/faq", label: "FAQ検索", icon: MessageSquareText },
  { href: "/announcements", label: "お知らせ", icon: Newspaper },
  { href: "/admin", label: "管理", icon: ShieldCheck }
];

export function SiteHeader() {
  const { role } = useRole();

  return (
    <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-3 py-3 sm:px-4 sm:py-4 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/" className="text-lg font-semibold tracking-tight text-ink sm:text-xl">
              NaviDeskApp
            </Link>
            <p className="hidden text-sm text-slate-500 sm:block">Enterprise knowledge operations portal for internal teams</p>
          </div>
          <div className="flex items-center gap-2 lg:hidden">
            <span className="text-xs text-slate-500">ロール</span>
            <Badge className="bg-teal-50 text-xs">{getRoleLabel(role)}</Badge>
          </div>
        </div>
        <nav className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap sm:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs text-slate-600 transition hover:bg-slate-100 hover:text-ink sm:gap-2 sm:px-3 sm:text-sm"
              >
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <span className="text-sm text-slate-500">セッションロール</span>
          <Badge className="bg-teal-50">{getRoleLabel(role)}</Badge>
        </div>
      </div>
    </header>
  );
}

"use client";

import type { Route } from "next";
import Link from "next/link";
import { LayoutDashboard, MessageSquareText, Newspaper, Search, ShieldCheck } from "lucide-react";

import { getRoleLabel } from "@/lib/roles";
import { roles } from "@/types/domain";
import { useRole } from "@/components/role-provider";
import { Select } from "@/components/ui/select";

const navItems: Array<{ href: Route; label: string; icon: typeof Search }> = [
  { href: "/", label: "ホーム", icon: Search },
  { href: "/categories", label: "カテゴリ", icon: LayoutDashboard },
  { href: "/faq", label: "FAQ検索", icon: MessageSquareText },
  { href: "/ai-guide", label: "AI案内", icon: Search },
  { href: "/announcements", label: "お知らせ", icon: Newspaper },
  { href: "/admin", label: "管理", icon: ShieldCheck }
];

export function SiteHeader() {
  const { role, setRole } = useRole();

  return (
    <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Link href="/" className="text-xl font-semibold tracking-tight text-ink">
            NaviDesk
          </Link>
          <p className="text-sm text-slate-500">社内情報に最短で到達するための AI 補助付きポータル</p>
        </div>
        <nav className="flex flex-wrap items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-ink"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">閲覧ロール</span>
          <Select
            value={role}
            onChange={(event) => setRole(event.target.value as typeof role)}
            className="w-40"
          >
            {roles.map((item) => (
              <option key={item} value={item}>
                {getRoleLabel(item)}
              </option>
            ))}
          </Select>
        </div>
      </div>
    </header>
  );
}

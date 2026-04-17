import Link from "next/link";
import type { Route } from "next";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-4">
      <div className="max-w-lg w-full">
        <div className="rounded-xl border border-line-subtle bg-surface-1 p-8 text-center">
          <div className="mb-6">
            <p className="text-[80px] font-black leading-none text-text-primary/10 select-none">404</p>
            <div className="flex items-center justify-center gap-2 -mt-4">
              <div className="h-px flex-1 bg-line-subtle" />
              <span className="text-xs font-medium text-accent-teal px-2">ページが見つかりません</span>
              <div className="h-px flex-1 bg-line-subtle" />
            </div>
          </div>

          <p className="text-sm text-text-secondary leading-6 mb-8">
            お探しのページは削除されたか、URLが変更された可能性があります。
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-accent-teal text-ink font-medium text-sm hover:bg-accent-teal/90 transition-colors"
            >
              ホームへ戻る
            </Link>
            <Link
              href="/faq"
              className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg border border-line-mid bg-transparent text-sm font-medium text-text-primary hover:bg-surface-2 transition-colors"
            >
              FAQで検索
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-8">
            {(
            [
              { href: "/categories", label: "カテゴリ", desc: "人事・IT・総務など" },
              { href: "/tasks", label: "タスク", desc: "勤怠・申請・手続き" },
              { href: "/ai-guide", label: "AI案内", desc: "自然文で質問可能" }
            ] as Array<{ href: Route; label: string; desc: string }>
          ).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg border border-line-subtle p-3 hover:border-line-mid hover:bg-surface-2 transition-colors text-left"
              >
                <p className="text-xs font-medium text-text-primary">{item.label}</p>
                <p className="text-[10px] text-text-muted mt-0.5">{item.desc}</p>
              </Link>
            ))}
          </div>

          <div className="pt-5 border-t border-line-subtle">
            <Link
              href="/articles/helpdesk-contact"
              className="text-xs text-accent-teal hover:underline underline-offset-4"
            >
              社内IT企画部門へ問い合わせ →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

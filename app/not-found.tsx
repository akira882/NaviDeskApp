import Link from "next/link";

/**
 * 404 Not Found Page
 *
 * ページが見つからない場合に表示されます。
 * ユーザーが迷子にならないよう、明確な次のアクションを提示します。
 *
 * DESIGN PRINCIPLES:
 * 1. ユーザーフレンドリーなメッセージ（技術用語を避ける）
 * 2. 明確な次のアクション（ホーム、FAQ、社内IT企画部門）
 * 3. ブランドカラーを使用したデザイン統一
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-muted px-4">
      <div className="max-w-2xl w-full p-8 bg-white rounded-lg shadow-panel text-center">
        {/* 404 Icon */}
        <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-accent-teal/10 rounded-full">
          <svg
            className="w-12 h-12 text-accent-teal"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-6xl font-bold text-accent-teal mb-4">404</h1>
        <h2 className="text-2xl font-bold text-ink mb-4">
          ページが見つかりません
        </h2>

        {/* Description */}
        <p className="text-ink-soft mb-8 leading-relaxed">
          お探しのページは削除されたか、URLが変更された可能性があります。
          <br />
          下記のリンクから目的の情報をお探しください。
        </p>

        {/* Primary Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent-teal text-white font-medium rounded-lg hover:bg-accent-teal/90 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            ホームへ戻る
          </Link>

          <Link
            href="/faq"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-accent-teal text-accent-teal font-medium rounded-lg hover:bg-accent-teal/5 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            FAQで検索
          </Link>
        </div>

        {/* Secondary Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Link
            href="/categories"
            className="p-4 rounded-lg border border-line-subtle hover:bg-surface-muted transition-colors"
          >
            <h3 className="text-sm font-medium text-ink mb-1">カテゴリから探す</h3>
            <p className="text-xs text-ink-soft">人事・社内IT企画・総務など</p>
          </Link>

          <Link
            href="/tasks"
            className="p-4 rounded-lg border border-line-subtle hover:bg-surface-muted transition-colors"
          >
            <h3 className="text-sm font-medium text-ink mb-1">タスクから探す</h3>
            <p className="text-xs text-ink-soft">勤怠・申請・手続きなど</p>
          </Link>

          <Link
            href="/ai-guide"
            className="p-4 rounded-lg border border-line-subtle hover:bg-surface-muted transition-colors"
          >
            <h3 className="text-sm font-medium text-ink mb-1">AI案内を使う</h3>
            <p className="text-xs text-ink-soft">自然文で質問できます</p>
          </Link>
        </div>

        {/* Help Desk Link */}
        <div className="pt-6 border-t border-line-subtle">
          <p className="text-sm text-ink-soft mb-2">
            それでも目的の情報が見つからない場合は
          </p>
          <Link
            href="/articles/helpdesk-contact"
            className="inline-flex items-center gap-2 text-accent-teal hover:underline font-medium"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            社内IT企画部門へお問い合わせください
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Component, type ReactNode } from "react";
import Link from "next/link";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary Component
 *
 * Reactコンポーネントツリー内で発生した予期しないエラーをキャッチし、
 * ユーザーフレンドリーなエラー画面を表示します。
 *
 * USAGE:
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 *
 * PRODUCTION NOTE:
 * - 本番環境では、エラーをSentryなどのエラー追跡サービスに送信することを推奨します
 * - componentDidCatchでエラーログを記録し、運用チームに通知します
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    // Log error to console in development
    console.error("[Error Boundary] Caught error:", error, errorInfo);

    // PRODUCTION: Send error to monitoring service
    // if (process.env.NODE_ENV === "production") {
    //   Sentry.captureException(error, { extra: errorInfo });
    // }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface-muted px-4">
          <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-panel">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-accent-crimson/10 rounded-full">
              <svg
                className="w-8 h-8 text-accent-crimson"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-ink text-center mb-4">
              エラーが発生しました
            </h2>

            <p className="text-ink-soft text-center mb-6">
              申し訳ございません。予期しないエラーが発生しました。
              <br />
              ページを再読み込みしてお試しください。
            </p>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mb-6 p-4 bg-surface-muted rounded text-sm">
                <summary className="cursor-pointer font-medium text-ink-soft mb-2">
                  エラー詳細（開発モードのみ）
                </summary>
                <pre className="text-xs overflow-auto">
                  {this.state.error.message}
                  {"\n\n"}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-3 bg-accent-teal text-white font-medium rounded-lg hover:bg-accent-teal/90 transition-colors"
              >
                ページを再読み込み
              </button>

              <Link
                href="/"
                className="w-full px-4 py-3 bg-white border border-accent-teal text-accent-teal font-medium rounded-lg hover:bg-accent-teal/5 transition-colors text-center"
              >
                ホームへ戻る
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t border-line-subtle text-center">
              <p className="text-sm text-ink-soft mb-2">
                問題が解決しない場合は
              </p>
              <Link
                href="/articles/helpdesk-contact"
                className="text-sm text-accent-teal hover:underline"
              >
                ITサポートデスクへお問い合わせください
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

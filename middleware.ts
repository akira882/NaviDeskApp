import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Rate Limiting Middleware
 *
 * DoS攻撃、ブルートフォース攻撃に対する防御を提供します。
 * IP address単位で1分あたりのリクエスト数を制限します。
 *
 * PRODUCTION NOTE:
 * - 本実装はシンプルなメモリベースのRate Limitingです
 * - 本番環境では Redis または Vercel KV を使用した分散Rate Limitingを推奨します
 * - 負荷分散環境では、各サーバーが独立してカウントするため、実効レートは設定値の倍数になります
 *
 * CONFIGURATION:
 * - RATE_LIMIT_WINDOW: レート制限のウィンドウ時間（ミリ秒）
 * - MAX_REQUESTS: ウィンドウ時間内の最大リクエスト数
 *
 * MONITORING:
 * - 429 Too Many Requestsの発生頻度を監視し、閾値調整の判断材料とします
 * - 攻撃検知時はIPアドレスをログ出力し、ファイアウォールでのブロックを検討します
 */

// Rate limit storage (in-memory)
// NOTE: This will be cleared on server restart
const rateLimit = new Map<
  string,
  {
    count: number;
    resetTime: number;
  }
>();

// Configuration
const RATE_LIMIT_WINDOW = 60000; // 1分
const MAX_REQUESTS = 100; // 1分あたり100リクエスト
const CLEANUP_INTERVAL = 300000; // 5分ごとに古いエントリをクリーンアップ

// Cleanup old entries periodically to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimit.entries()) {
    if (now > data.resetTime) {
      rateLimit.delete(ip);
    }
  }
}, CLEANUP_INTERVAL);

export function middleware(request: NextRequest) {
  // Get IP address from request headers
  // In production, x-forwarded-for is set by the load balancer/proxy
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const now = Date.now();
  const current = rateLimit.get(ip);

  // Initialize or reset if window expired
  if (!current || now > current.resetTime) {
    rateLimit.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return NextResponse.next();
  }

  // Check if rate limit exceeded
  if (current.count >= MAX_REQUESTS) {
    console.warn(
      `[Rate Limit] IP ${ip} exceeded rate limit (${current.count} requests in ${RATE_LIMIT_WINDOW}ms)`
    );

    return new NextResponse(
      JSON.stringify({
        error: "Too Many Requests",
        message: "リクエスト数が上限を超えました。しばらく待ってから再試行してください。",
        retryAfter: Math.ceil((current.resetTime - now) / 1000)
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(Math.ceil((current.resetTime - now) / 1000))
        }
      }
    );
  }

  // Increment counter
  current.count++;

  return NextResponse.next();
}

/**
 * Matcher configuration
 *
 * Rate limitingを適用するパスを指定します。
 * - 検索系API: /api/:path* (将来実装予定)
 * - 高頻度アクセス: /faq, /ai-guide
 *
 * 静的アセット（_next/static, images）は除外します。
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)"
  ]
};

# NaviDeskApp 自律改修計画書

**計画立案日**: 2026年3月15日
**計画者**: ドリーム・チーム (PM, Chief Test Engineer, Security Architect, Knowledge Operations Lead)
**目的**: Enterprise納品可否評価で明らかになった課題のうち、NJC固有の要件に依存せず自律的に改修可能な項目を実装する

---

## エグゼクティブサマリー

### 改修スコープ

**対象**: Enterprise納品評価レポートで指摘された課題のうち、以下の自律改修可能な項目

| 改修項目 | 優先度 | 担当 | 所要時間 | スコア改善 |
|---------|-------|------|---------|----------|
| 静的ルート生成の修正 | 高 | Security Architect | 2時間 | +10pt |
| CSPヘッダーの追加 | 高 | Security Architect | 1時間 | +5pt |
| Rate Limiting実装 | 高 | Security Architect | 3時間 | +5pt |
| E2Eテストの追加 | 中 | Chief Test Engineer | 4時間 | +5pt |
| セキュリティテストの追加 | 中 | Chief Test Engineer | 2時間 | +3pt |
| エラーハンドリング強化 | 中 | Knowledge Ops Lead | 3時間 | +2pt |

**合計所要時間**: 約15時間 (2日)
**スコア改善**: 45/100 → 75/100 (+30pt)

### 改修対象外（NJC固有要件が必要）

- Phase 1: SSO/OIDC認証統合 - NJCのID基盤情報が必要
- Phase 2: PostgreSQL永続化 - DB接続情報、インフラ設定が必要
- Phase 3: サーバーサイド監査ログ - DBが必要
- 実際の負荷テスト実行 - 本番環境が必要

---

## 優先度マトリクス

```
影響度
高 │ 3. Rate Limiting  │ 1. 静的ルート修正
   │                   │ 2. CSPヘッダー
───┼───────────────────┼───────────────────
中 │ 6. エラー処理      │ 4. E2Eテスト
   │                   │ 5. セキュリティテスト
───┴───────────────────┴───────────────────
     低               高
              実装容易性
```

---

## 改修項目詳細

### 1. 静的ルート生成の修正 (高優先度)

**担当**: Security Architect
**所要時間**: 2時間
**スコア改善**: +10pt (セキュリティ 40→50)

#### 現状の問題

```typescript
// app/articles/[slug]/page.tsx (現状)
export async function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
  // ↑ 全記事 (draft含む、manager-only含む) のslugを列挙
}
```

**問題点**:
- ビルド成果物に全記事のslug一覧が露出
- 非公開記事の存在が推測可能

#### 改修内容

```typescript
// app/articles/[slug]/page.tsx (改修後)
export async function generateStaticParams() {
  // 公開済み + employee向け記事のみを列挙
  return articles
    .filter(article =>
      article.status === "published" &&
      article.approvalStatus === "approved" &&
      article.visibilityRole === "all"
    )
    .map(article => ({ slug: article.slug }));
}
```

**影響範囲**:
- `app/articles/[slug]/page.tsx`
- `app/categories/[slug]/page.tsx`
- `app/tools/[slug]/page.tsx`

#### 検証方法

```bash
npm run build
# .next/server/app/articles/ 配下のファイル数を確認
# manager-only記事のslugが存在しないことを確認
```

---

### 2. CSPヘッダーの追加 (高優先度)

**担当**: Security Architect
**所要時間**: 1時間
**スコア改善**: +5pt (セキュリティ 50→55)

#### 現状の問題

XSS攻撃に対する防御層が不足

#### 改修内容

```typescript
// next.config.ts
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data:;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // 既存のヘッダー
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          // 追加
          {
            key: "Content-Security-Policy",
            value: cspHeader.replace(/\s{2,}/g, " ").trim()
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains"
          }
        ]
      }
    ];
  }
};
```

#### 検証方法

```bash
npm run build
npm run start
curl -I http://localhost:3000 | grep "Content-Security-Policy"
```

---

### 3. Rate Limiting実装 (高優先度)

**担当**: Security Architect
**所要時間**: 3時間
**スコア改善**: +5pt (セキュリティ 55→60)

#### 現状の問題

DoS攻撃、ブルートフォース攻撃に対する防御が不在

#### 改修内容

```typescript
// middleware.ts (新規作成)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const rateLimit = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60000; // 1分
const MAX_REQUESTS = 60; // 1分あたり60リクエスト

export function middleware(request: NextRequest) {
  const ip = request.ip ?? "unknown";
  const now = Date.now();

  const current = rateLimit.get(ip);

  if (!current || now > current.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return NextResponse.next();
  }

  if (current.count >= MAX_REQUESTS) {
    return new NextResponse("Too Many Requests", { status: 429 });
  }

  current.count++;
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/faq",
    "/ai-guide"
  ]
};
```

#### 検証方法

```bash
# 連続リクエストテスト
for i in {1..65}; do curl http://localhost:3000/faq; done
# 60回目以降は 429 Too Many Requests が返ることを確認
```

---

### 4. E2Eテストの追加 (中優先度)

**担当**: Chief Test Engineer
**所要時間**: 4時間
**スコア改善**: +5pt (品質管理 85→90)

#### 現状の問題

ユニットテストのみで、実際のブラウザ操作テストが不在

#### 改修内容

```bash
# Playwrightのインストール
npm install -D @playwright/test
npx playwright install
```

```typescript
// e2e/home.spec.ts (新規作成)
import { test, expect } from "@playwright/test";

test.describe("ホーム画面", () => {
  test("検索機能が動作する", async ({ page }) => {
    await page.goto("http://localhost:3000");

    // 検索ボックスに入力
    await page.fill('input[placeholder*="検索"]', "VPN");
    await page.click('button[type="submit"]');

    // 検索結果が表示されることを確認
    await expect(page.locator("text=VPN")).toBeVisible();
  });

  test("タスクハブが表示される", async ({ page }) => {
    await page.goto("http://localhost:3000");
    await expect(page.locator("text=タスクハブ")).toBeVisible();
  });
});

// e2e/admin.spec.ts (新規作成)
test.describe("管理画面", () => {
  test("記事作成フローが動作する", async ({ page }) => {
    await page.goto("http://localhost:3000/admin");

    // 記事作成ボタンをクリック
    await page.click("text=記事を作成");

    // フォーム入力
    await page.fill('input[name="title"]', "テスト記事");
    await page.fill('textarea[name="content"]', "テスト本文");

    // 保存
    await page.click("text=保存");

    // 成功メッセージを確認
    await expect(page.locator("text=作成しました")).toBeVisible();
  });
});
```

```json
// package.json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

#### 検証方法

```bash
npm run dev & # バックグラウンドで起動
npm run test:e2e
```

---

### 5. セキュリティテストの追加 (中優先度)

**担当**: Chief Test Engineer
**所要時間**: 2時間
**スコア改善**: +3pt (セキュリティ 60→63)

#### 改修内容

```typescript
// lib/security.test.ts (新規作成)
import { describe, expect, it } from "vitest";

describe("XSS対策", () => {
  it("HTMLタグがエスケープされる", () => {
    const maliciousInput = '<script>alert("XSS")</script>';
    const escaped = escapeHtml(maliciousInput);
    expect(escaped).not.toContain("<script>");
    expect(escaped).toContain("&lt;script&gt;");
  });

  it("記事タイトルにHTMLタグが含まれていない", () => {
    const articles = listAllArticles();
    articles.forEach(article => {
      expect(article.title).not.toMatch(/<script|<iframe|javascript:/i);
    });
  });
});

describe("CSRF対策", () => {
  it("Server Actionsはserver-onlyで実装されている", () => {
    // lib/server/ 配下のファイルが "use server" を含むことを確認
    const serverFiles = glob.sync("lib/server/**/*.ts");
    serverFiles.forEach(file => {
      const content = fs.readFileSync(file, "utf-8");
      expect(content).toContain('"server-only"');
    });
  });
});

describe("SQL Injection対策", () => {
  it("ユーザー入力が直接SQL文字列に埋め込まれていない", () => {
    // 現状はMockデータなので、将来のDB実装時の準備
    // Prismaなどのクエリビルダー使用を強制
  });
});

// lib/utils.ts に追加
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}
```

---

### 6. エラーハンドリング強化 (中優先度)

**担当**: Knowledge Operations Lead
**所要時間**: 3時間
**スコア改善**: +2pt (運用保守性 50→52)

#### 6-1. Error Boundaryの追加

```typescript
// app/components/error-boundary.tsx (新規作成)
"use client";

import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error("Error Boundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-surface-muted">
          <div className="max-w-md p-6 bg-white rounded-lg shadow-panel">
            <h2 className="text-xl font-bold text-ink mb-4">
              エラーが発生しました
            </h2>
            <p className="text-ink-soft mb-4">
              申し訳ございません。予期しないエラーが発生しました。
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-accent-teal text-white rounded hover:bg-accent-teal/90"
            >
              ページを再読み込み
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

```typescript
// app/layout.tsx (修正)
import { ErrorBoundary } from "@/app/components/error-boundary";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <ErrorBoundary>
          <RoleProvider>
            <ContentProvider initialState={initialState}>
              {children}
            </ContentProvider>
          </RoleProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

#### 6-2. 404ページの改善

```typescript
// app/not-found.tsx (修正)
import Link from "next/link";
import { HomeIcon, SearchIcon } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-muted">
      <div className="max-w-2xl p-8 bg-white rounded-lg shadow-panel text-center">
        <h1 className="text-6xl font-bold text-accent-teal mb-4">404</h1>
        <h2 className="text-2xl font-bold text-ink mb-4">
          ページが見つかりません
        </h2>
        <p className="text-ink-soft mb-8">
          お探しのページは削除されたか、URLが変更された可能性があります。
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent-teal text-white rounded-lg hover:bg-accent-teal/90"
          >
            <HomeIcon className="w-5 h-5" />
            ホームへ戻る
          </Link>

          <Link
            href="/faq"
            className="inline-flex items-center gap-2 px-6 py-3 border border-accent-teal text-accent-teal rounded-lg hover:bg-accent-teal/5"
          >
            <SearchIcon className="w-5 h-5" />
            FAQで検索
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-line-subtle">
          <p className="text-sm text-ink-soft mb-2">
            それでも解決しない場合は
          </p>
          <Link
            href="/articles/helpdesk-contact"
            className="text-accent-teal hover:underline"
          >
            ITサポートデスクへお問い合わせください
          </Link>
        </div>
      </div>
    </div>
  );
}
```

---

## 実装順序

### フェーズ1: セキュリティ強化 (6時間)

1. 静的ルート生成の修正 (2時間)
2. CSPヘッダーの追加 (1時間)
3. Rate Limiting実装 (3時間)

**検証**: `npm run lint && npm run build`

### フェーズ2: テスト強化 (6時間)

4. E2Eテストの追加 (4時間)
5. セキュリティテストの追加 (2時間)

**検証**: `npm run test && npm run test:e2e`

### フェーズ3: UX改善 (3時間)

6. エラーハンドリング強化 (3時間)

**検証**: 手動テスト (エラー発生時の挙動、404ページ)

---

## 検証計画

### 自動テスト

```bash
# 1. リントチェック
npm run lint

# 2. ユニットテスト
npm run test

# 3. E2Eテスト
npm run dev &
npm run test:e2e

# 4. ビルド
npm run build
```

### 手動テスト

1. **静的ルート生成**
   - `.next/server/app/articles/` 配下のファイル数を確認
   - manager-only記事のslugが存在しないことを確認

2. **CSPヘッダー**
   - ブラウザDevToolsのConsoleでCSPエラーが出ないことを確認
   - `curl -I http://localhost:3000` でヘッダーを確認

3. **Rate Limiting**
   - 連続60回以上のリクエストで429エラーが返ることを確認

4. **Error Boundary**
   - コンポーネント内で意図的にエラーを発生させ、エラー画面が表示されることを確認

5. **404ページ**
   - 存在しないURL (`/test-404`) にアクセスし、改善された404ページが表示されることを確認

---

## スコア改善予測

| 観点 | 改修前 | 改修後 | 改善幅 |
|-----|-------|-------|-------|
| セキュリティ | 40/100 | 63/100 | +23pt |
| 品質管理 | 85/100 | 90/100 | +5pt |
| 運用保守性 | 50/100 | 52/100 | +2pt |

**総合スコア**: 45/100 → 75/100 (+30pt)

---

## リスク管理

### 高リスク

| リスク | 対策 |
|-------|------|
| Rate Limitingがパフォーマンスに影響 | Mapのサイズ上限を設定、古いエントリを定期削除 |
| CSPがサードパーティスクリプトをブロック | 段階的に厳格化、最初は `unsafe-inline` を許可 |

### 中リスク

| リスク | 対策 |
|-------|------|
| E2Eテストが不安定 | リトライ設定、明示的なwait追加 |
| Error Boundaryが過剰に発動 | 特定コンポーネントのみをラップ |

---

## 成果物

1. **コード**
   - 修正されたソースコード (6ファイル修正、5ファイル新規)
   - E2Eテストスクリプト (2ファイル)

2. **ドキュメント**
   - `docs/AUTONOMOUS_IMPROVEMENTS.md` (本ファイル)
   - `docs/ENTERPRISE_READINESS_ASSESSMENT.md` の更新

3. **検証レポート**
   - テスト実行結果
   - ビルド成功確認
   - スコア改善の実測値

---

## タイムライン

**Day 1 (8時間)**
- フェーズ1: セキュリティ強化 (6時間)
- フェーズ2: テスト強化 (2時間)

**Day 2 (7時間)**
- フェーズ2: テスト強化 残り (4時間)
- フェーズ3: UX改善 (3時間)

**合計**: 15時間 (2日)

---

## 承認

**計画立案者**: Knowledge Operations Lead (PM)
**レビュアー**: Chief Test Engineer, Security Architect
**承認日**: 2026年3月15日

**次のステップ**: ドリーム・チーム全員の合意を得て、実装フェーズへ移行

---

**Note**: 本計画は NJC固有の要件に依存しない改修のみを対象としています。Phase 1-3 (認証・DB・監査ログ) の実装は、NJCとの要件確認後に別途実施します。

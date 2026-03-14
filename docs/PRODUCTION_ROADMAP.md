# 本番運用への移行ロードマップ

このドキュメントは、現在のMVP実装から本番運用可能なシステムへの移行計画を示します。

## 現在の状態

NaviDeskAppは現在、**プロトタイプ/MVP段階**にあります。以下の機能は**意図的に簡略化**されています:

### 1. 認証・認可
**現状**: 環境変数(`NAVIDESK_SESSION_ROLE`)による固定ロール
**問題**: 全ユーザーが同一ロールとして扱われる
**本番要件**: ユーザー単位の認証とロール解決

### 2. データ永続化
**現状**: クライアントサイドメモリ(`useState`)による一時保存
**問題**: リロードで消える、他ユーザーと共有されない
**本番要件**: データベースバックエンドによる永続化

### 3. 監査ログ
**現状**: クライアントサイド生成、改ざん可能
**問題**: 真正な監査証跡として使えない
**本番要件**: サーバーサイド記録、改ざん耐性

### 4. 静的ルート生成
**現状**: 全記事を`generateStaticParams()`で列挙
**問題**: 非公開記事の存在が露出
**本番要件**: 公開済み記事のみを列挙、または動的レンダリング

---

## Phase 1: 認証基盤の統合

### 実装内容

1. **SSO/OIDC統合**
   ```typescript
   // lib/auth/sso-auth-provider.ts
   export class SSOAuthProvider implements AuthProvider {
     async getCurrentUser(): Promise<User> {
       // NextAuth.js / Auth0 / Okta 統合
       const session = await getServerSession();
       return {
         id: session.user.id,
         name: session.user.name,
         email: session.user.email,
         role: resolveRoleFromClaims(session.user)
       };
     }
   }
   ```

2. **ロール解決ロジック**
   - IDトークンのclaimsから`role`を抽出
   - グループメンバーシップに基づくロールマッピング
   - デフォルトロールの設定

3. **セッション管理**
   - サーバーサイドセッション
   - CSRF保護
   - セキュアCookie設定

### 移行手順

1. NextAuth.jsまたはAuth0のインストール
2. `lib/auth/sso-auth-provider.ts`の実装
3. `lib/server/session.ts`の切り替え
   ```typescript
   // Before
   export function getSessionRole(): Role {
     return env.NAVIDESK_SESSION_ROLE;
   }

   // After
   export async function getSessionRole(): Promise<Role> {
     const user = await authProvider.getCurrentUser();
     return user.role;
   }
   ```
4. 全Server Componentを`async`化
5. 認証フローのテスト

### 所要時間: 2-3日

---

## Phase 2: データベース永続化

### 実装内容

1. **データベース選定**
   - 推奨: PostgreSQL (JSONB対応、監査ログ保存に適している)
   - 代替: MySQL, MongoDB

2. **ORM統合**
   ```typescript
   // lib/storage/db-storage.ts
   import { PrismaClient } from '@prisma/client';

   export class DatabaseStorage implements StorageProvider {
     private prisma = new PrismaClient();

     async createArticle(data: CreateArticleInput, actorId: string): Promise<Article> {
       return await this.prisma.article.create({
         data: {
           ...data,
           createdBy: actorId,
           updatedBy: actorId
         }
       });
     }
   }
   ```

3. **マイグレーション戦略**
   - Prisma Migrateまたは直接SQLマイグレーション
   - シードデータの移行
   - ロールバック計画

### スキーマ設計

```sql
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  category_id UUID REFERENCES categories(id),
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  status VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'published')),
  visibility_role VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id)
);

CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_visibility ON articles(visibility_role);
CREATE INDEX idx_articles_category ON articles(category_id);
```

### 移行手順

1. Prismaスキーマ定義
2. 初期マイグレーション実行
3. `lib/storage/db-storage.ts`実装
4. `content-provider.tsx`を廃止し、Server Actionsへ移行
5. 既存データのマイグレーション
6. バックアップ戦略の確立

### 所要時間: 3-5日

---

## Phase 3: サーバーサイド監査ログ

### 実装内容

1. **監査ログテーブル**
   ```sql
   CREATE TABLE audit_logs (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     actor_id UUID REFERENCES users(id) NOT NULL,
     action VARCHAR(50) NOT NULL,
     target_type VARCHAR(50) NOT NULL,
     target_id UUID NOT NULL,
     timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     detail JSONB,
     ip_address INET,
     user_agent TEXT,
     request_id UUID
   );

   CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
   CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);
   CREATE INDEX idx_audit_logs_target ON audit_logs(target_type, target_id);
   ```

2. **監査ロガーの実装**
   ```typescript
   // lib/audit/server-audit-logger.ts
   export class ServerAuditLogger implements AuditLogger {
     async log(params: AuditLogParams): Promise<void> {
       await db.auditLog.create({
         data: {
           actorId: params.actorId,
           action: params.action,
           targetType: params.targetType,
           targetId: params.targetId,
           detail: params.detail,
           ipAddress: req.ip,
           userAgent: req.headers['user-agent'],
           requestId: req.id
         }
       });
     }
   }
   ```

3. **CRUD操作との統合**
   - トランザクション内で監査ログを記録
   - 失敗時のロールバック
   - 非同期ログ記録（パフォーマンス最適化）

### 移行手順

1. 監査ログテーブルのマイグレーション
2. `lib/audit/server-audit-logger.ts`実装
3. 全CRUD操作に監査ログ記録を追加
4. 監査ログ閲覧UIの更新（フィルタリング、検索機能）
5. ログ保持期間ポリシーの設定

### 所要時間: 2-3日

---

## Phase 4: セキュリティ強化

### 実装内容

1. **静的ルート生成の修正**
   ```typescript
   // app/articles/[slug]/page.tsx
   export async function generateStaticParams() {
     // 公開済み記事のみを列挙
     const articles = await db.article.findMany({
       where: {
         status: 'published',
         visibilityRole: 'employee' // 最も低い権限
       },
       select: { slug: true }
     });
     return articles.map(article => ({ slug: article.slug }));
   }
   ```

2. **動的レンダリングへの移行検討**
   - 管理職向け記事は動的レンダリング
   - パフォーマンスとセキュリティのトレードオフ

3. **CSP (Content Security Policy)**
   ```typescript
   // next.config.js
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
   ```

4. **環境変数の分離**
   - 本番環境でのDEBUGモード無効化
   - APIキーの安全な管理（AWS Secrets Manager等）

### 移行手順

1. `generateStaticParams()`の修正
2. CSPヘッダーの設定
3. セキュリティヘッダーの追加（HSTS, X-Frame-Options等）
4. 依存パッケージの脆弱性スキャン
5. ペネトレーションテストの実施

### 所要時間: 1-2日

---

## Phase 5: パフォーマンス最適化

### 実装内容

1. **キャッシング戦略**
   ```typescript
   export const revalidate = 3600; // 1時間ごとにキャッシュ更新
   ```

2. **データベースインデックス**
   - 検索クエリの最適化
   - 複合インデックスの追加

3. **CDN統合**
   - 静的アセットのCDN配信
   - エッジキャッシング

4. **画像最適化**
   - Next.js Imageコンポーネントの活用
   - WebP形式への変換

### 所要時間: 2-3日

---

## Phase 6: 運用監視

### 実装内容

1. **ロギング統合**
   - 構造化ログ（JSON形式）
   - ログレベルの設定
   - ログローテーション

2. **メトリクス収集**
   - APM (Application Performance Monitoring)
   - エラー追跡（Sentry等）
   - アクセス解析

3. **アラート設定**
   - エラー率の閾値監視
   - レスポンスタイムの監視
   - ディスク使用量の監視

4. **バックアップ戦略**
   - 日次データベースバックアップ
   - Point-in-timeリカバリ
   - バックアップの定期的なテスト

### 所要時間: 2-3日

---

## 総合タイムライン

| Phase | 内容 | 所要時間 | 累積 |
|---|---|---|---|
| Phase 1 | 認証基盤 | 2-3日 | 2-3日 |
| Phase 2 | DB永続化 | 3-5日 | 5-8日 |
| Phase 3 | 監査ログ | 2-3日 | 7-11日 |
| Phase 4 | セキュリティ | 1-2日 | 8-13日 |
| Phase 5 | パフォーマンス | 2-3日 | 10-16日 |
| Phase 6 | 運用監視 | 2-3日 | 12-19日 |

**合計: 約2.5-4週間**

---

## 現在の実装における安全策

現在のMVP実装では、本番化前の橋渡しとして以下の抽象化層を用意しています:

### 1. Auth Provider Interface
```typescript
// lib/auth/auth-provider.ts
export interface AuthProvider {
  getCurrentUser(): Promise<User> | User;
}

// 現在: lib/auth/mock-auth-provider.ts
// 本番: lib/auth/sso-auth-provider.ts
```

### 2. Storage Provider Interface
```typescript
// lib/storage/storage-provider.ts
export interface StorageProvider {
  createArticle(data: CreateArticleInput, actorId: string): Promise<Article>;
  updateArticle(id: string, data: UpdateArticleInput, actorId: string): Promise<Article>;
  // ...
}

// 現在: lib/storage/memory-storage.ts
// 本番: lib/storage/db-storage.ts
```

### 3. Audit Logger Interface
```typescript
// lib/audit/audit-logger.ts
export interface AuditLogger {
  log(params: AuditLogParams): Promise<void>;
}

// 現在: lib/audit/memory-audit-logger.ts
// 本番: lib/audit/server-audit-logger.ts
```

これらのインターフェースにより、**実装を差し替えるだけで本番化が可能**になります。

---

## 結論

このロードマップに従うことで、現在のMVP実装を**段階的に本番運用可能なシステムへ移行**できます。

各Phaseは独立しており、ビジネス要件に応じて優先順位を調整可能です。ただし、**Phase 1（認証）とPhase 2（永続化）は本番運用の前提条件**です。

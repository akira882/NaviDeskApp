# NaviDeskApp アーキテクチャ設計

## 設計意図

NaviDeskAppは、エンタープライズ社内ナレッジ運用ポータルとして設計されています。製品の優先事項は、制御された情報アクセス、運用保守性、監査性、そして将来のエンタープライズシステムとの統合です。

## 現在のランタイムモデル

- アプリケーションシェルとルート構造にはNext.js App Routerを使用
- ドメインの整合性にはTypeScriptを使用
- 一貫したUI構成にはTailwind CSSを使用
- **propsベースのクライアントコンポーネントによるサーバーサイドデータフィルタリング**（Phase 0 改善）
- **厳格なserver/client境界の適用**（Phase 0 改善）
- 基本マスターデータアクセス用のリポジトリレイヤー（サーバー専用）
- プロバイダー切替ポイントを持つAIガイドサービス抽象化

## Server/Client境界（Phase 0 実装）

### サーバーコンポーネントパターン
サーバーコンポーネントが処理する内容:
- `getSessionRole()`によるロール解決
- `buildInitialStateForRole(role)`による初期状態構築
- ヘルパー関数を使用したロール別のデータフィルタリング
- クライアントコンポーネントにはロールで可視化されたデータのみをpropsとして渡す

### クライアントコンポーネントパターン
クライアントコンポーネント:
- props経由でフィルタリング済みデータを受け取る（読み取り専用データにはcontextを使用しない）
- ContentProviderコンテキストは変更操作のみに使用（recordSearch、add/update/delete操作）
- `data/repositories/*`からのインポートは行わない（ビルド時エラーで強制）
- 軽量でUI操作に焦点を当てる

### パターンの例

**サーバーコンポーネント**（`app/categories/[slug]/page.tsx`）:
```typescript
export default async function CategoryDetailPage({ params }) {
  const { slug } = await params;
  const role = getSessionRole();
  const initialState = buildInitialStateForRole(role);

  const visibleArticles = listVisibleArticles(initialState, role)
    .filter(article => article.categoryId === category?.id);
  const quickLinksForCategory = listSortedQuickLinks(initialState)
    .filter(link => link.categoryId === category?.id);

  return (
    <CategoryDetailClient
      category={category}
      visibleArticles={visibleArticles}
      quickLinksForCategory={quickLinksForCategory}
    />
  );
}
```

**クライアントコンポーネント**（`app/components/category-detail-client.tsx`）:
```typescript
export function CategoryDetailClient({
  category,
  visibleArticles,
  quickLinksForCategory
}: {
  category: Category | null;
  visibleArticles: Article[];
  quickLinksForCategory: QuickLink[];
}) {
  // propsを使用 - リポジトリインポートなし、データ読み取りにuseContentを使用しない
  return <div>{/* propsを使用してレンダリング */}</div>;
}
```

## ドメイン境界

## 優先順位付けされた情報アーキテクチャ

エンタープライズナビゲーションの順序は、運用上の影響を考慮して意図的に重み付けされています:

1. 高頻度ワークフローのためのタスクハブ
2. 既知アイテム検索のためのグローバル検索
3. ポリシーブラウジングのためのカテゴリナビゲーション
4. 時間的制約のある変更のためのお知らせ
5. 統制された変更フローのための管理コントロール

これにより、社内ポータルで最も一般的な失敗モード、つまりユーザーが完了すべきタスクは知っているが、それを管轄する部署を知らない、という問題を軽減します。

### 読み取り専用マスターデータ

- カテゴリ
- ユーザー

これらは現在、リポジトリバックエンドのシードデータから提供され、安定した参照データを表します。

### 管理運用コンテンツ

- 記事
- FAQ
- お知らせ
- クイックリンク
- 監査ログ
- 検索ログ

これらは現在のバージョンでは共有コンテンツストアを通じて管理され、管理操作が製品全体に即座に反映されます。

### ガバナンスオーバーレイ

- 記事、FAQ、お知らせの承認状態とレビューコメント
- コンテンツの鮮度に基づくレビュー優先度スコアリング
- 不足コンテンツ発見のための検索失敗集約

## AI統合境界

AIガイドは、`lib/ai/guide-service.ts`の背後に意図的に分離されています。

現在のプロバイダー:
- `mock`

予定されているプロバイダー:
- `gemini`

本番環境へのパスは、AIオーケストレーションを完全にサーバーサイドに移行し、まず根拠となるコンテンツをクエリし、関連する社内証拠が取得された後にのみGeminiを呼び出すことです。ブラウザは生のGemini keyを受け取ってはなりません。

## エンタープライズ移行パス

### Phase 1

- localStorageバックエンドの運用状態をデータベース永続化に置き換える
- すべての書き込みを認証済みサーバーアクションまたはAPIルートを通じてルーティングする
- すべての変更にSSOからのユーザーIDを付与する

### Phase 2

- 高リスクコンテンツ変更の承認フローを導入する
- リビジョン履歴とロールバックを追加する
- 全文インデックスと関連性チューニングを追加する

### Phase 3

- サーバー上でGeminiを統合する
- 引用スコアリングと回答信頼度閾値を追加する
- コンテンツ操作とは別にAIリクエスト監査証跡を記録する

# Amazon Bedrock セットアップ完全ガイド

## 🎯 目的
NaviDeskApp でAmazon Bedrock（Claude 3.5 Haiku）を動作させるための完全な手順書

---

## ⚠️ 前提条件

- AWSアカウント（未作成の場合は作成）
- クレジットカード（AWS Free Tier利用でも必要）
- メールアドレス
- 所要時間：約30-45分
- 想定コスト：$0.01未満（テスト10リクエスト）

---

## 📝 ステップ1：AWSアカウント準備

### 1-1. AWSアカウント作成（既にある場合はスキップ）
1. https://aws.amazon.com/ にアクセス
2. 「AWSアカウントを作成」をクリック
3. メールアドレス、パスワード、アカウント名を入力
4. クレジットカード情報を登録
5. 本人確認（電話番号認証）
6. サポートプラン選択（「ベーシックサポート - 無料」を選択）

### 1-2. ルートユーザーでサインイン
1. https://console.aws.amazon.com/ にアクセス
2. ルートユーザーのメールアドレスとパスワードでサインイン

---

## 🔐 ステップ2：IAMユーザー作成（セキュリティベストプラクティス）

### 2-1. IAM コンソールを開く
1. AWSマネジメントコンソール上部の検索バーに「IAM」と入力
2. 「IAM」サービスをクリック

### 2-2. IAMユーザー作成
1. 左メニューから「ユーザー」をクリック
2. 「ユーザーを追加」ボタンをクリック
3. ユーザー名：`navidesk-bedrock-user`
4. 「次へ」をクリック

### 2-3. 権限設定（最小権限の原則）
1. 「ポリシーを直接アタッチ」を選択
2. 「ポリシーの作成」をクリック
3. JSON タブをクリック
4. 以下のポリシーを貼り付け：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "BedrockInvokeModelOnly",
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": [
        "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-haiku-20241022-v1:0"
      ]
    }
  ]
}
```

5. 「次へ」をクリック
6. ポリシー名：`NaviDeskBedrockInvokePolicy`
7. 説明：`Minimum permission for NaviDesk to invoke Claude 3.5 Haiku`
8. 「ポリシーの作成」をクリック
9. 元のタブに戻り、作成したポリシーを検索して選択
10. 「次へ」→「ユーザーの作成」をクリック

### 2-4. Access Key 生成
1. 作成したユーザー（`navidesk-bedrock-user`）をクリック
2. 「セキュリティ認証情報」タブをクリック
3. 「アクセスキーを作成」をクリック
4. ユースケース：「ローカルコード」を選択
5. 「上記のレコメンデーションを理解し、アクセスキーを作成します。」にチェック
6. 「次へ」をクリック
7. 説明タグ値：`NaviDesk Development`
8. 「アクセスキーを作成」をクリック

**⚠️ 重要：この画面でしかSecret Access Keyを確認できません**
- Access key ID：`AKIA...` ← コピーしてメモ帳に保存
- Secret access key：`...` ← コピーしてメモ帳に保存
- 「.csvファイルをダウンロード」をクリック（バックアップ）

9. 「完了」をクリック

---

## 🤖 ステップ3：Bedrock Model Access 申請

### 3-1. Bedrock コンソールを開く
1. AWSマネジメントコンソール上部の検索バーに「Bedrock」と入力
2. 「Amazon Bedrock」サービスをクリック

### 3-2. リージョン確認
1. 右上のリージョン選択が「米国東部（バージニア北部）us-east-1」になっているか確認
2. 異なる場合は変更

### 3-3. Model Access 申請
1. 左メニューから「Model access」をクリック
2. 右上の「Manage model access」ボタンをクリック
3. モデルリストから「Anthropic」セクションを探す
4. 「Claude 3.5 Haiku」にチェックを入れる
5. 下部の「Request model access」ボタンをクリック

### 3-4. 承認待ち
- 通常、数秒〜数分で承認される
- Access granted と表示されたら完了
- 場合によっては数時間かかることもある（AWS審査）

**⚠️ この承認が完了するまで API は使えません**

---

## 💻 ステップ4：NaviDeskApp への設定

### 4-1. プロジェクトのルートディレクトリに移動
```bash
cd /Users/882akira/Desktop/01\ Portfolio/01\ Navidesk_NJC\ Portfolio_Akira\ Koshimizu
```

### 4-2. .env.local ファイルを作成
```bash
# .env.example をコピーして .env.local を作成
cp .env.example .env.local
```

### 4-3. .env.local を編集
テキストエディタで `.env.local` を開き、以下のように記入：

```bash
# AWS Bedrock Configuration
AWS_REGION="us-east-1"
AWS_BEDROCK_MODEL_ID="us.anthropic.claude-3-5-haiku-20241022-v1:0"
AWS_ACCESS_KEY_ID="AKIA..."  # ← ステップ2-4でコピーした値
AWS_SECRET_ACCESS_KEY="..."   # ← ステップ2-4でコピーした値

# AI Provider設定
NAVIDESK_AI_PROVIDER="bedrock"

# Optional: セッションロール（開発用）
NAVIDESK_SESSION_ROLE="employee"
```

**⚠️ 注意事項：**
- ダブルクォート（`"`）で囲むこと
- コメント（`#`）の後ろの説明文は削除してOK
- Access Key は実際の値に置き換える
- Secret Access Key も実際の値に置き換える

### 4-4. ファイルの保存確認
```bash
# .env.local が作成されたか確認
ls -la .env.local

# .gitignore に含まれているか確認（漏洩防止）
grep ".env.local" .gitignore
# 結果に ".env.local" が表示されればOK
```

---

## ✅ ステップ5：動作確認

### 5-1. 開発サーバーの起動
```bash
# 既に起動している場合は Ctrl+C で停止してから再起動
npm run dev
```

**起動時のログを確認：**
```
▲ Next.js 15.5.12
- Local:        http://localhost:3000
```

エラーが出ていなければOK。

### 5-2. 環境変数が読み込まれているか確認（デバッグ）

`lib/env.ts` の最後に一時的に以下を追加：

```typescript
// デバッグ用（動作確認後は削除）
console.log('=== Environment Variables Debug ===');
console.log('AWS_REGION:', env.AWS_REGION);
console.log('AWS_BEDROCK_MODEL_ID:', env.AWS_BEDROCK_MODEL_ID);
console.log('Has AWS_ACCESS_KEY_ID:', !!env.AWS_ACCESS_KEY_ID);
console.log('Has AWS_SECRET_ACCESS_KEY:', !!env.AWS_SECRET_ACCESS_KEY);
console.log('NAVIDESK_AI_PROVIDER:', env.NAVIDESK_AI_PROVIDER);
console.log('===================================');
```

サーバーを再起動すると、ターミナルに以下のような出力が表示される：

```
=== Environment Variables Debug ===
AWS_REGION: us-east-1
AWS_BEDROCK_MODEL_ID: us.anthropic.claude-3-5-haiku-20241022-v1:0
Has AWS_ACCESS_KEY_ID: true
Has AWS_SECRET_ACCESS_KEY: true
NAVIDESK_AI_PROVIDER: bedrock
===================================
```

`true` が表示されていればOK。
`false` の場合は `.env.local` の記載を再確認。

### 5-3. AI案内機能のテスト

1. ブラウザで http://localhost:3000 を開く
2. 左上の「AI案内」をクリック
3. 質問欄に「VPNの設定方法を教えて」と入力
4. 「案内を受ける」ボタンをクリック

**期待される結果：**
```
「VPN設定ガイド」の手順に従ってください：

1. ソフトウェア配布ポータルから VPN クライアントをインストールします。
2. 接続先は「NaviDesk-Corp」を選択します。
3. 社員番号と SSO パスワードを入力します。
4. 初回のみ多要素認証アプリで確認コードを承認します。

※ 続きの手順は記事本文をご確認ください。

詳細は記事本文で確認してください。
```

**⚠️ エラーが出た場合のデバッグ：**

#### エラー1：`AccessDeniedException`
```
原因：Model Access が承認されていない
対処：ステップ3-3を再確認。数時間待つ必要がある場合も。
```

#### エラー2：`InvalidSignatureException`
```
原因：Access Key または Secret Access Key が間違っている
対処：.env.local の値を再確認。コピペミスがないか確認。
```

#### エラー3：`ResourceNotFoundException`
```
原因：リージョンまたはモデルIDが間違っている
対処：AWS_REGION が "us-east-1" になっているか確認
```

#### エラー4：`AI案内の取得中にエラーが発生しました`
```
原因：様々な可能性
対処：
1. ターミナルのログを確認（詳細なエラーメッセージが出力される）
2. .env.local が正しく保存されているか確認
3. npm run dev を再起動したか確認
```

---

## 📊 コスト確認

### テスト実行のコスト試算

Claude 3.5 Haiku の料金（2026年3月時点）：
- 入力：$0.25 / 1M tokens
- 出力：$1.25 / 1M tokens

1回の質問の想定トークン数：
- 入力：約500 tokens（記事内容 + プロンプト）
- 出力：約200 tokens（回答）

**10回のテスト実行コスト：**
```
入力コスト：(500 tokens × 10) / 1,000,000 × $0.25 = $0.00125
出力コスト：(200 tokens × 10) / 1,000,000 × $1.25 = $0.0025
合計：約$0.004（約0.6円）
```

### 実際のコスト確認方法

1. AWSマネジメントコンソール右上のアカウント名をクリック
2. 「請求ダッシュボード」をクリック
3. 「請求書」をクリック
4. 最新月の「Amazon Bedrock」を確認

**⚠️ 注意：**
- 請求は翌月に反映される
- Free Tier対象外（Bedrockは従量課金のみ）
- 予想外の高額請求を防ぐため、AWS Budgets でアラート設定を推奨

---

## 🛡️ セキュリティチェックリスト

### ✅ 必ず実施すること

- [ ] `.env.local` が `.gitignore` に含まれていることを確認
- [ ] Access Key に最小権限ポリシーを適用
- [ ] 定期的に Access Key をローテーション（推奨：3ヶ月ごと）
- [ ] CloudTrail で API 呼び出しログを確認

### ❌ 絶対にやってはいけないこと

- [ ] `.env` に直接 Access Key を記載
- [ ] `git add .env.local` を実行
- [ ] Access Key をスクリーンショットに含める
- [ ] AdministratorAccess 権限を付与
- [ ] 使わなくなった Access Key を放置

---

## 🔧 トラブルシューティング

### Q1: 環境変数が読み込まれない
**A1:** 以下を確認
1. ファイル名が `.env.local` になっているか（`.env.local.txt` ではない）
2. プロジェクトルート（package.json と同じ階層）に配置されているか
3. `npm run dev` を再起動したか
4. ダブルクォートで囲んでいるか

### Q2: `NAVIDESK_AI_PROVIDER="bedrock"` なのに mock が動作する
**A2:**
1. サーバーを再起動していない
2. `.env.local` の記載位置が間違っている
3. `lib/env.ts` のデフォルト値が使われている

確認方法：
```typescript
console.log('NAVIDESK_AI_PROVIDER:', env.NAVIDESK_AI_PROVIDER);
```

### Q3: `Model access denied` エラー
**A3:**
1. Bedrock Model Access 申請が承認されていない
2. リージョンが異なる（us-east-1 以外）
3. IAMポリシーが不足

確認方法：
1. Bedrock Console → Model access で "Access granted" を確認
2. AWS Console 右上のリージョンが "us-east-1" か確認

### Q4: 請求が想定より高い
**A4:**
1. 無限ループやバグで大量リクエストが発生している可能性
2. AWS Budgets でアラート設定
3. CloudWatch Logs で API 呼び出し頻度を確認

緊急対応：
1. IAM Console → Access keys → "Deactivate" で即座に無効化

---

## 📚 参考資料

### 公式ドキュメント
- [Amazon Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [Anthropic Claude Models](https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-claude.html)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/bedrock-runtime/)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

### NaviDeskApp 関連ドキュメント
- `README.md` - プロジェクト概要
- `docs/SECURITY.md` - セキュリティ設計
- `docs/OPERATIONS.md` - 運用指針
- `CLAUDE.md` - 開発ルール

---

## 🎉 セットアップ完了

以下がすべて完了していれば、Bedrock統合は成功です：

- ✅ IAMユーザー作成
- ✅ 最小権限ポリシー適用
- ✅ Access Key 生成
- ✅ Bedrock Model Access 承認
- ✅ `.env.local` 作成・設定
- ✅ 開発サーバー起動
- ✅ AI案内機能で質問実行
- ✅ 正常な回答を確認
- ✅ コスト確認

おめでとうございます！
Amazon Bedrock を使った AI 案内機能が動作しています。

---

## 🚀 次のステップ

1. **ドキュメント化**
   - スクリーンショット保存
   - 実行ログ記録
   - `docs/BEDROCK_VERIFICATION_REPORT.md` 作成

2. **最適化**
   - プロンプトチューニング
   - レスポンス時間測定
   - コスト最適化

3. **本番環境準備**
   - IAMロール移行
   - Secrets Manager 導入
   - モニタリング設定

---

**作成日：** 2026-03-26
**最終更新：** 2026-03-26
**バージョン：** 1.0.0
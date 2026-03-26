# Amazon Bedrock クイックスタート（5分版）

## 🎯 前提条件
- AWSアカウント作成済み
- Bedrock Model Access 承認済み
- IAM Access Key 取得済み

上記が未完了の場合は `docs/BEDROCK_SETUP_GUIDE.md` を参照してください。

---

## ⚡ 5分でBedrockを動かす

### ステップ1：.env.local ファイルを作成（1分）

プロジェクトルートで以下のコマンドを実行：

```bash
cd /Users/882akira/Desktop/01\ Portfolio/01\ Navidesk_NJC\ Portfolio_Akira\ Koshimizu

# .env.example をコピー
cp .env.example .env.local
```

### ステップ2：.env.local を編集（2分）

テキストエディタまたはVS Codeで `.env.local` を開く：

```bash
# VS Code で開く
code .env.local

# または nano で開く
nano .env.local
```

以下の内容に書き換える：

```bash
# AWS Bedrock Configuration
AWS_REGION="us-east-1"
AWS_BEDROCK_MODEL_ID="us.anthropic.claude-3-5-haiku-20241022-v1:0"
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="..."

# AI Provider
NAVIDESK_AI_PROVIDER="bedrock"

# Session Role (Optional)
NAVIDESK_SESSION_ROLE="employee"
```

**⚠️ 重要：**
- `AWS_ACCESS_KEY_ID` の `AKIA...` を実際の値に置き換え
- `AWS_SECRET_ACCESS_KEY` の `...` を実際の値に置き換え
- ダブルクォート（`"`）は削除しないこと

保存して閉じる：
- VS Code: `Cmd+S` → タブを閉じる
- nano: `Ctrl+X` → `Y` → `Enter`

### ステップ3：開発サーバーを再起動（1分）

```bash
# 既に起動している場合は Ctrl+C で停止

# 再起動
npm run dev
```

起動ログを確認：
```
▲ Next.js 15.5.12
- Local:        http://localhost:3000
```

エラーがなければ成功。

### ステップ4：動作確認（1分）

1. ブラウザで http://localhost:3000 を開く
2. 「AI案内」をクリック
3. 質問欄に「VPNの設定方法」と入力
4. 「案内を受ける」ボタンをクリック

**成功時の表示例：**
```
「VPN設定ガイド」の手順に従ってください：

1. ソフトウェア配布ポータルから VPN クライアントをインストールします。
2. 接続先は「NaviDesk-Corp」を選択します。
...
```

---

## ❌ よくあるエラー

### エラー1：`AI案内の取得中にエラーが発生しました`

**原因：** 環境変数が読み込まれていない

**対処：**
1. `.env.local` がプロジェクトルート（package.jsonと同じ階層）にあるか確認
2. `npm run dev` を**再起動**したか確認
3. ファイル名が `.env.local.txt` になっていないか確認

### エラー2：`AccessDeniedException`

**原因：** Model Access が承認されていない、またはIAMポリシー不足

**対処：**
1. AWS Console → Bedrock → Model access で "Access granted" を確認
2. リージョンが "us-east-1" になっているか確認
3. IAMユーザーに正しいポリシーがアタッチされているか確認

### エラー3：`InvalidSignatureException`

**原因：** Access Key または Secret Access Key が間違っている

**対処：**
1. `.env.local` の値を再確認
2. コピペ時に余分なスペースや改行が入っていないか確認
3. ダブルクォートで囲まれているか確認

---

## 🔍 デバッグ方法

### 環境変数が読み込まれているか確認

`lib/env.ts` の最後に追加（一時的）：

```typescript
console.log('=== Bedrock Config Check ===');
console.log('Region:', env.AWS_REGION);
console.log('Model:', env.AWS_BEDROCK_MODEL_ID);
console.log('Has Access Key:', !!env.AWS_ACCESS_KEY_ID);
console.log('Has Secret Key:', !!env.AWS_SECRET_ACCESS_KEY);
console.log('Provider:', env.NAVIDESK_AI_PROVIDER);
console.log('============================');
```

サーバー再起動時にターミナルに以下が表示されればOK：

```
=== Bedrock Config Check ===
Region: us-east-1
Model: us.anthropic.claude-3-5-haiku-20241022-v1:0
Has Access Key: true
Has Secret Key: true
Provider: bedrock
============================
```

`false` が表示される場合は `.env.local` を再確認。

---

## 📊 コスト確認

テスト10回の想定コスト：**約$0.004（0.6円）**

実際のコスト確認：
1. AWS Console → Billing Dashboard
2. 「請求書」→ 最新月
3. 「Amazon Bedrock」の項目を確認

---

## ✅ セットアップ完了チェックリスト

- [ ] `.env.local` ファイル作成
- [ ] Access Key とSecret Access Key を記載
- [ ] `NAVIDESK_AI_PROVIDER="bedrock"` を設定
- [ ] `npm run dev` を再起動
- [ ] AI案内で質問実行
- [ ] 正常な回答を確認
- [ ] ターミナルにエラーなし

すべて完了していれば、Bedrock統合成功です！

---

## 🚀 次のステップ

### 実行結果をドキュメント化（ポートフォリオ用）

1. **スクリーンショット保存**
   - AI案内の質問画面
   - 回答表示画面
   - AWS請求ダッシュボード

2. **実行ログ記録**
   - ターミナルのログをコピー
   - レスポンス時間を記録
   - トークン数を記録

3. **検証レポート作成**
   - `docs/BEDROCK_VERIFICATION_REPORT.md` を作成
   - 実行結果をまとめる
   - ROI試算を追加

詳細は `docs/BEDROCK_SETUP_GUIDE.md` を参照。

---

**所要時間：** 5分
**コスト：** $0.004（テスト10回）
**難易度：** ⭐⭐☆☆☆（初級）
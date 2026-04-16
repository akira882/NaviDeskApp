# 🚨 ユーザーアクション必須項目

## 📋 概要

`.env.local` ファイルは作成され、AI案内機能は **Mock プロバイダーで完全に動作しています**。

Amazon Bedrock を実際に動かすには、**あなた自身が AWS Access Key を取得する必要があります**。

---

## ✅ 現在の状態

### 完了していること
- ✅ `.env.local` ファイル作成
- ✅ 開発サーバー起動確認
- ✅ AI案内APIの動作確認
- ✅ Mock プロバイダーで動作

### 未完了（あなたのアクションが必要）
- ❌ AWS Access Key の取得
- ❌ Bedrock Model Access の申請
- ❌ `.env.local` への Access Key 記入
- ❌ Bedrock プロバイダーでの実行

---

## 🎯 2つの選択肢

### 選択肢A: Mock プロバイダーのまま提出（即座に可能）

**メリット:**
- ✅ すぐに提出できる
- ✅ コストゼロ
- ✅ AWS アカウント不要
- ✅ 設計力・実装力の証明は可能

**デメリット:**
- ❌ Bedrock 実稼働実績なし
- ❌ 実運用経験の証明不足

**推奨度:** ⭐⭐⭐☆☆（普通）

**この選択肢で提出する場合:**
1. 現状のまま何もしない
2. `docs/EXECUTION_REPORT.md` を面接官に見せる
3. 「Mock プロバイダーで動作している」と説明
4. 「Bedrock 統合コードは完成している」と強調

---

### 選択肢B: Bedrock を実際に動かして提出（1-2時間）

**メリット:**
- ✅ Bedrock 実稼働実績あり
- ✅ 実運用経験の証明
- ✅ コスト感覚の証明
- ✅ 採用競争力が大幅向上

**デメリット:**
- ❌ AWS アカウント作成が必要
- ❌ クレジットカード登録が必要
- ❌ 1-2時間の作業が必要
- ❌ 約$0.01のコストがかかる

**推奨度:** ⭐⭐⭐⭐⭐（強く推奨）

**この選択肢で進める場合:**
1. 以下の「今すぐ実行する手順」を実施
2. 実行ログとスクリーンショットを保存
3. `docs/BEDROCK_VERIFICATION_REPORT.md` を作成
4. 面接で「実際に動かしました」と説明

---

## 🚀 今すぐ実行する手順（選択肢Bの場合）

### ステップ1: AWS アカウント準備（15分）

1. https://aws.amazon.com/ にアクセス
2. 「AWSアカウントを作成」をクリック
3. メールアドレス、パスワード、アカウント名を入力
4. クレジットカード情報を登録
5. 本人確認（電話番号認証）

**既にAWSアカウントがある場合はスキップ**

### ステップ2: IAM ユーザー作成（10分）

1. AWS Console にログイン
2. 検索バーに「IAM」と入力 → IAM サービスを開く
3. 左メニュー「ユーザー」→「ユーザーを追加」
4. ユーザー名: `navidesk-bedrock-user`
5. 「ポリシーを直接アタッチ」→「ポリシーの作成」
6. JSON タブで以下を貼り付け:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["bedrock:InvokeModel"],
      "Resource": "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-haiku-20241022-v1:0"
    }
  ]
}
```

7. ポリシー名: `NaviDeskBedrockInvokePolicy`
8. 「ポリシーの作成」→ 元のタブに戻る
9. 作成したポリシーを検索・選択
10. 「ユーザーの作成」をクリック

### ステップ3: Access Key 生成（5分）

1. 作成したユーザー（`navidesk-bedrock-user`）をクリック
2. 「セキュリティ認証情報」タブをクリック
3. 「アクセスキーを作成」をクリック
4. ユースケース: 「ローカルコード」を選択
5. チェックボックスにチェック → 「次へ」
6. 説明タグ: `NaviDesk Development` → 「アクセスキーを作成」

**⚠️ 重要: この画面でしかSecret Access Keyを確認できません**

7. **Access key ID** をコピー → メモ帳に貼り付け
8. **Secret access key** をコピー → メモ帳に貼り付け
9. 「.csvファイルをダウンロード」をクリック（バックアップ）
10. 「完了」をクリック

### ステップ4: Bedrock Model Access 申請（5分）

1. AWS Console 右上のリージョンを「米国東部（バージニア北部）us-east-1」に変更
2. 検索バーに「Bedrock」と入力 → Amazon Bedrock を開く
3. 左メニュー「Model access」をクリック
4. 右上「Manage model access」をクリック
5. モデルリストから「Anthropic」セクションの「Claude 3.5 Haiku」にチェック
6. 下部「Request model access」をクリック

**承認待ち（通常数秒〜数分、場合によっては数時間）**
- "Access granted" と表示されたら完了

### ステップ5: `.env.local` を更新（2分）

以下のファイルを開く:
```
<プロジェクトルート>/.env.local
```

以下のように更新:

```bash
# AWS Bedrock Configuration
AWS_REGION="us-east-1"
AWS_BEDROCK_MODEL_ID="us.anthropic.claude-3-5-haiku-20241022-v1:0"
AWS_ACCESS_KEY_ID="AKIA..."  # ← ステップ3でコピーした値
AWS_SECRET_ACCESS_KEY="..."   # ← ステップ3でコピーした値

# AI Provider
NAVIDESK_AI_PROVIDER="bedrock"  # ← "mock" から "bedrock" に変更

# Session Role
NAVIDESK_SESSION_ROLE="employee"
```

**保存してください**

### ステップ6: 動作確認（5分）

ターミナルを開き、以下を実行:

```bash
cd <プロジェクトルート>

# 開発サーバー起動
npm run dev
```

ブラウザで以下を開く:
```
http://localhost:3000
```

1. 「AI案内」をクリック
2. 質問欄に「VPNの設定方法を教えて」と入力
3. 「案内を受ける」ボタンをクリック

**期待される結果:**
```
「VPN設定ガイド」の手順に従ってください：

1. ソフトウェア配布ポータルから VPN クライアントをインストールします。
2. 接続先は「NaviDesk-Corp」を選択します。
3. 社員番号と SSO パスワードを入力します。
...
```

Amazon Bedrock からの回答が表示されれば成功！

### ステップ7: 証拠を保存（5分）

1. **スクリーンショット撮影:**
   - AI案内の質問入力画面
   - 回答表示画面
   - ターミナルのログ

2. **コスト確認:**
   - AWS Console → Billing Dashboard
   - 請求額を確認（約$0.01未満のはず）
   - スクリーンショット撮影

3. **ドキュメント作成:**
   - `docs/BEDROCK_VERIFICATION_REPORT.md` を作成
   - 実行結果、スクリーンショット、コストを記載

---

## 📊 コスト試算

### テスト10回の想定コスト
- **入力:** 500 tokens × 10 = 5,000 tokens
- **出力:** 200 tokens × 10 = 2,000 tokens
- **料金:**
  - 入力: $0.25 / 1M tokens
  - 出力: $1.25 / 1M tokens
- **合計:** 約 **$0.004（約0.6円）**

### 安全のための上限設定（推奨）

AWS Budgets でアラート設定:
1. AWS Console → Billing → Budgets
2. 「予算を作成」
3. 月額予算: $1.00
4. アラート: 80%（$0.80）で通知

---

## 🔒 セキュリティ注意事項

### ✅ 必ず実施すること
- [ ] `.env.local` が `.gitignore` に含まれていることを確認
- [ ] Access Key を他人と共有しない
- [ ] スクリーンショットに Access Key が映らないようにする
- [ ] 面接終了後、Access Key を削除

### ❌ 絶対にやってはいけないこと
- [ ] `.env` に Access Key を記載
- [ ] `git add .env.local` を実行
- [ ] Access Key をメールやチャットで送信
- [ ] AdministratorAccess 権限を付与

---

## 📞 サポート

### 詳細手順が必要な場合
- `docs/BEDROCK_SETUP_GUIDE.md` - 完全な手順書（45分版）
- `docs/BEDROCK_QUICK_START.md` - クイックスタート（5分版）

### トラブルシューティング
- `docs/BEDROCK_SETUP_GUIDE.md` のトラブルシューティングセクション参照

### よくあるエラー

**Q1: `AccessDeniedException` が出る**
- A1: Model Access が承認されていない。ステップ4を確認。

**Q2: 環境変数が読み込まれない**
- A2: `npm run dev` を再起動していない。Ctrl+C で停止 → 再起動。

**Q3: `InvalidSignatureException` が出る**
- A3: Access Key が間違っている。`.env.local` の値を再確認。

---

## ✅ 最終チェックリスト

Bedrock を動かすために必要なすべて:

- [ ] AWS アカウント作成
- [ ] IAM ユーザー作成
- [ ] 最小権限ポリシー適用
- [ ] Access Key 生成・メモ
- [ ] Bedrock Model Access 承認
- [ ] `.env.local` 更新
- [ ] `NAVIDESK_AI_PROVIDER="bedrock"` に変更
- [ ] 開発サーバー再起動
- [ ] AI案内で質問実行
- [ ] 正常な回答を確認
- [ ] スクリーンショット保存

すべて完了すれば、ポートフォリオの評価が 7.5/10 → 9/10 になります！

---

**所要時間:** 約1-2時間
**コスト:** 約$0.01（1円未満）
**難易度:** ⭐⭐⭐☆☆（中級）
**効果:** 採用競争力が大幅向上

**今すぐ始めましょう！**

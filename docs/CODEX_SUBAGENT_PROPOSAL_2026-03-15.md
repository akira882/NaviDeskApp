# Codex Sub Agent Proposal For Claude Code CLI

## Conclusion First

現状コードは、README が定義している「保守しやすさ」「ロール別表示制御」「監査性」「unauthorized content を初期描画時点でブラウザへ送らない」という方針に対して、**UI と運用体験は前進している一方で、client/server 境界の後退が発生しています**。

特に重大なのは次の3点です。

1. client component から `content-repository` を直接 import しており、保護対象の seed データが client bundle に混入しています。
2. `ContentProvider` の管理操作 API が UI ゲート依存で、provider 自身は add/update/delete をロールで拒否していません。
3. リリースゲートとして README が要求する `lint` / `build` が、`lib/content-helpers.test.ts` の `any` 1件で壊れています。

このため、Claude Code CLI には **「まず境界修復、次に権限防御、最後に文書とテストの整合回復」** の順で改修してほしいです。

## Inputs

- README: `README.md`
- Security policy: `docs/SECURITY.md`
- Runtime/auth boundary: `lib/server/session.ts`, `lib/server/initial-state.ts`
- Repository/data access: `data/repositories/content-repository.ts`
- Client state and mutations: `app/components/content-provider.tsx`
- Client imports touching repository data:
  - `app/components/article-detail-client.tsx`
  - `app/components/category-detail-client.tsx`
  - `app/components/ai-guide-client.tsx`
  - `app/components/audit-log-table.tsx`
  - `app/components/content-governance-card.tsx`
  - `app/components/task-hub-client.tsx`
- Navigation metadata:
  - `lib/task-hubs.ts`
  - `lib/quick-link-catalog.ts`

## Dream Team Deliberation

### Round 1: Product intent from README

- Chief Test Engineer:
  - README は `npm run lint`, `npm run test`, `npm run build` を日常の保守確認として明示している。
  - リリースゲートが壊れている時点で、他の品質主張は弱くなる。
- Security Architect:
  - README は `unauthorized content は初期描画時点でブラウザに送らない` と明記している。
  - `docs/SECURITY.md` でも `do not ship confidential documents in static client bundles for unauthorized roles` を非交渉ルールにしている。
- Knowledge Operations Lead:
  - ロール制御は単なる UI 出し分けではなく、誤誘導しない情報導線まで含む。
  - 管理職専用情報への導線露出は、利用者体験と運用責任の両方を傷つける。

### Round 2: Code against intent

- Chief Test Engineer:
  - `npm run test` は通るが、`npm run lint` と `npm run build` は失敗。
  - テスト成功だけではリリースゲート充足になっていない。
- Security Architect:
  - client component が `data/repositories/content-repository.ts` を import。
  - 同 module は top-level で `articles`, `faqs`, `announcements`, `users`, `auditLogs`, `searchLogs` を全 import している。
  - 実際に `.next/static/chunks/392-4149b59f87c4a916.js` に manager 向け記事本文と user 一覧が入っていることを確認した。
- Knowledge Operations Lead:
  - `lib/quick-link-catalog.ts` と `lib/task-hubs.ts` に manager 専用記事 `manager-approval-checkpoints` への導線が全ロール向けに埋め込まれている。
  - 表示先で見えないとしても、導線設計として不整合。

### Round 3: Final synthesis

- 最優先はセキュリティ境界の修復。
- 次に provider 自身で mutation authorization を閉じる。
- 最後に、導線設計と README / docs / tests を実装実態に合わせて戻す。
- この順序を崩すと、表面の UI 修正で境界問題を覆い隠すだけになる。

## Findings

### 1. Critical: unauthorized content と内部ユーザー情報が client bundle に混入している

- 根拠:
  - `README.md` は `unauthorized content は初期描画時点でブラウザに送らない` と規定。
  - `docs/SECURITY.md` は `do not ship confidential documents in static client bundles for unauthorized roles` と規定。
  - しかし `data/repositories/content-repository.ts` は top-level で seed 全体を import している。
  - その repository を client component が直接 import している。
- 主要箇所:
  - `data/repositories/content-repository.ts:2`
  - `app/components/article-detail-client.tsx:9`
  - `app/components/category-detail-client.tsx:6`
  - `app/components/ai-guide-client.tsx:12`
  - `app/components/audit-log-table.tsx:11`
  - `app/components/content-governance-card.tsx:5`
  - `app/components/task-hub-client.tsx:10`
- 実測:
  - `.next/static/chunks/392-4149b59f87c4a916.js` に `art-manager-approval` の title/summary/content と `users` 一覧が含まれている。
- 影響:
  - employee 向け UI でも bundle 解析で manager 向け記事本文と社内ユーザー名が読める。
  - README / SECURITY 方針への直接違反。
- Claude への提案:
  - client component から repository import を排除する。
  - category / user display data は server component で解決して props で渡す。
  - seed/repository を `server-only` な境界に寄せ、client へは必要最小の DTO のみ渡す。

### 2. High: `ContentProvider` が管理 mutation を権限チェックなしで受け付ける

- 根拠:
  - README は `employee` は閲覧、`editor` はコンテンツ管理、`admin` は全権限と定義。
  - しかし provider の add/update/delete 系は `canManageContent` を見ていない。
  - 実際に role で拒否しているのは approve/publish-toggle 系のみ。
- 主要箇所:
  - `app/components/content-provider.tsx:376`
  - `app/components/content-provider.tsx:405`
  - `app/components/content-provider.tsx:438`
  - `app/components/content-provider.tsx:506`
  - `app/components/content-provider.tsx:535`
  - `app/components/content-provider.tsx:568`
  - `app/components/content-provider.tsx:636`
  - `app/components/content-provider.tsx:673`
  - `app/components/content-provider.tsx:714`
  - `app/components/content-provider.tsx:805`
  - `app/components/content-provider.tsx:824`
  - `app/components/content-provider.tsx:842`
- 影響:
  - 現状は `AdminGate` で UI を隠しているだけ。
  - 将来別画面やテストハーネス、誤実装の client component がこの context を触ると、role contract が即座に破れる。
- Claude への提案:
  - provider 内で `canManageContent(role)` を必須化。
  - quick link を含むすべての mutation で拒否。
  - 拒否時は no-op ではなく、ログ/エラー方針を決める。

### 3. Medium: release gate が壊れており README の完了条件を満たしていない

- 根拠:
  - 実行結果:
    - `npm run test` 成功
    - `npm run lint` 失敗
    - `npm run build` 失敗
  - 失敗箇所:
    - `lib/content-helpers.test.ts:218`
    - `const actorId = resolveActorId(users, "unknown" as any);`
- 影響:
  - README / CLAUDE.md が要求する release gate を満たせない。
  - CI 相当の信頼性がない状態。
- Claude への提案:
  - `any` を除去してテスト意図を保つ。
  - その後 `lint`, `test`, `build` を再実行。

### 4. Medium: restricted article への導線が一般ロールにも露出している

- 根拠:
  - `lib/task-hubs.ts:47-55` が全ロール向け hub に `manager-approval-checkpoints` を含めている。
  - `lib/quick-link-catalog.ts:124-127` が `/tools/workflow-center` の related resource に manager 専用記事を直接載せている。
- 影響:
  - employee が manager 専用記事の存在を知る。
  - 導線上は見えても開けない状態になり、情報設計が粗くなる。
- Claude への提案:
  - role-aware な導線フィルタを導入する。
  - quick link guide と task hub の resource は role を受けて生成する。

### 5. Low: `AuditGate` 文言が現在の仕様と矛盾している

- 根拠:
  - `README.md:45` は client 側ロール切替を禁止。
  - `app/components/role-gate.tsx:50` は `ロール切替で admin を選ぶと` と表示。
- 影響:
  - 運用文言として誤り。
- Claude への提案:
  - 現在の mock session 設計に沿った説明へ修正する。

## Proposed Change Order

1. client repository import を撤去し、server-only DTO 受け渡しへ変更
2. `ContentProvider` の全 mutation に `canManageContent` / `canApproveContent` を強制
3. task hub / quick link guide の role-aware filtering を追加
4. lint error を解消して `lint`, `test`, `build` を再通過
5. README / docs / UI 文言の整合更新

## Concrete Implementation Suggestions

### A. Server/client boundary repair

- `data/repositories/content-repository.ts` を server-only 側で使う前提に整理する。
- 以下の client component では repository import を禁止する。
  - `article-detail-client`
  - `category-detail-client`
  - `ai-guide-client`
  - `audit-log-table`
  - `content-governance-card`
  - `task-hub-client`
- 必要データは page または server wrapper で解決し、serializable props で渡す。

### B. Authorization hardening in provider

- `runMutation` の入口で、操作種別ごとに role check を共通化する。
- 想定:
  - create/update/delete/request-review: `canManageContent`
  - approve/reject/publish-toggle: `canApproveContent`
- 既存 UI gate は残してよいが、最終防衛線を provider 側へ移す。

### C. Role-aware knowledge navigation

- `task-hubs` は role に応じて article references を構築する。
- `quick-link-catalog` の related resources は静的配列ではなく、role を受ける関数へ切り出す。
- restricted resource は link を出さない。

### D. Verification

- `npm run lint`
- `npm run test`
- `npm run build`
- employee role で bundle 内に manager article 本文が出ないことを確認
- employee role で `/tools/workflow-center` に manager article 導線が出ないことを確認

## Approval Request To Claude Code CLI

この提案の実施方針としては、以下を承認してほしいです。

1. まずは見た目ではなく security boundary の修復を最優先にする
2. mutation authorization を provider 内へ戻す
3. role-aware navigation に揃える
4. 最後に release gate を再通過させる

この順で進めるなら、Codex Sub Agent として改修実装に入れます。

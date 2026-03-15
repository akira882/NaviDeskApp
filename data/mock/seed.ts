import type {
  Announcement,
  Article,
  AuditLog,
  Category,
  FAQ,
  QuickLink,
  SearchLog,
  User
} from "@/types/domain";
import { listSeedQuickLinks } from "@/lib/quick-link-catalog";

type ApprovalSeedFields = Pick<Article, "approvalStatus" | "reviewComment" | "reviewedAt" | "reviewedBy">;

function withSeedApproval<T extends { status: "draft" | "published" }>(
  item: T,
  overrides: Partial<ApprovalSeedFields> = {}
): T & ApprovalSeedFields {
  const defaults: ApprovalSeedFields =
    item.status === "published"
      ? {
          approvalStatus: "approved",
          reviewComment: "初期公開済みコンテンツ",
          reviewedAt: "2026-02-01T09:00:00+09:00",
          reviewedBy: "u-adm"
        }
      : {
          approvalStatus: "not_requested",
          reviewComment: null,
          reviewedAt: null,
          reviewedBy: null
        };

  return {
    ...item,
    ...defaults,
    ...overrides
  };
}

export const users: User[] = [
  { id: "u-emp", name: "佐藤 美咲", department: "営業部", role: "employee" },
  { id: "u-mgr", name: "田中 恒一", department: "営業部", role: "manager" },
  { id: "u-edt", name: "高橋 由奈", department: "コーポレート企画", role: "editor" },
  { id: "u-adm", name: "小清水晶", department: "情報システム部", role: "admin" }
];

export const categories: Category[] = [
  { id: "cat-hr", slug: "hr", name: "人事", description: "入退社、休暇、評価、各種申請に関する案内", ownerDepartment: "人事部" },
  { id: "cat-it", slug: "it", name: "情シス", description: "PC、アカウント、VPN、SaaS 利用に関する案内", ownerDepartment: "情報システム部" },
  { id: "cat-ga", slug: "general-affairs", name: "総務", description: "備品、座席、来客、オフィス利用ルール", ownerDepartment: "総務部" },
  { id: "cat-app", slug: "application", name: "申請・手続き", description: "申請書、稟議、証明書発行などの手続き集約", ownerDepartment: "コーポレート企画" },
  { id: "cat-work", slug: "work-rules", name: "就業ルール", description: "勤怠、在宅勤務、出張、残業ルール", ownerDepartment: "人事部" },
  { id: "cat-benefit", slug: "benefits", name: "福利厚生", description: "補助制度、健康支援、社内制度の利用案内", ownerDepartment: "人事部" }
];

const articleSeed: Array<Omit<Article, "approvalStatus" | "reviewComment" | "reviewedAt" | "reviewedBy">> = [
  {
    id: "art-paid-leave",
    title: "有休申請の手順",
    slug: "paid-leave-request",
    categoryId: "cat-hr",
    summary: "勤怠システムから有給休暇を申請し、承認完了まで確認する標準手順です。",
    content:
      "1. 勤怠システムへログインします。\n2. 申請メニューから「休暇申請」を選択します。\n3. 休暇種別で「年次有給休暇」を選択し、取得日と理由区分を入力します。\n4. 引き継ぎ事項がある場合は備考欄へ記載します。\n5. 直属上長の承認後、人事側で反映状況を確認します。\n6. 前日17時以降の申請は当日朝に上長へ口頭連絡してください。",
    tags: ["有休", "勤怠", "申請"],
    status: "published",
    visibilityRole: "employee",
    relatedArticleIds: ["art-attendance-fix", "art-manager-approval"],
    updatedAt: "2026-02-10T09:00:00+09:00",
    updatedBy: "u-edt"
  },
  {
    id: "art-attendance-fix",
    title: "勤怠修正申請の方法",
    slug: "attendance-correction",
    categoryId: "cat-work",
    summary: "打刻漏れや勤務区分誤りがあった際の修正申請フローです。",
    content:
      "1. 勤怠システムの月次画面から対象日を選択します。\n2. 修正理由を選び、正しい出退勤時刻または勤務区分を入力します。\n3. 添付が必要な場合は交通機関遅延証明などをアップロードします。\n4. 月末締めの前営業日18時までに申請してください。\n5. 上長承認後、給与計算反映の対象になります。",
    tags: ["勤怠", "修正", "申請"],
    status: "published",
    visibilityRole: "employee",
    relatedArticleIds: ["art-paid-leave"],
    updatedAt: "2026-02-15T10:30:00+09:00",
    updatedBy: "u-edt"
  },
  {
    id: "art-vpn",
    title: "VPN設定ガイド",
    slug: "vpn-setup-guide",
    categoryId: "cat-it",
    summary: "在宅勤務開始前に必要な VPN クライアント設定手順です。",
    content:
      "1. ソフトウェア配布ポータルから VPN クライアントをインストールします。\n2. 接続先は「NaviDesk-Corp」を選択します。\n3. 社員番号と SSO パスワードを入力します。\n4. 初回のみ多要素認証アプリで確認コードを承認します。\n5. 接続後は社内ファイルサーバーと基幹システムへの疎通を確認してください。\n6. 接続できない場合はヘルプデスクへチケットを起票します。",
    tags: ["VPN", "在宅勤務", "SSO"],
    status: "published",
    visibilityRole: "employee",
    relatedArticleIds: ["art-password-reset", "art-helpdesk"],
    updatedAt: "2026-01-28T13:00:00+09:00",
    updatedBy: "u-adm"
  },
  {
    id: "art-password-reset",
    title: "PCパスワード初期化手順",
    slug: "pc-password-reset",
    categoryId: "cat-it",
    summary: "PC ログインパスワードを失念した際の復旧フローです。",
    content:
      "1. セルフサービスパスワードポータルへアクセスします。\n2. 社員番号と登録済みメールアドレスを入力します。\n3. 本人確認コードを入力して仮パスワードを発行します。\n4. 仮パスワードでサインイン後、10分以内に新しいパスワードへ変更します。\n5. ポータルが使えない場合はヘルプデスクへ電話連絡してください。",
    tags: ["パスワード", "PC", "ヘルプデスク"],
    status: "published",
    visibilityRole: "employee",
    relatedArticleIds: ["art-helpdesk"],
    updatedAt: "2026-02-01T11:00:00+09:00",
    updatedBy: "u-adm"
  },
  {
    id: "art-benefits",
    title: "福利厚生サービスの利用方法",
    slug: "benefits-usage",
    categoryId: "cat-benefit",
    summary: "福利厚生ポータルで補助制度を検索し、申請するまでの流れをまとめています。",
    content:
      "1. 福利厚生ポータルへ SSO でログインします。\n2. メニューから「制度を探す」を選びます。\n3. カテゴリやキーワードで制度を絞り込みます。\n4. 利用条件を確認し、必要書類を添付して申請します。\n5. 承認状況はマイページから確認できます。\n6. 申請前に上限回数と対象期間を必ず確認してください。",
    tags: ["福利厚生", "申請", "SSO"],
    status: "published",
    visibilityRole: "employee",
    relatedArticleIds: [],
    updatedAt: "2026-02-20T15:00:00+09:00",
    updatedBy: "u-edt"
  },
  {
    id: "art-helpdesk",
    title: "社内ヘルプデスクへの問い合わせ方法",
    slug: "helpdesk-contact",
    categoryId: "cat-it",
    summary: "問い合わせチャネル、優先度、必要記載事項を整理しています。",
    content:
      "1. ITサポートポータルからチケットを作成します。\n2. 件名は症状が分かる表現で記載します。\n3. 利用端末、発生時刻、エラーメッセージ、影響範囲を入力します。\n4. 緊急停止が発生している場合は電話窓口へ連絡します。\n5. 対応履歴はチケット一覧から確認できます。",
    tags: ["ヘルプデスク", "問い合わせ", "障害"],
    status: "published",
    visibilityRole: "employee",
    relatedArticleIds: ["art-vpn", "art-password-reset"],
    updatedAt: "2026-02-12T16:15:00+09:00",
    updatedBy: "u-adm"
  },
  {
    id: "art-manager-approval",
    title: "管理職向け 申請承認の確認ポイント",
    slug: "manager-approval-checkpoints",
    categoryId: "cat-app",
    summary: "申請承認時に確認すべき人員配置、予算、勤務ルールの観点を整理しています。",
    content:
      "1. 承認前に業務引き継ぎ計画が明記されているか確認します。\n2. 勤怠修正や休暇申請は締め処理への影響を確認します。\n3. 出張や経費は部門予算と整合するかを確認します。\n4. 差し戻し時は理由を具体的にコメントしてください。",
    tags: ["管理職", "承認", "申請"],
    status: "published",
    visibilityRole: "manager",
    relatedArticleIds: ["art-paid-leave", "art-attendance-fix"],
    updatedAt: "2026-02-22T14:00:00+09:00",
    updatedBy: "u-edt"
  },
  // 人事カテゴリ追加 (+2件)
  {
    id: "art-onboarding",
    title: "入社手続きの流れ",
    slug: "employee-onboarding-process",
    categoryId: "cat-hr",
    summary: "新入社員の入社手続き、必要書類、初日の流れを説明しています。",
    content:
      "1. 入社日の2週間前までに必要書類を人事へ提出してください。\n2. 必要書類: 雇用契約書（署名済み）、身分証明書コピー、マイナンバー通知書コピー、銀行口座情報。\n3. 入社日当日は9:00に受付へお越しください。\n4. 初日は人事オリエンテーション、PC・アカウント発行、部門紹介を行います。\n5. 社会保険・雇用保険の加入手続きは人事側で進めます。\n6. 不明点は人事担当までお問い合わせください。",
    tags: ["入社", "手続き", "新入社員"],
    status: "published",
    visibilityRole: "employee",
    relatedArticleIds: ["art-paid-leave"],
    updatedAt: "2026-01-15T10:00:00+09:00",
    updatedBy: "u-edt"
  },
  {
    id: "art-resignation",
    title: "退職手続きの案内",
    slug: "resignation-process",
    categoryId: "cat-hr",
    summary: "退職時の手続き、返却物、最終出社日までの流れを整理しています。",
    content:
      "1. 退職希望日の1ヶ月前までに直属上長へ退職意向を伝えてください。\n2. 人事へ退職届を提出します。\n3. 返却物: 社員証、PC、携帯電話、鍵、社内資料などを人事へ返却します。\n4. 最終勤務日までに有休消化計画を上長と調整してください。\n5. 退職日翌月に離職票と源泉徴収票を郵送します。\n6. 社会保険の資格喪失手続きは人事側で行います。",
    tags: ["退職", "手続き", "人事"],
    status: "published",
    visibilityRole: "employee",
    relatedArticleIds: [],
    updatedAt: "2026-01-20T11:30:00+09:00",
    updatedBy: "u-edt"
  },
  // 総務カテゴリ追加 (+3件)
  {
    id: "art-meeting-room",
    title: "会議室予約ルール",
    slug: "meeting-room-reservation",
    categoryId: "cat-ga",
    summary: "会議室予約システムの利用方法、予約ルール、キャンセル手順を説明しています。",
    content:
      "1. 社内ポータルから会議室予約システムにアクセスします。\n2. 利用日時、人数、必要設備を選択して予約します。\n3. 予約は利用開始時刻の30分前まで可能です。\n4. キャンセルは利用開始2時間前まで受付可能です。\n5. 無断キャンセルが2回続くと予約権限が一時停止されます。\n6. 利用後は机上を整理し、ホワイトボードを消してください。",
    tags: ["会議室", "予約", "総務"],
    status: "published",
    visibilityRole: "employee",
    relatedArticleIds: [],
    updatedAt: "2026-02-05T09:00:00+09:00",
    updatedBy: "u-edt"
  },
  {
    id: "art-supplies",
    title: "備品購入申請の流れ",
    slug: "office-supplies-request",
    categoryId: "cat-ga",
    summary: "文房具、消耗品、オフィス備品の購入申請手順を整理しています。",
    content:
      "1. 備品申請システムにログインします。\n2. 必要備品の品名、数量、用途を入力します。\n3. 5,000円未満の消耗品は総務承認のみで発注します。\n4. 5,000円以上の備品は上長承認後、総務へ回付されます。\n5. 発注後、納品は原則1週間以内に総務フロアで受け取り可能です。\n6. 緊急の場合は総務へ直接電話連絡してください。",
    tags: ["備品", "申請", "総務"],
    status: "published",
    visibilityRole: "employee",
    relatedArticleIds: [],
    updatedAt: "2026-02-08T14:00:00+09:00",
    updatedBy: "u-edt"
  },
  {
    id: "art-visitor",
    title: "来客対応と受付手順",
    slug: "visitor-reception-procedure",
    categoryId: "cat-ga",
    summary: "来客時の受付手順、会議室案内、セキュリティ対応を説明しています。",
    content:
      "1. 来客予定がある場合は事前に受付へ連絡してください。\n2. 受付で来客者名、訪問先、訪問時刻を記入します。\n3. 来客者へ入館証を渡し、会議室まで案内します。\n4. 会議終了後は入館証を回収し、受付へ返却してください。\n5. 外部業者の場合はセキュリティチェックリストに従い、持ち込み物を確認します。\n6. 不審者を発見した場合は直ちに受付または総務へ連絡してください。",
    tags: ["来客", "受付", "セキュリティ"],
    status: "published",
    visibilityRole: "employee",
    relatedArticleIds: [],
    updatedAt: "2026-02-12T10:30:00+09:00",
    updatedBy: "u-edt"
  },
  // 申請・手続きカテゴリ追加 (+2件)
  {
    id: "art-expense",
    title: "経費精算の申請方法",
    slug: "expense-reimbursement",
    categoryId: "cat-app",
    summary: "交通費、会議費、交際費などの経費精算申請手順を説明しています。",
    content:
      "1. 経費精算システムにログインします。\n2. 経費種別（交通費、会議費、交際費など）を選択します。\n3. 利用日、金額、用途、参加者を入力します。\n4. 領収書をスキャンまたは写真で添付します。\n5. 申請後、上長承認と経理承認を経て振込処理されます。\n6. 申請は利用月の翌月末までに完了してください。",
    tags: ["経費", "精算", "申請"],
    status: "published",
    visibilityRole: "employee",
    relatedArticleIds: [],
    updatedAt: "2026-02-18T13:00:00+09:00",
    updatedBy: "u-edt"
  },
  {
    id: "art-business-trip",
    title: "出張申請の手順",
    slug: "business-trip-request",
    categoryId: "cat-app",
    summary: "国内出張・海外出張の申請、承認、経費精算までの流れを整理しています。",
    content:
      "1. 出張申請システムから新規申請を作成します。\n2. 出張先、期間、目的、訪問先、宿泊先を入力します。\n3. 概算費用（交通費、宿泊費、日当）を記載します。\n4. 上長承認後、経理へ回付されます。\n5. 出張後1週間以内に実費精算を完了してください。\n6. 海外出張の場合は出発2週間前までに申請が必要です。",
    tags: ["出張", "申請", "経費"],
    status: "published",
    visibilityRole: "employee",
    relatedArticleIds: ["art-expense"],
    updatedAt: "2026-02-20T15:30:00+09:00",
    updatedBy: "u-edt"
  },
  // 就業ルールカテゴリ追加 (+2件)
  {
    id: "art-remote-work",
    title: "在宅勤務時の就業ルール",
    slug: "remote-work-rules",
    categoryId: "cat-work",
    summary: "在宅勤務時の勤務開始・終了報告、勤怠管理、セキュリティルールを説明しています。",
    content:
      "1. 在宅勤務日は事前に上長へ申請し、勤怠システムで「在宅勤務」を選択します。\n2. 勤務開始時にチャットで始業報告を行ってください。\n3. 勤務終了時も同様に終業報告を行います。\n4. 休憩時間は通常勤務と同様に1時間取得してください。\n5. VPN接続と社内システムへのアクセスは必須です。\n6. 社内情報の取り扱いは情報セキュリティポリシーに従ってください。",
    tags: ["在宅勤務", "就業ルール", "勤怠"],
    status: "published",
    visibilityRole: "employee",
    relatedArticleIds: ["art-vpn", "art-attendance-fix"],
    updatedAt: "2026-01-25T09:30:00+09:00",
    updatedBy: "u-edt"
  },
  {
    id: "art-overtime",
    title: "残業申請のルール",
    slug: "overtime-request-rules",
    categoryId: "cat-work",
    summary: "残業申請の事前承認、上限時間、深夜勤務時の注意事項を整理しています。",
    content:
      "1. 残業は原則として事前申請が必要です。\n2. 勤怠システムから残業予定時間と理由を入力します。\n3. 上長承認後、実際の残業が可能になります。\n4. 月間残業時間の上限は45時間です。\n5. 22時以降の深夜勤務は事前に部門長承認が必要です。\n6. 健康管理の観点から、連続勤務や過重労働を避けてください。",
    tags: ["残業", "申請", "就業ルール"],
    status: "published",
    visibilityRole: "employee",
    relatedArticleIds: ["art-attendance-fix"],
    updatedAt: "2026-02-03T10:00:00+09:00",
    updatedBy: "u-edt"
  },
  // 福利厚生カテゴリ追加 (+2件)
  {
    id: "art-health-checkup",
    title: "健康診断受診の案内",
    slug: "health-checkup-guide",
    categoryId: "cat-benefit",
    summary: "定期健康診断の予約方法、受診日程、結果確認までの流れを説明しています。",
    content:
      "1. 毎年4月〜6月に定期健康診断を実施します。\n2. 受診希望日を福利厚生ポータルから予約します。\n3. 受診日当日は指定医療機関へ直接お越しください。\n4. 受診時間は勤務時間として扱われます。\n5. 健診結果は受診後1ヶ月以内に福利厚生ポータルで確認できます。\n6. 再検査が必要な場合は産業医面談を受けてください。",
    tags: ["健康診断", "福利厚生", "産業医"],
    status: "published",
    visibilityRole: "employee",
    relatedArticleIds: ["art-benefits"],
    updatedAt: "2026-02-25T14:30:00+09:00",
    updatedBy: "u-edt"
  },
  {
    id: "art-condolence",
    title: "慶弔見舞金申請の手順",
    slug: "condolence-allowance-request",
    categoryId: "cat-benefit",
    summary: "結婚祝金、出産祝金、弔慰金などの慶弔見舞金制度と申請方法を整理しています。",
    content:
      "1. 慶弔事由が発生した場合、人事へ連絡してください。\n2. 福利厚生ポータルから該当する慶弔区分を選択します。\n3. 必要書類（結婚証明書、出生証明書、会葬礼状など）を添付します。\n4. 申請後、人事承認を経て給与と合算で支給されます。\n5. 申請は事由発生日から3ヶ月以内に完了してください。\n6. 支給金額は就業規則の慶弔規程に準じます。",
    tags: ["慶弔", "見舞金", "福利厚生"],
    status: "published",
    visibilityRole: "employee",
    relatedArticleIds: [],
    updatedAt: "2026-02-28T16:00:00+09:00",
    updatedBy: "u-edt"
  }
];

export const articles: Article[] = articleSeed.map((article) => withSeedApproval(article));

const faqSeed: Array<Omit<FAQ, "approvalStatus" | "reviewComment" | "reviewedAt" | "reviewedBy">> = [
  {
    id: "faq-vpn",
    question: "VPNに接続できない場合、最初に何を確認すべきですか？",
    answer: "多要素認証の承認待ちが残っていないか、インターネット接続が安定しているか、接続先が「NaviDesk-Corp」になっているかを確認してください。",
    categoryId: "cat-it",
    tags: ["VPN", "接続不良"],
    status: "published",
    visibilityRole: "employee",
    updatedAt: "2026-02-18T09:30:00+09:00",
    updatedBy: "u-adm"
  },
  {
    id: "faq-attendance",
    question: "勤怠修正申請はいつまでに出せば給与に反映されますか？",
    answer: "原則として月末締めの前営業日18時までに承認済みである必要があります。締め後は翌月反映になる場合があります。",
    categoryId: "cat-work",
    tags: ["勤怠", "給与"],
    status: "published",
    visibilityRole: "employee",
    updatedAt: "2026-02-14T09:00:00+09:00",
    updatedBy: "u-edt"
  },
  {
    id: "faq-benefit",
    question: "福利厚生の申請状況はどこで確認できますか？",
    answer: "福利厚生ポータルのマイページから確認できます。差し戻し理由も同画面に表示されます。",
    categoryId: "cat-benefit",
    tags: ["福利厚生", "申請状況"],
    status: "published",
    visibilityRole: "employee",
    updatedAt: "2026-02-20T16:00:00+09:00",
    updatedBy: "u-edt"
  },
  {
    id: "faq-manager",
    question: "管理職が休暇申請を差し戻す際に注意すべきことは？",
    answer: "差し戻し理由を具体的に記載し、代替日や必要な引き継ぎ条件をコメントで示してください。",
    categoryId: "cat-app",
    tags: ["管理職", "承認"],
    status: "published",
    visibilityRole: "manager",
    updatedAt: "2026-02-25T10:00:00+09:00",
    updatedBy: "u-edt"
  }
];

export const faqs: FAQ[] = faqSeed.map((faq) => withSeedApproval(faq));

const announcementSeed: Array<
  Omit<Announcement, "approvalStatus" | "reviewComment" | "reviewedAt" | "reviewedBy">
> = [
  {
    id: "ann-1",
    title: "勤怠締め時刻のリマインド",
    body: "3月度の勤怠締めは3月30日 18:00です。未承認の修正申請がある場合は早めに上長へ連絡してください。",
    status: "published",
    publishedAt: "2026-03-05T09:00:00+09:00",
    updatedAt: "2026-03-05T09:00:00+09:00",
    updatedBy: "u-edt"
  },
  {
    id: "ann-2",
    title: "VPNクライアント更新のお知らせ",
    body: "3月18日 19:00 以降、旧バージョンの VPN クライアントは接続不可になります。事前に最新版へ更新してください。",
    status: "published",
    publishedAt: "2026-03-10T12:00:00+09:00",
    updatedAt: "2026-03-10T12:00:00+09:00",
    updatedBy: "u-adm"
  },
  {
    id: "ann-3",
    title: "福利厚生ポータル改修予定",
    body: "福利厚生ポータルは4月上旬に画面改修を予定しています。申請フロー自体に変更はありません。",
    status: "draft",
    publishedAt: null,
    updatedAt: "2026-03-11T08:30:00+09:00",
    updatedBy: "u-edt"
  }
];

export const announcements: Announcement[] = announcementSeed.map((announcement) => withSeedApproval(announcement));

export const quickLinks: QuickLink[] = listSeedQuickLinks();

export const auditLogs: AuditLog[] = [
  {
    id: "log-1",
    actorId: "u-edt",
    action: "update",
    targetType: "article",
    targetId: "art-paid-leave",
    timestamp: "2026-02-10T09:05:00+09:00",
    detail: "有休申請記事の締切注記を更新"
  },
  {
    id: "log-2",
    actorId: "u-adm",
    action: "publish-toggle",
    targetType: "announcement",
    targetId: "ann-2",
    timestamp: "2026-03-10T12:05:00+09:00",
    detail: "VPN クライアント更新告知を公開"
  },
  {
    id: "log-3",
    actorId: "u-edt",
    action: "create",
    targetType: "faq",
    targetId: "faq-manager",
    timestamp: "2026-02-25T10:10:00+09:00",
    detail: "管理職向け FAQ を追加"
  }
];

export const searchLogs: SearchLog[] = [
  {
    id: "search-1",
    query: "VPN 接続 エラー",
    surface: "home",
    resultCount: 2,
    timestamp: "2026-03-12T09:10:00+09:00"
  },
  {
    id: "search-2",
    query: "交通費 精算できない",
    surface: "faq",
    resultCount: 0,
    timestamp: "2026-03-13T11:40:00+09:00"
  },
  {
    id: "search-3",
    query: "住所変更 手続き",
    surface: "home",
    resultCount: 0,
    timestamp: "2026-03-13T15:20:00+09:00"
  }
];

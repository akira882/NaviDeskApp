import type {
  Announcement,
  Article,
  AuditLog,
  Category,
  FAQ,
  QuickLink,
  User
} from "@/types/domain";

export const users: User[] = [
  { id: "u-emp", name: "佐藤 美咲", department: "営業部", role: "employee" },
  { id: "u-mgr", name: "田中 恒一", department: "営業部", role: "manager" },
  { id: "u-edt", name: "高橋 由奈", department: "コーポレート企画", role: "editor" },
  { id: "u-adm", name: "中村 翔太", department: "情報システム部", role: "admin" }
];

export const categories: Category[] = [
  { id: "cat-hr", slug: "hr", name: "人事", description: "入退社、休暇、評価、各種申請に関する案内", ownerDepartment: "人事部" },
  { id: "cat-it", slug: "it", name: "情シス", description: "PC、アカウント、VPN、SaaS 利用に関する案内", ownerDepartment: "情報システム部" },
  { id: "cat-ga", slug: "general-affairs", name: "総務", description: "備品、座席、来客、オフィス利用ルール", ownerDepartment: "総務部" },
  { id: "cat-app", slug: "application", name: "申請・手続き", description: "申請書、稟議、証明書発行などの手続き集約", ownerDepartment: "コーポレート企画" },
  { id: "cat-work", slug: "work-rules", name: "就業ルール", description: "勤怠、在宅勤務、出張、残業ルール", ownerDepartment: "人事部" },
  { id: "cat-benefit", slug: "benefits", name: "福利厚生", description: "補助制度、健康支援、社内制度の利用案内", ownerDepartment: "人事部" }
];

export const articles: Article[] = [
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
  }
];

export const faqs: FAQ[] = [
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

export const announcements: Announcement[] = [
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

export const quickLinks: QuickLink[] = [
  { id: "ql-1", label: "勤怠システム", url: "https://example.internal/time", categoryId: "cat-work", description: "打刻、有休、勤怠修正申請", sortOrder: 1 },
  { id: "ql-2", label: "ITサポートポータル", url: "https://example.internal/helpdesk", categoryId: "cat-it", description: "PC・アカウント・障害問い合わせ", sortOrder: 2 },
  { id: "ql-3", label: "福利厚生ポータル", url: "https://example.internal/benefits", categoryId: "cat-benefit", description: "制度検索と申請状況確認", sortOrder: 3 },
  { id: "ql-4", label: "各種申請ワークフロー", url: "https://example.internal/workflow", categoryId: "cat-app", description: "証明書、稟議、出張などの申請", sortOrder: 4 }
];

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

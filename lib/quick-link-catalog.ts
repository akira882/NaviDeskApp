import type { Route } from "next";

import type { QuickLink } from "@/types/domain";

type QuickLinkResource = {
  label: string;
  href: string;
};

export type QuickLinkCatalogEntry = {
  id: QuickLink["id"];
  label: QuickLink["label"];
  url: QuickLink["url"];
  categoryId: QuickLink["categoryId"];
  description: QuickLink["description"];
  sortOrder: QuickLink["sortOrder"];
  title: string;
  pageDescription: string;
  summary: string;
  primaryActions: string[];
  checkpoints: string[];
  relatedResources: QuickLinkResource[];
};

const quickLinkCatalog: QuickLinkCatalogEntry[] = [
  {
    id: "ql-1",
    label: "勤怠システム",
    url: "/tools/time-attendance",
    categoryId: "cat-work",
    description: "打刻、有給、勤怠修正申請",
    sortOrder: 1,
    title: "勤怠システム",
    pageDescription: "打刻、有給、勤怠修正の入口を 1 ページにまとめた社内導線です。",
    summary: "出退勤の打刻、休暇申請、勤怠修正で迷わないように、よく使う手続きを短い順路で整理しています。",
    primaryActions: [
      "出勤前後は打刻状況を確認する",
      "休暇取得時は有給申請手順を先に確認する",
      "打刻漏れがあれば月末前に勤怠修正を完了する"
    ],
    checkpoints: [
      "締め日の前営業日 18:00 までに修正申請を完了する",
      "前日 17:00 以降の有給申請は上長へ口頭連絡する",
      "在宅勤務日は始業・終業報告も合わせて行う"
    ],
    relatedResources: [
      { label: "有給申請の手順", href: "/articles/paid-leave-request" },
      { label: "勤怠修正申請の方法", href: "/articles/attendance-correction" },
      { label: "FAQ を確認する", href: "/faq" }
    ]
  },
  {
    id: "ql-2",
    label: "ITサポートポータル",
    url: "/tools/it-support",
    categoryId: "cat-it",
    description: "PC・アカウント・障害問い合わせ",
    sortOrder: 2,
    title: "ITサポートポータル",
    pageDescription: "端末、アカウント、VPN、障害問い合わせをまとめて確認できる案内ページです。",
    summary: "症状の切り分けと問い合わせ先を先に整理し、ヘルプデスクへ必要情報を揃えて渡せるようにしています。",
    primaryActions: [
      "VPN やログイン障害はセルフサービス手順を先に確認する",
      "復旧できない場合は発生時刻とエラーメッセージを控える",
      "業務停止レベルの障害は電話窓口へ連絡する"
    ],
    checkpoints: [
      "問い合わせ時は端末情報と影響範囲を記載する",
      "MFA や SSO の確認結果を添える",
      "同一事象の重複起票を避ける"
    ],
    relatedResources: [
      { label: "VPN設定ガイド", href: "/articles/vpn-setup-guide" },
      { label: "PCパスワード初期化手順", href: "/articles/pc-password-reset" },
      { label: "ヘルプデスクへの問い合わせ方法", href: "/articles/helpdesk-contact" }
    ]
  },
  {
    id: "ql-3",
    label: "福利厚生ポータル",
    url: "/tools/benefits-portal",
    categoryId: "cat-benefit",
    description: "制度検索と申請状況確認",
    sortOrder: 3,
    title: "福利厚生ポータル",
    pageDescription: "福利厚生制度の検索、利用条件確認、申請導線をまとめた社内ページです。",
    summary: "制度検索から申請前チェックまでを 1 か所にまとめ、対象期間や利用回数の見落としを防ぎます。",
    primaryActions: [
      "制度をカテゴリまたはキーワードで検索する",
      "利用条件と必要書類を申請前に確認する",
      "申請後はマイページで承認状況を確認する"
    ],
    checkpoints: [
      "制度ごとの対象期間を必ず確認する",
      "利用上限回数を超えていないか確認する",
      "添付書類の不足がないか見直す"
    ],
    relatedResources: [
      { label: "福利厚生サービスの利用方法", href: "/articles/benefits-usage" },
      { label: "福利厚生カテゴリを見る", href: "/categories/benefits" },
      { label: "お知らせ一覧", href: "/announcements" }
    ]
  },
  {
    id: "ql-4",
    label: "各種申請ワークフロー",
    url: "/tools/workflow-center",
    categoryId: "cat-app",
    description: "証明書、稟議、出張などの申請",
    sortOrder: 4,
    title: "各種申請ワークフロー",
    pageDescription: "証明書、稟議、出張、経費などの申請を横断して探せる導線ページです。",
    summary: "申請種別ごとに入口を分けず、承認が必要な手続きをまとめて整理しています。",
    primaryActions: [
      "申請対象に応じて必要項目を整理する",
      "上長承認の有無と締切を先に確認する",
      "提出後は差し戻しコメントを定期確認する"
    ],
    checkpoints: [
      "経費は翌月末までに申請を完了する",
      "海外出張は出発 2 週間前までに申請する",
      "差し戻し理由は具体的に確認して再提出する"
    ],
    relatedResources: [
      { label: "経費精算の申請方法", href: "/articles/expense-reimbursement" },
      { label: "出張申請の手順", href: "/articles/business-trip-request" },
      { label: "管理職向け承認ポイント", href: "/articles/manager-approval-checkpoints" }
    ]
  }
];

export function listQuickLinkCatalog() {
  return quickLinkCatalog;
}

export function listSeedQuickLinks(): QuickLink[] {
  return quickLinkCatalog.map(({ id, label, url, categoryId, description, sortOrder }) => ({
    id,
    label,
    url,
    categoryId,
    description,
    sortOrder
  }));
}

export function findQuickLinkByUrl(url: string) {
  return quickLinkCatalog.find((entry) => entry.url === url);
}

function filterResourcesByVisibleSlugs(resources: QuickLinkResource[], visibleArticleSlugs: Set<string>): QuickLinkResource[] {
  return resources.filter((resource) => {
    if (!resource.href.startsWith("/articles/")) {
      return true; // Non-article resources always visible
    }
    const articleSlug = resource.href.replace("/articles/", "");
    return visibleArticleSlugs.has(articleSlug);
  });
}

export function findQuickLinkGuideBySlug(slug: string, visibleArticleSlugs?: Set<string>) {
  const entry = quickLinkCatalog.find((entry) => entry.url === `/tools/${slug}`);
  if (!entry || !visibleArticleSlugs) return entry;

  return {
    ...entry,
    relatedResources: filterResourcesByVisibleSlugs(entry.relatedResources, visibleArticleSlugs)
  };
}

export function listQuickLinkGuideParams() {
  return quickLinkCatalog
    .filter((entry) => isInternalQuickLink(entry.url))
    .map((entry) => ({ slug: entry.url.replace("/tools/", "") }));
}

export function isExternalQuickLink(url: string) {
  return /^https?:\/\//.test(url);
}

export function isInternalQuickLink(url: string): url is Route {
  return url.startsWith("/");
}

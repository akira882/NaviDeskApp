import type { Role } from "@/types/domain";

export type TaskHub = {
  slug: string;
  title: string;
  summary: string;
  priority: number;
  targetRoles: Role[];
  categories: string[];
  quickLinkUrls: string[];
  articleSlugs: string[];
  checklist: string[];
};

const taskHubs: TaskHub[] = [
  {
    slug: "attendance-leave",
    title: "休暇・勤怠",
    summary: "打刻、有給、勤怠修正、在宅勤務報告を最短で完了するための導線。",
    priority: 100,
    targetRoles: ["employee", "manager", "editor", "admin"],
    categories: ["cat-work", "cat-hr"],
    quickLinkUrls: ["/tools/time-attendance"],
    articleSlugs: ["paid-leave-request", "attendance-correction", "remote-work-rules"],
    checklist: [
      "打刻漏れは締め日前に修正する",
      "休暇申請は承認者への連絡を含めて完了する",
      "在宅勤務日は始業・終業報告を忘れない"
    ]
  },
  {
    slug: "it-access-support",
    title: "PC・アカウント・障害対応",
    summary: "VPN、パスワード、アカウント、問い合わせ先をまとめた復旧導線。",
    priority: 95,
    targetRoles: ["employee", "manager", "editor", "admin"],
    categories: ["cat-it"],
    quickLinkUrls: ["/tools/it-support"],
    articleSlugs: ["vpn-setup-guide", "pc-password-reset", "helpdesk-contact"],
    checklist: [
      "症状と発生時刻を先に整理する",
      "セルフサービス復旧を先に試す",
      "業務停止時は電話窓口へ即時連絡する"
    ]
  },
  {
    slug: "expenses-workflow",
    title: "経費・出張・各種申請",
    summary: "承認が必要な申請を締切起点で整理し、差し戻しを減らす導線。",
    priority: 90,
    targetRoles: ["employee", "manager", "editor", "admin"],
    categories: ["cat-app"],
    quickLinkUrls: ["/tools/workflow-center"],
    articleSlugs: ["expense-reimbursement", "business-trip-request", "manager-approval-checkpoints"],
    checklist: [
      "締切と承認経路を先に確認する",
      "領収書や添付資料を揃えてから申請する",
      "差し戻し理由は具体的に確認して再提出する"
    ]
  },
  {
    slug: "benefits-support",
    title: "福利厚生・制度活用",
    summary: "制度検索、利用条件確認、申請状況確認をまとめたセルフサービス導線。",
    priority: 76,
    targetRoles: ["employee", "manager", "editor", "admin"],
    categories: ["cat-benefit"],
    quickLinkUrls: ["/tools/benefits-portal"],
    articleSlugs: ["benefits-usage"],
    checklist: [
      "対象期間を確認する",
      "利用回数上限を超えていないか確認する",
      "必要書類の不足を申請前に見直す"
    ]
  }
];

export function listTaskHubs() {
  return taskHubs;
}

export function listTaskHubsForRole(role: Role, visibleArticleSlugs?: Set<string>) {
  return taskHubs
    .filter((hub) => hub.targetRoles.includes(role))
    .map((hub) => ({
      ...hub,
      articleSlugs: visibleArticleSlugs
        ? hub.articleSlugs.filter((slug) => visibleArticleSlugs.has(slug))
        : hub.articleSlugs
    }))
    .sort((a, b) => b.priority - a.priority);
}

export function findTaskHubBySlug(slug: string, visibleArticleSlugs?: Set<string>) {
  const hub = taskHubs.find((hub) => hub.slug === slug);
  if (!hub || !visibleArticleSlugs) return hub;

  // Filter articleSlugs based on visible slugs
  return {
    ...hub,
    articleSlugs: hub.articleSlugs.filter((articleSlug) => visibleArticleSlugs.has(articleSlug))
  };
}

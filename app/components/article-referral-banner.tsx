"use client";

import { Info } from "lucide-react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

type ReferralConfig = {
  label: string;
  message: string;
};

const REFERRAL_CONFIG: Record<string, ReferralConfig> = {
  helpdesk: {
    label: "ITヘルプデスクから",
    message:
      "チケット対応中の方へ: この手順で解決しない場合は、試したことと結果をチケットにご記載の上、担当者にご連絡ください。"
  },
  onboarding: {
    label: "入社手続きガイドから",
    message:
      "入社手続き中の方へ: ご不明な点は人事担当者にお問い合わせください。初日のご準備をサポートします。"
  },
  email: {
    label: "メールから",
    message: "メール記載のリンクからお越しいただきました。"
  }
};

function ReferralBannerInner() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  if (!from) return null;
  const config = REFERRAL_CONFIG[from];
  if (!config) return null;

  return (
    <div className="flex gap-3 rounded-lg border border-accent-blue/25 bg-accent-blue/8 p-3.5" data-print-hidden>
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent-blue" />
      <div className="space-y-0.5">
        <p className="text-xs font-medium text-accent-blue">{config.label}</p>
        <p className="text-sm leading-6 text-text-secondary">{config.message}</p>
      </div>
    </div>
  );
}

export function ArticleReferralBanner() {
  return (
    <Suspense fallback={null}>
      <ReferralBannerInner />
    </Suspense>
  );
}

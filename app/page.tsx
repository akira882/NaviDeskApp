import { AppShell } from "@/components/app-shell";
import { HomeClient } from "@/components/home-client.v2";
import { categoryRepository } from "@/data/repositories/content-repository";

export default function HomePage() {
  return (
    <AppShell
      title="ホーム"
      description="FAQ、手順書、お知らせ、業務リンクを統合し、社内オペレーションの探索時間と問い合わせ負荷を下げる情報基盤です。"
    >
      <HomeClient categories={categoryRepository.list()} />
    </AppShell>
  );
}

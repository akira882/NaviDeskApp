import { AppShell } from "@/components/app-shell";
import { HomeClient } from "@/components/home-client";
import { categoryRepository } from "@/data/repositories/content-repository";

export default function HomePage() {
  return (
    <AppShell
      title="社内情報の検索起点"
      description="FAQ、手順書、お知らせ、業務リンクを統合し、社内オペレーションの探索時間と問い合わせ負荷を下げる情報基盤です。"
    >
      <HomeClient categories={categoryRepository.list()} />
    </AppShell>
  );
}

import { AppShell } from "@/components/app-shell";
import { HomeClient } from "@/components/home-client";
import { categoryRepository } from "@/data/repositories/content-repository";

export default function HomePage() {
  return (
    <AppShell
      title="社内情報の検索起点"
      description="NaviDesk は、FAQ・手順書・お知らせ・業務リンクをひとつに集約し、検索と AI 補助で情報到達を短くする社内向けポータルです。"
    >
      <HomeClient categories={categoryRepository.list()} />
    </AppShell>
  );
}

import { AppShell } from "@/components/app-shell";
import { AnnouncementsClient } from "@/components/announcements-client";

export default function AnnouncementsPage() {
  return (
    <AppShell
      title="お知らせ一覧"
      description="全社通知、システム更新、申請締め切りなど、業務影響のある告知を時系列で確認できます。"
    >
      <AnnouncementsClient />
    </AppShell>
  );
}

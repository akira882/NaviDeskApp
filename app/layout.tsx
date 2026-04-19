import type { Metadata } from "next";

import "@/app/globals.css";
import { CommandPaletteProvider } from "@/components/command-palette";
import { ContentProvider } from "@/components/content-provider";
import { RoleProvider } from "@/components/role-provider";
import { ErrorBoundary } from "@/components/error-boundary";
import { categoryRepository, userRepository } from "@/data/repositories/content-repository";
import { buildInitialStateForRole } from "@/lib/server/initial-state";
import { getSessionRole } from "@/lib/server/session";
import type { Role } from "@/types/domain";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "NaviDeskApp",
  description: "社内ナレッジ運用ポータル"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const role = getSessionRole();
  const initialState = buildInitialStateForRole(role);
  const actorIdByRole = Object.fromEntries(
    userRepository.listUsers().map((user) => [user.role, user.id])
  ) as Record<Role, string>;
  const categories = categoryRepository.list();

  return (
    <html lang="ja" className="dark">
      <body className="bg-ink text-text-primary font-sans antialiased">
        <ErrorBoundary>
          <RoleProvider initialRole={role}>
            <ContentProvider initialState={initialState} actorIdByRole={actorIdByRole}>
              <CommandPaletteProvider categories={categories}>{children}</CommandPaletteProvider>
            </ContentProvider>
          </RoleProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

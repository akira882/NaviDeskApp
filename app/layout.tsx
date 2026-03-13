import type { Metadata } from "next";

import "@/app/globals.css";
import { ContentProvider } from "@/components/content-provider";
import { RoleProvider } from "@/components/role-provider";
import { buildInitialStateForRole } from "@/lib/server/initial-state";
import { getSessionRole } from "@/lib/server/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "NaviDeskApp",
  description: "Enterprise knowledge operations portal"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const role = getSessionRole();
  const initialState = buildInitialStateForRole(role);

  return (
    <html lang="ja">
      <body className="font-sans">
        <RoleProvider initialRole={role}>
          <ContentProvider initialState={initialState}>{children}</ContentProvider>
        </RoleProvider>
      </body>
    </html>
  );
}

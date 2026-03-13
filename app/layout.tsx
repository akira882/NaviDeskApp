import type { Metadata } from "next";

import "@/app/globals.css";
import { ContentProvider } from "@/components/content-provider";
import { RoleProvider } from "@/components/role-provider";

export const metadata: Metadata = {
  title: "NaviDesk",
  description: "社内向け AI ポータル MVP"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="font-sans">
        <RoleProvider>
          <ContentProvider>{children}</ContentProvider>
        </RoleProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";

import "@/app/globals.css";
import { ContentProvider } from "@/components/content-provider";
import { RoleProvider } from "@/components/role-provider";

export const metadata: Metadata = {
  title: "NaviDeskApp",
  description: "Enterprise knowledge operations portal"
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

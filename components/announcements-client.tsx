"use client";

import { useMemo } from "react";

import { useContent } from "@/components/content-provider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { listPublishedAnnouncements } from "@/lib/content-helpers";
import { formatDate } from "@/lib/utils";

export function AnnouncementsClient() {
  const content = useContent();
  const announcements = useMemo(() => listPublishedAnnouncements(content), [content]);

  return (
    <div className="space-y-4">
      {announcements.map((announcement) => (
        <Card key={announcement.id}>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge>公開中</Badge>
              <span className="text-xs text-slate-500">{formatDate(announcement.publishedAt)}</span>
            </div>
            <h2 className="text-2xl font-semibold text-ink">{announcement.title}</h2>
            <p className="text-sm leading-7 text-slate-700">{announcement.body}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

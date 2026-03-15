import { describe, expect, it } from "vitest";

import { announcements, articles, faqs } from "@/data/mock/seed";
import { getFreshnessStatus, listReviewPriorityItems } from "@/lib/content-governance";

describe("content governance", () => {
  it("classifies freshness by age", () => {
    expect(getFreshnessStatus("2026-03-10T00:00:00+09:00", new Date("2026-03-14T00:00:00+09:00"))).toBe("healthy");
    expect(getFreshnessStatus("2026-02-10T00:00:00+09:00", new Date("2026-03-14T00:00:00+09:00"))).toBe("warning");
    expect(getFreshnessStatus("2026-01-20T00:00:00+09:00", new Date("2026-03-14T00:00:00+09:00"))).toBe("critical");
  });

  it("lists stale items in descending age order", () => {
    const items = listReviewPriorityItems(
      { articles, faqs, announcements },
      new Date("2026-03-14T00:00:00+09:00")
    );

    expect(items.length).toBeGreaterThan(0);
    if (items.length > 1) {
      expect(items[0].daysSinceUpdate >= items[1].daysSinceUpdate).toBe(true);
    }
  });
});

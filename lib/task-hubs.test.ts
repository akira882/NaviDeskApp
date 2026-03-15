import { describe, expect, it } from "vitest";

import { listTaskHubs, listTaskHubsForRole } from "@/lib/task-hubs";

describe("task hubs", () => {
  it("returns hubs sorted by priority", () => {
    const hubs = listTaskHubsForRole("employee");

    expect(hubs.length).toBeGreaterThan(0);
    expect(hubs[0].priority >= hubs[1].priority).toBe(true);
  });

  it("keeps internal workflow references populated", () => {
    const hubs = listTaskHubs();

    hubs.forEach((hub) => {
      expect(hub.quickLinkUrls.length).toBeGreaterThan(0);
      expect(hub.articleSlugs.length).toBeGreaterThan(0);
      expect(hub.checklist.length).toBeGreaterThan(0);
    });
  });
});

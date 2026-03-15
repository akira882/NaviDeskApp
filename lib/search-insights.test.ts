import { describe, expect, it } from "vitest";

import { announcements, articles, faqs, searchLogs } from "@/data/mock/seed";
import { listFailedSearchThemes } from "@/lib/content-helpers";
import { listSearchImprovementCandidates } from "@/lib/search-insights";

describe("search insights", () => {
  it("builds recommendations for failed search themes", () => {
    const failedThemes = listFailedSearchThemes(searchLogs);
    const candidates = listSearchImprovementCandidates({
      failedThemes,
      articles,
      faqs,
      announcements
    });

    expect(candidates.length).toBe(failedThemes.length);
    expect(candidates[0]?.recommendation).toBeTruthy();
  });
});

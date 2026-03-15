import { describe, expect, it } from "vitest";

import { quickLinks } from "@/data/mock/seed";
import {
  findQuickLinkByUrl,
  findQuickLinkGuideBySlug,
  isInternalQuickLink,
  listQuickLinkCatalog,
  listQuickLinkGuideParams
} from "@/lib/quick-link-catalog";

describe("quick link catalog", () => {
  it("keeps seed quick links aligned with the catalog", () => {
    const catalog = listQuickLinkCatalog();

    expect(quickLinks).toHaveLength(catalog.length);
    expect(quickLinks.map((link) => link.url)).toEqual(catalog.map((entry) => entry.url));
  });

  it("provides a guide page for every internal quick link", () => {
    const internalLinks = quickLinks.filter((link) => isInternalQuickLink(link.url));

    expect(internalLinks.length).toBeGreaterThan(0);

    internalLinks.forEach((link) => {
      const guide = findQuickLinkByUrl(link.url);

      expect(guide?.title).toBeTruthy();
      expect(guide?.primaryActions.length).toBeGreaterThan(0);
      expect(guide?.checkpoints.length).toBeGreaterThan(0);
    });
  });

  it("resolves guide params back to guide content", () => {
    const params = listQuickLinkGuideParams();

    params.forEach(({ slug }) => {
      expect(findQuickLinkGuideBySlug(slug)?.url).toBe(`/tools/${slug}`);
    });
  });
});

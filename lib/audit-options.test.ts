import { describe, expect, it } from "vitest";

import { listAuditActionOptions, listAuditTargetOptions } from "@/lib/audit";

describe("audit options", () => {
  it("exposes all supported audit actions", () => {
    expect(listAuditActionOptions()).toContain("approve");
    expect(listAuditActionOptions()).toContain("submit-review");
  });

  it("exposes all supported audit targets", () => {
    expect(listAuditTargetOptions()).toEqual(["article", "faq", "announcement", "quick-link"]);
  });
});

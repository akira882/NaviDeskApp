import { describe, expect, it } from "vitest";

import { auditLogs } from "@/data/mock/seed";
import { getAuditActionLabel, listAuditLogsForTarget } from "@/lib/audit";

describe("audit helpers", () => {
  it("maps audit actions to Japanese labels", () => {
    expect(getAuditActionLabel("submit-review")).toBe("承認申請");
    expect(getAuditActionLabel("approve")).toBe("承認");
  });

  it("returns target-specific logs sorted by newest first", () => {
    const logs = listAuditLogsForTarget(auditLogs, "article", "art-paid-leave");

    expect(logs.length).toBeGreaterThan(0);
    if (logs.length > 1) {
      expect(logs[0].timestamp >= logs[1].timestamp).toBe(true);
    }
  });
});

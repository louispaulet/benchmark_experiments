import { describe, expect, it } from "vitest";
import { dateValue, displayDate, pct, streak, topTokenLabel } from "./format";

describe("format helpers", () => {
  it("formats percentages with compact decimals", () => {
    expect(pct(100)).toBe("100%");
    expect(pct(66.666)).toBe("66.67%");
  });

  it("uses n/a fallbacks for missing streaks and dates", () => {
    expect(streak(null)).toBe("n/a");
    expect(streak(undefined)).toBe("n/a");
    expect(streak(0)).toBe(0);
    expect(dateValue("")).toBe("n/a");
    expect(displayDate("2026-05-25T10:30:00Z")).toBe("2026-05-25");
  });

  it("formats the first top token label", () => {
    expect(topTokenLabel({ top_logprobs: [[{ token: "42", logprob: -0.1234 }]] })).toBe('"42" (-0.12)');
    expect(topTokenLabel({ top_logprobs: [] })).toBe("n/a");
  });
});

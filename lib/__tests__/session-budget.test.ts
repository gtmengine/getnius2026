import { describe, expect, it } from "vitest";

import { incrementSessionBudget, parseSessionBudget } from "../session-budget";

describe("session budget", () => {
  it("parses invalid values to 0", () => {
    expect(parseSessionBudget(undefined)).toBe(0);
    expect(parseSessionBudget("")).toBe(0);
    expect(parseSessionBudget("abc")).toBe(0);
  });

  it("increments and flags when exceeding limit", () => {
    const limit = 2;
    const first = incrementSessionBudget(0, limit);
    const second = incrementSessionBudget(first.count, limit);
    const third = incrementSessionBudget(second.count, limit);

    expect(first.exceeded).toBe(false);
    expect(second.exceeded).toBe(false);
    expect(third.exceeded).toBe(true);
  });
});

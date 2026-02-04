import { describe, expect, it } from "vitest";

import { normalizeQueryForCache } from "../google-search";

describe("google search helpers", () => {
  it("normalizes queries for cache keys", () => {
    expect(normalizeQueryForCache("  Hello   World  ")).toBe("hello world");
  });
});

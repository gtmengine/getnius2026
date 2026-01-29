import { describe, expect, it, vi } from "vitest";

import { checkRateLimit } from "../rate-limit";

describe("rate limit", () => {
  it("blocks requests after limit is reached and resets after window", () => {
    vi.useFakeTimers();
    const opts = { limit: 2, windowMs: 1000 };
    expect(checkRateLimit("ip:test", opts).allowed).toBe(true);
    expect(checkRateLimit("ip:test", opts).allowed).toBe(true);
    expect(checkRateLimit("ip:test", opts).allowed).toBe(false);
    vi.advanceTimersByTime(1100);
    expect(checkRateLimit("ip:test", opts).allowed).toBe(true);
    vi.useRealTimers();
  });
});

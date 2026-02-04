import { describe, expect, it, vi } from "vitest";

import { getCache, setCache } from "../cache";

describe("cache", () => {
  it("returns cached values within TTL and expires after TTL", () => {
    vi.useFakeTimers();
    setCache("cache-key", "value", 50);
    expect(getCache("cache-key")).toBe("value");
    vi.advanceTimersByTime(60);
    expect(getCache("cache-key")).toBeNull();
    vi.useRealTimers();
  });

  it("avoids repeated loader calls when cache is warm", async () => {
    let calls = 0;
    const load = async () => {
      calls += 1;
      return "payload";
    };

    const key = "loader-key";
    const cached = getCache<string>(key);
    if (!cached) {
      const value = await load();
      setCache(key, value, 1000);
    }

    const cachedAgain = getCache<string>(key);
    if (!cachedAgain) {
      await load();
    }

    expect(calls).toBe(1);
  });
});

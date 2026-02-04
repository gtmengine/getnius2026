import { describe, expect, it } from "vitest";

import { resolveSearchMode } from "../search-mode";

describe("search mode", () => {
  it("defaults to google when env is unset", () => {
    expect(resolveSearchMode({ route: "/", envMode: undefined })).toBe("google");
    expect(resolveSearchMode({ route: "/app", envMode: undefined })).toBe("google");
  });

  it("uses env mode when set", () => {
    expect(resolveSearchMode({ route: "/", envMode: "mock" })).toBe("mock");
    expect(resolveSearchMode({ route: "/app", envMode: "google" })).toBe("google");
  });
});

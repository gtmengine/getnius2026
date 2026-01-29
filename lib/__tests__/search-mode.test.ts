import { describe, expect, it } from "vitest";

import { resolveSearchMode } from "../search-mode";

describe("search mode", () => {
  it("forces mock mode for /welcome routes", () => {
    expect(resolveSearchMode({ route: "/welcome", envMode: "google" })).toBe("mock");
    expect(resolveSearchMode({ route: "https://example.com/welcome", envMode: "google" })).toBe(
      "mock",
    );
  });

  it("defaults to google when env is unset for non-welcome routes", () => {
    expect(resolveSearchMode({ route: "/", envMode: undefined })).toBe("google");
  });

  it("uses env mode for non-welcome routes", () => {
    expect(resolveSearchMode({ route: "/", envMode: "mock" })).toBe("mock");
  });
});

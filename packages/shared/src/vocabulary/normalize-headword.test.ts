import { describe, expect, it } from "vitest";

import { normalizeGermanHeadword } from "./normalize-headword";

describe("normalizeGermanHeadword", () => {
  it("normalizes case and whitespace without removing German characters", () => {
    expect(normalizeGermanHeadword("  DIE   STRAẞE  ")).toBe("die straße");
  });

  it("normalizes equivalent Unicode sequences", () => {
    expect(normalizeGermanHeadword("U\u0308bung")).toBe("übung");
  });

  it("preserves umlauts and sharp s", () => {
    expect(normalizeGermanHeadword("größer heißen")).toBe("größer heißen");
  });
});

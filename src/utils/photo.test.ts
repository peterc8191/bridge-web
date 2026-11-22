import { describe, expect, it } from "vitest";
import { FALLBACK_PHOTO, photoBackground } from "./photo";
import { redirectTarget } from "./redirectTarget";

describe("photoBackground", () => {
  it("layers the fallback under the photo so it shows if the photo fails", () => {
    expect(photoBackground("https://x.com/a.jpg")).toBe(
      `url("https://x.com/a.jpg"), url("${FALLBACK_PHOTO}")`,
    );
  });

  it("uses just the fallback when there's no photo", () => {
    expect(photoBackground(undefined)).toBe(`url("${FALLBACK_PHOTO}")`);
  });
});

describe("redirectTarget", () => {
  it("returns the guarded page the user came from", () => {
    expect(redirectTarget({ from: "/issues" })).toBe("/issues");
  });

  it.each([null, undefined, {}, { from: 42 }, { from: "https://evil.com" }, { from: "//evil.com" }, { from: "/login" }])(
    "falls back to home for %j",
    (state) => {
      expect(redirectTarget(state)).toBe("/");
    },
  );
});

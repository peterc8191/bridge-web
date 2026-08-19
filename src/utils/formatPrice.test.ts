import { describe, expect, it } from "vitest";
import { formatPrice } from "./formatPrice";

describe("formatPrice", () => {
  it("formats a sale price as plain currency", () => {
    expect(formatPrice(549000, "sale")).toBe("$549,000");
  });

  it("formats a rent price with a /mo suffix", () => {
    expect(formatPrice(1650, "rent")).toBe("$1,650/mo");
  });

  it("rounds to whole dollars", () => {
    expect(formatPrice(1234.56, "sale")).toBe("$1,235");
  });
});

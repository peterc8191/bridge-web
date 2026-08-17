import { describe, expect, it } from "vitest";
import { defaultFilters, filterProperties, hasActiveFilters } from "./filterProperties";
import { properties } from "../data/properties";

describe("filterProperties", () => {
  it("returns everything when filters are default", () => {
    expect(filterProperties(properties, defaultFilters)).toHaveLength(properties.length);
  });

  it("filters by exact location match", () => {
    const target = properties[0];
    const result = filterProperties(properties, { ...defaultFilters, location: target.city });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((p) => p.city === target.city)).toBe(true);
  });

  it("filters by minimum price", () => {
    const result = filterProperties(properties, { ...defaultFilters, minPrice: 600000 });
    expect(result.every((p) => p.price >= 600000)).toBe(true);
    expect(result.length).toBeLessThan(properties.length);
  });

  it("filters by maximum price", () => {
    const result = filterProperties(properties, { ...defaultFilters, maxPrice: 400000 });
    expect(result.every((p) => p.price <= 400000)).toBe(true);
    expect(result.length).toBeLessThan(properties.length);
  });

  it("filters by minimum bedrooms", () => {
    const result = filterProperties(properties, { ...defaultFilters, minBeds: 4 });
    expect(result.every((p) => p.beds >= 4)).toBe(true);
    expect(result.length).toBeLessThan(properties.length);
  });

  it("combines multiple criteria", () => {
    const result = filterProperties(properties, {
      location: "",
      minPrice: 300000,
      maxPrice: 700000,
      minBeds: 3,
    });
    expect(
      result.every((p) => p.price >= 300000 && p.price <= 700000 && p.beds >= 3),
    ).toBe(true);
  });

  it("returns an empty list when nothing matches", () => {
    const result = filterProperties(properties, { ...defaultFilters, minPrice: 10_000_000 });
    expect(result).toHaveLength(0);
  });
});

describe("hasActiveFilters", () => {
  it("is false for default filters", () => {
    expect(hasActiveFilters(defaultFilters)).toBe(false);
  });

  it("is true when any field is set", () => {
    expect(hasActiveFilters({ ...defaultFilters, location: "Austin, TX" })).toBe(true);
    expect(hasActiveFilters({ ...defaultFilters, minPrice: 100 })).toBe(true);
    expect(hasActiveFilters({ ...defaultFilters, maxPrice: 100 })).toBe(true);
    expect(hasActiveFilters({ ...defaultFilters, minBeds: 1 })).toBe(true);
  });
});

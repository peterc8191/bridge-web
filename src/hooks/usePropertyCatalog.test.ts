import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { usePropertyCatalog } from "./usePropertyCatalog";
import { properties as seedProperties } from "../data/properties";
import type { PropertyInput } from "../types/property";

const input: PropertyInput = {
  address: "1 New Road",
  city: "Austin, TX",
  price: 450000,
  listingType: "sale",
  beds: 2,
  baths: 1,
  sqft: 900,
  description: "New listing.",
  images: ["https://example.com/new.jpg"],
  tenantEmails: [],
};

describe("usePropertyCatalog", () => {
  it("starts with exactly the seed properties, each with an owner", () => {
    const { result } = renderHook(() => usePropertyCatalog());
    expect(result.current.properties).toEqual(seedProperties);
    expect(result.current.properties.every((property) => property.ownerId)).toBe(true);
  });

  it("addProperty appends a listing owned by the given landlord and returns its id", () => {
    const { result } = renderHook(() => usePropertyCatalog());
    let id = "";
    act(() => {
      id = result.current.addProperty("landlord-1", input);
    });

    expect(id).toMatch(/^property-[0-9a-f-]{36}$/);
    expect(result.current.properties.at(-1)).toEqual({ id, ownerId: "landlord-1", ...input });
  });

  it("updateProperty edits in place and keeps the owner", () => {
    const { result } = renderHook(() => usePropertyCatalog());
    const target = seedProperties[0];
    act(() => result.current.updateProperty(target.id, { ...input, address: "Renamed" }));

    expect(result.current.properties).toHaveLength(seedProperties.length);
    expect(result.current.properties[0]).toMatchObject({
      id: target.id,
      ownerId: target.ownerId,
      address: "Renamed",
    });
  });

  it("deleteProperty removes a listing", () => {
    const { result } = renderHook(() => usePropertyCatalog());
    act(() => result.current.deleteProperty(seedProperties[0].id));
    expect(result.current.properties.find((p) => p.id === seedProperties[0].id)).toBeUndefined();
  });

  it("persists additions, edits, and deletions across hook instances", () => {
    const first = renderHook(() => usePropertyCatalog());
    let id = "";
    act(() => {
      id = first.result.current.addProperty("landlord-1", input);
      first.result.current.updateProperty(seedProperties[1].id, { ...input, address: "Edited" });
      first.result.current.deleteProperty(seedProperties[2].id);
    });
    first.unmount();

    const { result } = renderHook(() => usePropertyCatalog());
    expect(result.current.properties.find((p) => p.id === id)).toBeDefined();
    expect(result.current.properties.find((p) => p.id === seedProperties[1].id)?.address).toBe("Edited");
    expect(result.current.properties.find((p) => p.id === seedProperties[2].id)).toBeUndefined();
  });
});

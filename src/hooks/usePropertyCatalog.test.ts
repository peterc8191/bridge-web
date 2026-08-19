import { beforeEach, describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { usePropertyCatalog } from "./usePropertyCatalog";
import { properties as seedProperties } from "../data/properties";
import type { PropertyInput } from "../types/property";

const newListingInput: PropertyInput = {
  address: "9 New Build Ave",
  city: "Denver, CO",
  price: 425000,
  listingType: "sale",
  beds: 2,
  baths: 2,
  sqft: 1100,
  description: "Freshly listed condo.",
  images: ["https://example.com/new.jpg"],
};

describe("usePropertyCatalog", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts with exactly the seed properties", () => {
    const { result } = renderHook(() => usePropertyCatalog());
    expect(result.current.properties).toHaveLength(seedProperties.length);
    expect(result.current.properties.map((p) => p.id)).toEqual(seedProperties.map((p) => p.id));
  });

  it("addProperty appends a new listing and returns its id", () => {
    const { result } = renderHook(() => usePropertyCatalog());

    let newId = "";
    act(() => {
      newId = result.current.addProperty(newListingInput);
    });

    expect(result.current.properties).toHaveLength(seedProperties.length + 1);
    const created = result.current.properties.find((p) => p.id === newId);
    expect(created).toMatchObject(newListingInput);
  });

  it("updateProperty edits a seed listing in place without changing the list length", () => {
    const { result } = renderHook(() => usePropertyCatalog());
    const target = seedProperties[0];

    act(() => {
      result.current.updateProperty(target.id, { ...target, price: 999999 });
    });

    expect(result.current.properties).toHaveLength(seedProperties.length);
    const updated = result.current.properties.find((p) => p.id === target.id);
    expect(updated?.price).toBe(999999);
  });

  it("updateProperty edits a newly created listing", () => {
    const { result } = renderHook(() => usePropertyCatalog());

    let newId = "";
    act(() => {
      newId = result.current.addProperty(newListingInput);
    });
    act(() => {
      result.current.updateProperty(newId, { ...newListingInput, address: "Updated Address" });
    });

    const updated = result.current.properties.find((p) => p.id === newId);
    expect(updated?.address).toBe("Updated Address");
  });

  it("deleteProperty removes a seed listing", () => {
    const { result } = renderHook(() => usePropertyCatalog());
    const target = seedProperties[0];

    act(() => {
      result.current.deleteProperty(target.id);
    });

    expect(result.current.properties.find((p) => p.id === target.id)).toBeUndefined();
    expect(result.current.properties).toHaveLength(seedProperties.length - 1);
  });

  it("deleteProperty removes a newly created listing", () => {
    const { result } = renderHook(() => usePropertyCatalog());

    let newId = "";
    act(() => {
      newId = result.current.addProperty(newListingInput);
    });
    act(() => {
      result.current.deleteProperty(newId);
    });

    expect(result.current.properties.find((p) => p.id === newId)).toBeUndefined();
    expect(result.current.properties).toHaveLength(seedProperties.length);
  });

  it("persists additions, edits, and deletions across hook instances", () => {
    const { result, unmount } = renderHook(() => usePropertyCatalog());
    const editTarget = seedProperties[1];
    const deleteTarget = seedProperties[2];

    let newId = "";
    act(() => {
      newId = result.current.addProperty(newListingInput);
      result.current.updateProperty(editTarget.id, { ...editTarget, address: "Edited Address" });
      result.current.deleteProperty(deleteTarget.id);
    });
    unmount();

    const { result: second } = renderHook(() => usePropertyCatalog());
    expect(second.current.properties.find((p) => p.id === newId)?.address).toBe(newListingInput.address);
    expect(second.current.properties.find((p) => p.id === editTarget.id)?.address).toBe(
      "Edited Address",
    );
    expect(second.current.properties.find((p) => p.id === deleteTarget.id)).toBeUndefined();
  });
});

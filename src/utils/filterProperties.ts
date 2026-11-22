import type { Property, PropertyFilters } from "../types/property";

export const defaultFilters: PropertyFilters = {
  location: "",
  minPrice: null,
  maxPrice: null,
  minBeds: null,
  listingType: null,
};

export function countActiveFilters(filters: PropertyFilters): number {
  return [
    filters.location !== "",
    filters.minPrice != null,
    filters.maxPrice != null,
    filters.minBeds != null,
    filters.listingType != null,
  ].filter(Boolean).length;
}

export function hasActiveFilters(filters: PropertyFilters): boolean {
  return countActiveFilters(filters) > 0;
}

export function filterProperties(properties: Property[], filters: PropertyFilters): Property[] {
  // A price range is only meaningful within one listing type (sale totals vs
  // monthly rents), so it's ignored until a listing type is chosen.
  const applyPrice = filters.listingType != null;
  return properties.filter((property) => {
    if (filters.location && property.city !== filters.location) return false;
    if (applyPrice && filters.minPrice != null && property.price < filters.minPrice) return false;
    if (applyPrice && filters.maxPrice != null && property.price > filters.maxPrice) return false;
    if (filters.minBeds != null && property.beds < filters.minBeds) return false;
    if (filters.listingType != null && property.listingType !== filters.listingType) return false;
    return true;
  });
}

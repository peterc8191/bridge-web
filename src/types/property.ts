export type ListingType = "sale" | "rent";

export interface Property {
  id: string;
  address: string;
  city: string;
  price: number;
  listingType: ListingType;
  beds: number;
  baths: number;
  sqft: number;
  description: string;
  images: string[];
}

export type PropertyInput = Omit<Property, "id">;

export interface PropertyFilters {
  location: string;
  minPrice: number | null;
  maxPrice: number | null;
  minBeds: number | null;
  listingType: ListingType | null;
}

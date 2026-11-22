export type ListingType = "sale" | "rent";

export interface Property {
  id: string;
  /** Landlord account that created/owns the listing - only they can manage it. */
  ownerId: string;
  address: string;
  city: string;
  price: number;
  listingType: ListingType;
  beds: number;
  baths: number;
  sqft: number;
  description: string;
  /** Photo URLs - remote URLs or uploaded photos stored as data: URLs. */
  images: string[];
  /** Emails of tenants who can report issues on this (rental) property. */
  tenantEmails: string[];
}

export type PropertyInput = Omit<Property, "id" | "ownerId">;

export interface PropertyFilters {
  location: string;
  minPrice: number | null;
  maxPrice: number | null;
  minBeds: number | null;
  listingType: ListingType | null;
}

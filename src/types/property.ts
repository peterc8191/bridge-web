export interface Property {
  id: string;
  address: string;
  city: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  description: string;
  images: string[];
}

export interface PropertyFilters {
  location: string;
  minPrice: number | null;
  maxPrice: number | null;
  minBeds: number | null;
}

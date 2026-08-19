import type { ListingType } from "../types/property";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatPrice(price: number, listingType: ListingType): string {
  const formatted = currencyFormatter.format(price);
  return listingType === "rent" ? `${formatted}/mo` : formatted;
}

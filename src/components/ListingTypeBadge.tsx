import type { ListingType } from "../types/property";
import "./ListingTypeBadge.css";

const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  sale: "For Sale",
  rent: "For Rent",
};

interface ListingTypeBadgeProps {
  listingType: ListingType;
}

export function ListingTypeBadge({ listingType }: ListingTypeBadgeProps) {
  return (
    <span className={`listing-type-badge listing-type-badge--${listingType}`}>
      {LISTING_TYPE_LABELS[listingType]}
    </span>
  );
}

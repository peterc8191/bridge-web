import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ListingTypeBadge } from "./ListingTypeBadge";

describe("ListingTypeBadge", () => {
  it.each([
    ["sale", "For Sale"],
    ["rent", "For Rent"],
  ] as const)("renders the label for listing type '%s'", (listingType, label) => {
    render(<ListingTypeBadge listingType={listingType} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});

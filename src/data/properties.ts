import type { Property } from "../types/property";

// Mock listing data. Images are deterministic Picsum placeholders (seeded by id)
// so there's no backend/API dependency for this prototype.
const listing = (
  id: string,
  address: string,
  city: string,
  price: number,
  beds: number,
  baths: number,
  sqft: number,
  description: string,
): Property => ({
  id,
  address,
  city,
  price,
  beds,
  baths,
  sqft,
  description,
  images: ["a", "b", "c", "d"].map(
    (variant) => `https://picsum.photos/seed/${id}-${variant}/900/1200`,
  ),
});

export const properties: Property[] = [
  listing("p1", "142 Maple Street", "Portland, OR", 549000, 3, 2, 1650, "Bright craftsman bungalow with a rebuilt kitchen and a deep backyard."),
  listing("p2", "88 Riverside Ave", "Austin, TX", 675000, 4, 3, 2400, "Modern build near the greenbelt with an open-plan living area."),
  listing("p3", "27 Elm Court", "Denver, CO", 415000, 2, 1, 1050, "Cozy starter home minutes from downtown with mountain views."),
  listing("p4", "5 Harbor View", "Seattle, WA", 890000, 3, 2, 1800, "Waterfront-adjacent condo with a private balcony and parking."),
  listing("p5", "310 Pine Ridge Rd", "Asheville, NC", 389000, 3, 2, 1500, "Mountain retreat on a wooded half-acre lot, fully renovated."),
  listing("p6", "19 Sunset Blvd", "San Diego, CA", 1050000, 4, 3, 2650, "Coastal-style home with a pool and an oversized two-car garage."),
  listing("p7", "64 Birchwood Ln", "Minneapolis, MN", 329000, 3, 1, 1400, "Classic two-story near the lakes with a finished basement."),
  listing("p8", "901 Fifth Ave", "Chicago, IL", 720000, 2, 2, 1300, "High-floor city condo with skyline views and in-unit laundry."),
  listing("p9", "12 Orchard Way", "Boise, ID", 459000, 4, 2, 2100, "Family home on a cul-de-sac with a fenced yard and new roof."),
  listing("p10", "245 Bayshore Dr", "Tampa, FL", 615000, 3, 2, 1900, "Single-story near the bay with a screened lanai and updated HVAC."),
  listing("p11", "77 Cedar Hollow", "Nashville, TN", 499000, 3, 2, 1750, "Renovated ranch close to downtown with a large covered porch."),
  listing("p12", "3 Lakeview Terrace", "Madison, WI", 375000, 2, 1, 1150, "Lake-adjacent cottage with a dock and updated electrical."),
];

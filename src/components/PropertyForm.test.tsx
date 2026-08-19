import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PropertyForm } from "./PropertyForm";
import type { Property } from "../types/property";

const existingProperty: Property = {
  id: "p1",
  address: "142 Maple Street",
  city: "Portland, OR",
  price: 549000,
  listingType: "sale",
  beds: 3,
  baths: 2,
  sqft: 1650,
  description: "A house.",
  images: ["https://example.com/1.jpg", "https://example.com/2.jpg"],
};

const existingRental: Property = {
  ...existingProperty,
  id: "p3",
  listingType: "rent",
  price: 1650,
};

async function fillValidForm() {
  await userEvent.type(screen.getByLabelText(/address/i), "9 New Build Ave");
  await userEvent.type(screen.getByLabelText(/city/i), "Denver, CO");
  await userEvent.type(screen.getByLabelText(/price/i), "425000");
  await userEvent.type(screen.getByLabelText(/sqft/i), "1100");
  await userEvent.type(screen.getByLabelText(/beds/i), "2");
  await userEvent.type(screen.getByLabelText(/baths/i), "2");
  await userEvent.type(screen.getByLabelText(/description/i), "Freshly listed condo.");
  await userEvent.type(screen.getByLabelText(/photo urls/i), "https://example.com/new.jpg");
}

describe("PropertyForm", () => {
  it("submits a fully-filled new listing with parsed numbers, image list, and defaults to 'sale'", async () => {
    const onSubmit = vi.fn();
    render(<PropertyForm onSubmit={onSubmit} submitLabel="Create listing" />);

    await fillValidForm();
    await userEvent.click(screen.getByRole("button", { name: /create listing/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      address: "9 New Build Ave",
      city: "Denver, CO",
      listingType: "sale",
      price: 425000,
      beds: 2,
      baths: 2,
      sqft: 1100,
      description: "Freshly listed condo.",
      images: ["https://example.com/new.jpg"],
    });
  });

  it("splits multiple photo URLs on separate lines", async () => {
    const onSubmit = vi.fn();
    render(<PropertyForm onSubmit={onSubmit} submitLabel="Create listing" />);

    await fillValidForm();
    await userEvent.clear(screen.getByLabelText(/photo urls/i));
    await userEvent.type(
      screen.getByLabelText(/photo urls/i),
      "https://example.com/a.jpg{Enter}https://example.com/b.jpg",
    );
    await userEvent.click(screen.getByRole("button", { name: /create listing/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ images: ["https://example.com/a.jpg", "https://example.com/b.jpg"] }),
    );
  });

  it("pre-fills fields from an existing property when editing", () => {
    render(
      <PropertyForm initialProperty={existingProperty} onSubmit={vi.fn()} submitLabel="Save changes" />,
    );

    expect(screen.getByLabelText(/address/i)).toHaveValue(existingProperty.address);
    expect(screen.getByLabelText(/city/i)).toHaveValue(existingProperty.city);
    expect(screen.getByLabelText(/listing type/i)).toHaveValue("sale");
    expect(screen.getByLabelText(/price/i)).toHaveValue(existingProperty.price);
    expect(screen.getByLabelText(/photo urls/i)).toHaveValue(existingProperty.images.join("\n"));
  });

  it("rejects submission without at least one photo URL", async () => {
    const onSubmit = vi.fn();
    render(<PropertyForm onSubmit={onSubmit} submitLabel="Create listing" />);

    await userEvent.type(screen.getByLabelText(/address/i), "9 New Build Ave");
    await userEvent.type(screen.getByLabelText(/city/i), "Denver, CO");
    await userEvent.type(screen.getByLabelText(/price/i), "425000");
    await userEvent.type(screen.getByLabelText(/sqft/i), "1100");
    await userEvent.type(screen.getByLabelText(/beds/i), "2");
    await userEvent.type(screen.getByLabelText(/baths/i), "2");
    await userEvent.type(screen.getByLabelText(/description/i), "Freshly listed condo.");
    await userEvent.click(screen.getByRole("button", { name: /create listing/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/photo url/i);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("rejects a zero price", async () => {
    const onSubmit = vi.fn();
    render(<PropertyForm onSubmit={onSubmit} submitLabel="Create listing" />);

    await fillValidForm();
    await userEvent.clear(screen.getByLabelText(/price/i));
    await userEvent.type(screen.getByLabelText(/price/i), "0");
    await userEvent.click(screen.getByRole("button", { name: /create listing/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/valid price/i);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  describe("listing type", () => {
    it("defaults to 'For Sale' with a 'Price ($)' label for a new listing", () => {
      render(<PropertyForm onSubmit={vi.fn()} submitLabel="Create listing" />);
      expect(screen.getByLabelText(/listing type/i)).toHaveValue("sale");
      expect(screen.getByText("Price ($)")).toBeInTheDocument();
    });

    it("switches the price field label to 'Monthly rent ($)' when Rent is selected", async () => {
      render(<PropertyForm onSubmit={vi.fn()} submitLabel="Create listing" />);
      await userEvent.selectOptions(screen.getByLabelText(/listing type/i), "rent");
      expect(screen.getByText("Monthly rent ($)")).toBeInTheDocument();
    });

    it("pre-fills the listing type and price label from an existing rental", () => {
      render(<PropertyForm initialProperty={existingRental} onSubmit={vi.fn()} submitLabel="Save changes" />);
      expect(screen.getByLabelText(/listing type/i)).toHaveValue("rent");
      expect(screen.getByText("Monthly rent ($)")).toBeInTheDocument();
      expect(screen.getByLabelText(/monthly rent/i)).toHaveValue(existingRental.price);
    });

    it("submits the selected listing type", async () => {
      const onSubmit = vi.fn();
      render(<PropertyForm onSubmit={onSubmit} submitLabel="Create listing" />);

      // Fill in while the label still reads "Price ($)", then switch to Rent -
      // the price field's label text changes with listingType, so filling it
      // after switching would break the "price" label lookup.
      await fillValidForm();
      await userEvent.selectOptions(screen.getByLabelText(/listing type/i), "rent");
      await userEvent.click(screen.getByRole("button", { name: /create listing/i }));

      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ listingType: "rent" }));
    });
  });
});

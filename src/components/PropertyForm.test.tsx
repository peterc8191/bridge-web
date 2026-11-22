import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PropertyForm } from "./PropertyForm";
import type { Property } from "../types/property";
import { makeProperty } from "../test/fixtures";

const existingProperty: Property = makeProperty({ description: "A house." });

const existingRental: Property = {
  ...existingProperty,
  id: "p3",
  listingType: "rent",
  price: 1650,
  tenantEmails: ["tenant@test.com"],
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
      tenantEmails: [],
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

  it("rejects submission without at least one photo", async () => {
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

    expect(await screen.findByRole("alert")).toHaveTextContent(/at least one photo/i);
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

  describe("photo uploads", () => {
    const fakeRead = vi.fn(async (file: File) => `data:image/jpeg;base64,${file.name}`);
    const file = (name: string) => new File(["x"], name, { type: "image/jpeg" });

    it("adds uploaded photos (after any URLs) to the submitted images", async () => {
      const onSubmit = vi.fn();
      render(<PropertyForm onSubmit={onSubmit} submitLabel="Create listing" readImage={fakeRead} />);

      await fillValidForm();
      await userEvent.upload(screen.getByLabelText(/upload photos/i), [file("a.jpg"), file("b.jpg")]);
      expect(await screen.findAllByRole("button", { name: /remove uploaded photo/i })).toHaveLength(2);

      await userEvent.click(screen.getByRole("button", { name: /create listing/i }));
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          images: ["https://example.com/new.jpg", "data:image/jpeg;base64,a.jpg", "data:image/jpeg;base64,b.jpg"],
        }),
      );
    });

    it("accepts a listing with only uploaded photos", async () => {
      const onSubmit = vi.fn();
      render(<PropertyForm onSubmit={onSubmit} submitLabel="Create listing" readImage={fakeRead} />);

      await fillValidForm();
      await userEvent.clear(screen.getByLabelText(/photo urls/i));
      await userEvent.upload(screen.getByLabelText(/upload photos/i), file("only.jpg"));
      await screen.findByRole("button", { name: /remove uploaded photo 1/i });
      await userEvent.click(screen.getByRole("button", { name: /create listing/i }));

      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ images: ["data:image/jpeg;base64,only.jpg"] }));
    });

    it("removes an uploaded photo", async () => {
      render(<PropertyForm onSubmit={vi.fn()} submitLabel="Create listing" readImage={fakeRead} />);
      await userEvent.upload(screen.getByLabelText(/upload photos/i), file("a.jpg"));
      await userEvent.click(await screen.findByRole("button", { name: /remove uploaded photo 1/i }));
      expect(screen.queryByTestId("uploaded-photos")).not.toBeInTheDocument();
    });

    it("keeps existing uploaded photos separate from URLs when editing", () => {
      const withUpload = { ...existingProperty, images: ["https://example.com/1.jpg", "data:image/jpeg;base64,x"] };
      render(<PropertyForm initialProperty={withUpload} onSubmit={vi.fn()} submitLabel="Save" readImage={fakeRead} />);
      expect(screen.getByLabelText(/photo urls/i)).toHaveValue("https://example.com/1.jpg");
      expect(screen.getAllByRole("button", { name: /remove uploaded photo/i })).toHaveLength(1);
    });

    it("refuses more uploads than the per-listing cap", async () => {
      render(<PropertyForm onSubmit={vi.fn()} submitLabel="Create listing" readImage={fakeRead} />);
      const files = Array.from({ length: 7 }, (_, i) => file(`${i}.jpg`));
      await userEvent.upload(screen.getByLabelText(/upload photos/i), files);
      expect(await screen.findByRole("alert")).toHaveTextContent(/up to 6 photos/i);
      expect(screen.queryByTestId("uploaded-photos")).not.toBeInTheDocument();
    });

    it("shows an error when a photo can't be read", async () => {
      const failingRead = vi.fn(async () => {
        throw new Error("bad.jpg isn't an image.");
      });
      render(<PropertyForm onSubmit={vi.fn()} submitLabel="Create listing" readImage={failingRead} />);
      await userEvent.upload(screen.getByLabelText(/upload photos/i), file("bad.jpg"));
      expect(await screen.findByRole("alert")).toHaveTextContent("bad.jpg isn't an image.");
    });
  });

  describe("tenants", () => {
    it("only offers tenant emails for rentals", async () => {
      render(<PropertyForm onSubmit={vi.fn()} submitLabel="Create listing" />);
      expect(screen.queryByLabelText(/tenant emails/i)).not.toBeInTheDocument();
      await userEvent.selectOptions(screen.getByLabelText(/listing type/i), "rent");
      expect(screen.getByLabelText(/tenant emails/i)).toBeInTheDocument();
    });

    it("pre-fills and submits lower-cased tenant emails", async () => {
      const onSubmit = vi.fn();
      render(<PropertyForm initialProperty={existingRental} onSubmit={onSubmit} submitLabel="Save" />);
      expect(screen.getByLabelText(/tenant emails/i)).toHaveValue("tenant@test.com");

      await userEvent.type(screen.getByLabelText(/tenant emails/i), "{Enter}Second@Test.com");
      await userEvent.click(screen.getByRole("button", { name: /save/i }));

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ tenantEmails: ["tenant@test.com", "second@test.com"] }),
      );
    });

    it("rejects an invalid tenant email", async () => {
      const onSubmit = vi.fn();
      render(<PropertyForm initialProperty={existingRental} onSubmit={onSubmit} submitLabel="Save" />);
      await userEvent.type(screen.getByLabelText(/tenant emails/i), "{Enter}not-an-email");
      await userEvent.click(screen.getByRole("button", { name: /save/i }));

      expect(await screen.findByRole("alert")).toHaveTextContent(/not-an-email/);
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("drops tenants when a rental is switched to a sale", async () => {
      const onSubmit = vi.fn();
      render(<PropertyForm initialProperty={existingRental} onSubmit={onSubmit} submitLabel="Save" />);
      await userEvent.selectOptions(screen.getByLabelText(/listing type/i), "sale");
      await userEvent.click(screen.getByRole("button", { name: /save/i }));
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ tenantEmails: [] }));
    });
  });
});

import { useState, type FormEvent } from "react";
import type { ListingType, Property, PropertyInput } from "../types/property";
import "./PropertyForm.css";

const LISTING_TYPE_OPTIONS: { value: ListingType; label: string }[] = [
  { value: "sale", label: "For Sale" },
  { value: "rent", label: "For Rent" },
];

interface PropertyFormProps {
  initialProperty?: Property;
  onSubmit: (input: PropertyInput) => void;
  submitLabel: string;
}

export function PropertyForm({ initialProperty, onSubmit, submitLabel }: PropertyFormProps) {
  const [address, setAddress] = useState(initialProperty?.address ?? "");
  const [city, setCity] = useState(initialProperty?.city ?? "");
  const [listingType, setListingType] = useState<ListingType>(initialProperty?.listingType ?? "sale");
  const [price, setPrice] = useState(initialProperty ? String(initialProperty.price) : "");
  const [beds, setBeds] = useState(initialProperty ? String(initialProperty.beds) : "");
  const [baths, setBaths] = useState(initialProperty ? String(initialProperty.baths) : "");
  const [sqft, setSqft] = useState(initialProperty ? String(initialProperty.sqft) : "");
  const [description, setDescription] = useState(initialProperty?.description ?? "");
  const [imagesText, setImagesText] = useState(initialProperty?.images.join("\n") ?? "");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const images = imagesText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (!address.trim() || !city.trim() || !description.trim()) {
      setError("Address, city, and description are required.");
      return;
    }
    if (images.length === 0) {
      setError("Add at least one photo URL.");
      return;
    }

    const priceNumber = Number(price);
    const bedsNumber = Number(beds);
    const bathsNumber = Number(baths);
    const sqftNumber = Number(sqft);

    if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
      setError(listingType === "rent" ? "Enter a valid monthly rent." : "Enter a valid price.");
      return;
    }
    if (!Number.isFinite(bedsNumber) || bedsNumber < 0) {
      setError("Enter a valid number of bedrooms.");
      return;
    }
    if (!Number.isFinite(bathsNumber) || bathsNumber < 0) {
      setError("Enter a valid number of bathrooms.");
      return;
    }
    if (!Number.isFinite(sqftNumber) || sqftNumber <= 0) {
      setError("Enter a valid square footage.");
      return;
    }

    onSubmit({
      address: address.trim(),
      city: city.trim(),
      listingType,
      price: priceNumber,
      beds: bedsNumber,
      baths: bathsNumber,
      sqft: sqftNumber,
      description: description.trim(),
      images,
    });
  };

  return (
    <form className="property-form" onSubmit={handleSubmit} data-testid="property-form">
      <label className="property-form__field">
        <span>Address</span>
        <input type="text" value={address} onChange={(event) => setAddress(event.target.value)} required />
      </label>

      <label className="property-form__field">
        <span>City</span>
        <input type="text" value={city} onChange={(event) => setCity(event.target.value)} required />
      </label>

      <label className="property-form__field">
        <span>Listing type</span>
        <select value={listingType} onChange={(event) => setListingType(event.target.value as ListingType)}>
          {LISTING_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <div className="property-form__row">
        <label className="property-form__field">
          <span>{listingType === "rent" ? "Monthly rent ($)" : "Price ($)"}</span>
          <input
            type="number"
            min={0}
            step={listingType === "rent" ? 50 : 1000}
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            required
          />
        </label>
        <label className="property-form__field">
          <span>Sqft</span>
          <input type="number" min={0} value={sqft} onChange={(event) => setSqft(event.target.value)} required />
        </label>
      </div>

      <div className="property-form__row">
        <label className="property-form__field">
          <span>Beds</span>
          <input type="number" min={0} value={beds} onChange={(event) => setBeds(event.target.value)} required />
        </label>
        <label className="property-form__field">
          <span>Baths</span>
          <input type="number" min={0} value={baths} onChange={(event) => setBaths(event.target.value)} required />
        </label>
      </div>

      <label className="property-form__field">
        <span>Description</span>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          required
        />
      </label>

      <label className="property-form__field">
        <span>Photo URLs (one per line)</span>
        <textarea
          value={imagesText}
          onChange={(event) => setImagesText(event.target.value)}
          rows={3}
          placeholder="https://..."
        />
      </label>

      {error && (
        <p className="property-form__error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="property-form__submit">
        {submitLabel}
      </button>
    </form>
  );
}

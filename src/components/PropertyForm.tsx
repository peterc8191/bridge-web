import { useState, type ChangeEvent, type FormEvent } from "react";
import type { ListingType, Property, PropertyInput } from "../types/property";
import { imageFileToDataUrl } from "../utils/imageFile";
import { photoBackground } from "../utils/photo";
import "./PropertyForm.css";

const LISTING_TYPE_OPTIONS: { value: ListingType; label: string }[] = [
  { value: "sale", label: "For Sale" },
  { value: "rent", label: "For Rent" },
];

export const MAX_UPLOADED_PHOTOS = 6;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

const isUpload = (image: string) => image.startsWith("data:");

interface PropertyFormProps {
  initialProperty?: Property;
  onSubmit: (input: PropertyInput) => void;
  submitLabel: string;
  /** Injectable for tests (jsdom has no canvas). */
  readImage?: (file: File) => Promise<string>;
}

export function PropertyForm({
  initialProperty,
  onSubmit,
  submitLabel,
  readImage = imageFileToDataUrl,
}: PropertyFormProps) {
  const [address, setAddress] = useState(initialProperty?.address ?? "");
  const [city, setCity] = useState(initialProperty?.city ?? "");
  const [listingType, setListingType] = useState<ListingType>(initialProperty?.listingType ?? "sale");
  const [price, setPrice] = useState(initialProperty ? String(initialProperty.price) : "");
  const [beds, setBeds] = useState(initialProperty ? String(initialProperty.beds) : "");
  const [baths, setBaths] = useState(initialProperty ? String(initialProperty.baths) : "");
  const [sqft, setSqft] = useState(initialProperty ? String(initialProperty.sqft) : "");
  const [description, setDescription] = useState(initialProperty?.description ?? "");
  const [imagesText, setImagesText] = useState(
    initialProperty?.images.filter((image) => !isUpload(image)).join("\n") ?? "",
  );
  const [uploads, setUploads] = useState<string[]>(
    initialProperty?.images.filter(isUpload) ?? [],
  );
  const [uploading, setUploading] = useState(false);
  const [tenantsText, setTenantsText] = useState(initialProperty?.tenantEmails.join("\n") ?? "");
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    const room = MAX_UPLOADED_PHOTOS - uploads.length;
    if (files.length > room) {
      setError(`You can upload up to ${MAX_UPLOADED_PHOTOS} photos per listing.`);
      return;
    }

    setError(null);
    setUploading(true);
    try {
      const dataUrls = await Promise.all(files.map(readImage));
      setUploads((prev) => [...prev, ...dataUrls]);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Couldn't read that photo.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const images = [...parseLines(imagesText), ...uploads];
    const tenantEmails = listingType === "rent" ? parseLines(tenantsText).map((e) => e.toLowerCase()) : [];

    if (!address.trim() || !city.trim() || !description.trim()) {
      setError("Address, city, and description are required.");
      return;
    }
    if (images.length === 0) {
      setError("Add at least one photo (upload one or paste a URL).");
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
    const badEmail = tenantEmails.find((email) => !EMAIL_PATTERN.test(email));
    if (badEmail) {
      setError(`"${badEmail}" isn't a valid tenant email.`);
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
      tenantEmails,
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
        <input
          type="text"
          value={city}
          onChange={(event) => setCity(event.target.value)}
          placeholder="Portland, OR"
          required
        />
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
            step="any"
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

      <fieldset className="property-form__photos">
        <legend>Photos</legend>
        {uploads.length > 0 && (
          <ul className="property-form__uploads" data-testid="uploaded-photos">
            {uploads.map((image, index) => (
              <li key={index} className="property-form__upload">
                <span
                  className="property-form__upload-thumb"
                  style={{ backgroundImage: photoBackground(image) }}
                />
                <button
                  type="button"
                  className="property-form__upload-remove"
                  aria-label={`Remove uploaded photo ${index + 1}`}
                  onClick={() => setUploads((prev) => prev.filter((_, i) => i !== index))}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
        <label className="property-form__field">
          <span>
            Upload photos ({uploads.length}/{MAX_UPLOADED_PHOTOS})
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFiles}
            disabled={uploading || uploads.length >= MAX_UPLOADED_PHOTOS}
          />
        </label>
        {uploading && <p className="property-form__hint">Processing photos…</p>}
        <label className="property-form__field">
          <span>Photo URLs (one per line)</span>
          <textarea
            value={imagesText}
            onChange={(event) => setImagesText(event.target.value)}
            rows={3}
            placeholder="https://..."
          />
        </label>
      </fieldset>

      {listingType === "rent" && (
        <label className="property-form__field">
          <span>Tenant emails (one per line)</span>
          <textarea
            value={tenantsText}
            onChange={(event) => setTenantsText(event.target.value)}
            rows={2}
            placeholder="tenant@example.com"
          />
          <small className="property-form__hint">
            Tenants can report maintenance issues on this property.
          </small>
        </label>
      )}

      {error && (
        <p className="property-form__error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="property-form__submit" disabled={uploading}>
        {submitLabel}
      </button>
    </form>
  );
}

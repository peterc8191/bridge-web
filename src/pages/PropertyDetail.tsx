import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { properties } from "../data/properties";
import type { NewViewingInput, ViewingRequest } from "../types/viewing";
import { ViewingForm } from "../components/ViewingForm";
import { ViewingList } from "../components/ViewingList";
import "./PropertyDetail.css";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

interface PropertyDetailProps {
  viewings: ViewingRequest[];
  onScheduleViewing: (input: NewViewingInput) => void;
}

export function PropertyDetail({ viewings, onScheduleViewing }: PropertyDetailProps) {
  const { id } = useParams<{ id: string }>();
  const property = properties.find((candidate) => candidate.id === id);
  const [activeImage, setActiveImage] = useState(0);

  if (!property) {
    return (
      <main className="property-detail property-detail--not-found" data-testid="property-not-found">
        <p>We couldn't find that listing.</p>
        <Link to="/saved">Back to Saved</Link>
      </main>
    );
  }

  const propertyViewings = viewings.filter((viewing) => viewing.propertyId === property.id);

  return (
    <main className="property-detail">
      <Link to="/saved" className="property-detail__back">
        ← Back to Saved
      </Link>

      <div
        className="property-detail__hero"
        data-testid="property-detail-hero"
        style={{ backgroundImage: `url(${property.images[activeImage]})` }}
      />

      {property.images.length > 1 && (
        <div className="property-detail__thumbs">
          {property.images.map((image, index) => (
            <button
              key={image}
              type="button"
              className={
                index === activeImage
                  ? "property-detail__thumb property-detail__thumb--active"
                  : "property-detail__thumb"
              }
              style={{ backgroundImage: `url(${image})` }}
              aria-label={`Show photo ${index + 1}`}
              onClick={() => setActiveImage(index)}
            />
          ))}
        </div>
      )}

      <div className="property-detail__info">
        <h1>{property.address}</h1>
        <p className="property-detail__city">{property.city}</p>
        <p className="property-detail__price">{currency.format(property.price)}</p>
        <p className="property-detail__specs">
          {property.beds} bed · {property.baths} bath · {property.sqft.toLocaleString()} sqft
        </p>
        <p className="property-detail__description">{property.description}</p>
      </div>

      <section className="property-detail__section">
        <h2>Arrange a viewing</h2>
        <ViewingList viewings={propertyViewings} />
        <ViewingForm propertyId={property.id} onSubmit={onScheduleViewing} />
      </section>
    </main>
  );
}

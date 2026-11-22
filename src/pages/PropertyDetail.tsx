import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ViewingForm } from "../components/ViewingForm";
import { ViewingList } from "../components/ViewingList";
import { ListingTypeBadge } from "../components/ListingTypeBadge";
import { useAppData } from "../context/appDataContext";
import { ownsProperty } from "../lib/permissions";
import { formatPrice } from "../utils/formatPrice";
import { photoBackground } from "../utils/photo";
import "./PropertyDetail.css";

export function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { propertyById, viewings, currentUser, scheduleViewing, cancelViewing } = useAppData();
  const property = id ? propertyById.get(id) : undefined;
  const [activeImage, setActiveImage] = useState(0);

  if (!property) {
    return (
      <main className="property-detail property-detail--not-found" data-testid="property-not-found">
        <p>We couldn't find that listing.</p>
        <Link to="/saved">Back to Saved</Link>
      </main>
    );
  }

  const isOwner = ownsProperty(currentUser, property);
  const myViewings = viewings.filter(
    (viewing) => viewing.propertyId === property.id && viewing.requesterId === currentUser?.id,
  );

  return (
    <main className="property-detail">
      <Link to="/saved" className="property-detail__back">
        ← Back to Saved
      </Link>

      <div
        className="property-detail__hero"
        data-testid="property-detail-hero"
        style={{ backgroundImage: photoBackground(property.images[activeImage]) }}
      />

      {property.images.length > 1 && (
        <div className="property-detail__thumbs">
          {property.images.map((image, index) => (
            <button
              key={`${index}-${image.slice(0, 64)}`}
              type="button"
              className={
                index === activeImage
                  ? "property-detail__thumb property-detail__thumb--active"
                  : "property-detail__thumb"
              }
              style={{ backgroundImage: photoBackground(image) }}
              aria-label={`Show photo ${index + 1}`}
              onClick={() => setActiveImage(index)}
            />
          ))}
        </div>
      )}

      <div className="property-detail__info">
        <h1>{property.address}</h1>
        <p className="property-detail__city">{property.city}</p>
        <div className="property-detail__price-row">
          <span className="property-detail__price">
            {formatPrice(property.price, property.listingType)}
          </span>
          <ListingTypeBadge listingType={property.listingType} />
        </div>
        <p className="property-detail__specs">
          {property.beds} bed · {property.baths} bath · {property.sqft.toLocaleString()} sqft
        </p>
        <p className="property-detail__description">{property.description}</p>
        {isOwner && (
          <p className="property-detail__owner-note">
            This is your listing. <Link to={`/manage-listings/${property.id}/edit`}>Edit listing</Link>{" "}
            · <Link to="/viewings">See viewing requests</Link>
          </p>
        )}
      </div>

      {!isOwner && (
        <section className="property-detail__section">
          <h2>Arrange a viewing</h2>
          {currentUser ? (
            <>
              <ViewingList viewings={myViewings} onCancel={cancelViewing} />
              <ViewingForm propertyId={property.id} onSubmit={scheduleViewing} />
            </>
          ) : (
            <p className="property-detail__login-hint" data-testid="viewing-login-hint">
              <Link to="/login" state={{ from: location.pathname }}>
                Log in
              </Link>{" "}
              to arrange a viewing.
            </p>
          )}
        </section>
      )}
    </main>
  );
}

import { Link } from "react-router-dom";
import type { Property } from "../types/property";
import { ListingTypeBadge } from "../components/ListingTypeBadge";
import { formatPrice } from "../utils/formatPrice";
import "./Saved.css";

interface SavedProps {
  saved: Property[];
  onRemove: (propertyId: string) => void;
}

export function Saved({ saved, onRemove }: SavedProps) {
  if (saved.length === 0) {
    return (
      <main className="saved-page saved-page--empty">
        <p>No saved properties yet.</p>
        <p className="saved-page__hint">Swipe right on a listing in Discover to save it here.</p>
      </main>
    );
  }

  return (
    <main className="saved-page">
      <ul className="saved-list" data-testid="saved-list">
        {saved.map((property) => (
          <li key={property.id} className="saved-list__item">
            <Link to={`/property/${property.id}`} className="saved-list__link">
              <div
                className="saved-list__thumb"
                style={{ backgroundImage: `url(${property.images[0]})` }}
              />
              <div className="saved-list__body">
                <h3>{property.address}</h3>
                <p className="saved-list__city">{property.city}</p>
                <div className="saved-list__price-row">
                  <span className="saved-list__price">
                    {formatPrice(property.price, property.listingType)}
                  </span>
                  <ListingTypeBadge listingType={property.listingType} />
                </div>
                <p className="saved-list__specs">
                  {property.beds} bed · {property.baths} bath · {property.sqft.toLocaleString()} sqft
                </p>
              </div>
            </Link>
            <button
              type="button"
              className="saved-list__remove"
              onClick={() => onRemove(property.id)}
              aria-label={`Remove ${property.address} from saved`}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}

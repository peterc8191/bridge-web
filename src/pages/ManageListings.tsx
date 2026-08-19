import { Link, Navigate } from "react-router-dom";
import type { Property } from "../types/property";
import type { AuthUser } from "../types/auth";
import { ListingTypeBadge } from "../components/ListingTypeBadge";
import { formatPrice } from "../utils/formatPrice";
import "./ManageListings.css";

interface ManageListingsProps {
  currentUser: AuthUser | null;
  properties: Property[];
  onDeleteProperty: (id: string) => void;
}

export function ManageListings({ currentUser, properties, onDeleteProperty }: ManageListingsProps) {
  if (currentUser?.role !== "landlord") {
    return <Navigate to="/" replace />;
  }

  const handleDelete = (property: Property) => {
    if (window.confirm(`Delete ${property.address}? This can't be undone.`)) {
      onDeleteProperty(property.id);
    }
  };

  return (
    <main className="manage-listings">
      <div className="manage-listings__header">
        <h1>Manage listings</h1>
        <Link to="/manage-listings/new" className="manage-listings__add-btn">
          Add new listing
        </Link>
      </div>

      {properties.length === 0 ? (
        <p className="manage-listings__empty">No listings yet.</p>
      ) : (
        <ul className="manage-listings__list" data-testid="manage-listings-list">
          {properties.map((property) => (
            <li key={property.id} className="manage-listings__item">
              <div className="manage-listings__info">
                <span className="manage-listings__address-row">
                  <span className="manage-listings__address">{property.address}</span>
                  <ListingTypeBadge listingType={property.listingType} />
                </span>
                <span className="manage-listings__meta">
                  {property.city} · {formatPrice(property.price, property.listingType)}
                </span>
              </div>
              <div className="manage-listings__actions">
                <Link to={`/manage-listings/${property.id}/edit`} className="manage-listings__edit-btn">
                  Edit
                </Link>
                <button
                  type="button"
                  className="manage-listings__delete-btn"
                  onClick={() => handleDelete(property)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

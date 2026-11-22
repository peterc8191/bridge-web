import { Navigate, useNavigate, useParams } from "react-router-dom";
import type { PropertyInput } from "../types/property";
import { PropertyForm } from "../components/PropertyForm";
import { useAppData } from "../context/appDataContext";
import "./PropertyFormPage.css";

// Landlord-only (guarded in App.tsx). Editing is limited to the landlord's own listings.
export function PropertyFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { myListings, addProperty, updateProperty } = useAppData();

  const existingProperty = id ? myListings.find((property) => property.id === id) : undefined;

  if (id && !existingProperty) {
    return <Navigate to="/manage-listings" replace />;
  }

  const handleSubmit = (input: PropertyInput) => {
    if (existingProperty) {
      updateProperty(existingProperty.id, input);
      navigate(`/property/${existingProperty.id}`);
    } else {
      const newId = addProperty(input);
      if (newId) navigate(`/property/${newId}`);
    }
  };

  return (
    <main className="property-form-page">
      <h1>{existingProperty ? "Edit listing" : "Add new listing"}</h1>
      <PropertyForm
        initialProperty={existingProperty}
        onSubmit={handleSubmit}
        submitLabel={existingProperty ? "Save changes" : "Create listing"}
      />
    </main>
  );
}

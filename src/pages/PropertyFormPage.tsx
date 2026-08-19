import { Navigate, useNavigate, useParams } from "react-router-dom";
import type { Property, PropertyInput } from "../types/property";
import type { AuthUser } from "../types/auth";
import { PropertyForm } from "../components/PropertyForm";
import "./PropertyFormPage.css";

interface PropertyFormPageProps {
  currentUser: AuthUser | null;
  properties: Property[];
  onAddProperty: (input: PropertyInput) => string;
  onUpdateProperty: (id: string, input: PropertyInput) => void;
}

export function PropertyFormPage({
  currentUser,
  properties,
  onAddProperty,
  onUpdateProperty,
}: PropertyFormPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (currentUser?.role !== "landlord") {
    return <Navigate to="/" replace />;
  }

  const existingProperty = id ? properties.find((property) => property.id === id) : undefined;

  if (id && !existingProperty) {
    return <Navigate to="/manage-listings" replace />;
  }

  const handleSubmit = (input: PropertyInput) => {
    if (existingProperty) {
      onUpdateProperty(existingProperty.id, input);
      navigate(`/property/${existingProperty.id}`);
    } else {
      const newId = onAddProperty(input);
      navigate(`/property/${newId}`);
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

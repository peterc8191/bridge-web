import { useCallback } from "react";
import { properties as seedProperties } from "../data/properties";
import { newId, storageKey } from "../lib/storage";
import type { Property, PropertyInput } from "../types/property";
import { useStoredState } from "./useStoredState";

export const PROPERTIES_KEY = storageKey("properties");

/** The live listing catalog every screen reads from (seeded on first load). */
export function usePropertyCatalog() {
  const [properties, setProperties] = useStoredState<Property[]>(PROPERTIES_KEY, seedProperties);

  const addProperty = useCallback(
    (ownerId: string, input: PropertyInput) => {
      const property: Property = { id: newId("property"), ownerId, ...input };
      setProperties((prev) => [...prev, property]);
      return property.id;
    },
    [setProperties],
  );

  const updateProperty = useCallback(
    (id: string, input: PropertyInput) => {
      setProperties((prev) =>
        prev.map((property) => (property.id === id ? { ...property, ...input, id } : property)),
      );
    },
    [setProperties],
  );

  const deleteProperty = useCallback(
    (id: string) => {
      setProperties((prev) => prev.filter((property) => property.id !== id));
    },
    [setProperties],
  );

  return { properties, addProperty, updateProperty, deleteProperty };
}

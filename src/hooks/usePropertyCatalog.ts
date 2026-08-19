import { useCallback, useMemo, useState } from "react";
import { properties as seedProperties } from "../data/properties";
import type { Property, PropertyInput } from "../types/property";

const OVERRIDES_KEY = "bridge:property-overrides";
const DELETED_KEY = "bridge:deleted-property-ids";

let propertySequence = 0;
function generatePropertyId(): string {
  propertySequence += 1;
  return `property-new-${propertySequence}`;
}

function readOverrides(): Record<string, Property> {
  try {
    const raw = localStorage.getItem(OVERRIDES_KEY);
    return raw ? (JSON.parse(raw) as Record<string, Property>) : {};
  } catch {
    return {};
  }
}

function writeOverrides(overrides: Record<string, Property>) {
  try {
    localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
  } catch {
    // localStorage unavailable (e.g. private mode) - listing changes just won't persist.
  }
}

function readDeletedIds(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeDeletedIds(ids: string[]) {
  try {
    localStorage.setItem(DELETED_KEY, JSON.stringify(ids));
  } catch {
    // localStorage unavailable - deletions just won't persist.
  }
}

// Seed listings are edited/deleted via an id-keyed override map rather than
// being mutated directly - overrides[id] replaces a seed listing in place;
// an id not present in the seed data is a landlord-created listing.
function buildCatalog(overrides: Record<string, Property>, deletedIds: string[]): Property[] {
  const seedIds = new Set(seedProperties.map((property) => property.id));
  const merged = seedProperties.map((property) => overrides[property.id] ?? property);
  const created = Object.values(overrides).filter((property) => !seedIds.has(property.id));
  return [...merged, ...created].filter((property) => !deletedIds.includes(property.id));
}

export function usePropertyCatalog() {
  const [overrides, setOverrides] = useState<Record<string, Property>>(() => readOverrides());
  const [deletedIds, setDeletedIds] = useState<string[]>(() => readDeletedIds());

  const properties = useMemo(() => buildCatalog(overrides, deletedIds), [overrides, deletedIds]);

  const addProperty = useCallback((input: PropertyInput) => {
    const property: Property = { id: generatePropertyId(), ...input };
    setOverrides((prev) => {
      const next = { ...prev, [property.id]: property };
      writeOverrides(next);
      return next;
    });
    return property.id;
  }, []);

  const updateProperty = useCallback((id: string, input: PropertyInput) => {
    setOverrides((prev) => {
      const next = { ...prev, [id]: { id, ...input } };
      writeOverrides(next);
      return next;
    });
  }, []);

  const deleteProperty = useCallback((id: string) => {
    setDeletedIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      writeDeletedIds(next);
      return next;
    });
  }, []);

  return { properties, addProperty, updateProperty, deleteProperty };
}

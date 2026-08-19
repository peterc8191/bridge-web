import { useState } from "react";
import type { ListingType, PropertyFilters } from "../types/property";
import { countActiveFilters, defaultFilters, hasActiveFilters } from "../utils/filterProperties";
import "./FilterBar.css";

const BEDROOM_OPTIONS = [1, 2, 3, 4];
const LISTING_TYPE_OPTIONS: { value: ListingType; label: string }[] = [
  { value: "sale", label: "For Sale" },
  { value: "rent", label: "For Rent" },
];

interface FilterBarProps {
  filters: PropertyFilters;
  onChange: (filters: PropertyFilters) => void;
  locations: string[];
  resultCount: number;
}

function toNullableNumber(value: string): number | null {
  if (value === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export function FilterBar({ filters, onChange, locations, resultCount }: FilterBarProps) {
  const [expanded, setExpanded] = useState(false);
  const active = hasActiveFilters(filters);
  const activeCount = countActiveFilters(filters);

  return (
    <div className="filter-bar" data-testid="filter-bar">
      <button
        type="button"
        className="filter-bar__toggle"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        aria-controls="filter-bar-controls"
      >
        <span>Filters{active ? ` (${activeCount})` : ""}</span>
        <span className="filter-bar__chevron" aria-hidden="true">
          {expanded ? "▲" : "▼"}
        </span>
      </button>

      {expanded && (
        <div className="filter-bar__row" id="filter-bar-controls">
          <label className="filter-bar__field">
            <span>Listing type</span>
            <select
              value={filters.listingType ?? ""}
              onChange={(event) =>
                onChange({
                  ...filters,
                  listingType: event.target.value === "" ? null : (event.target.value as ListingType),
                })
              }
            >
              <option value="">Sale or rent</option>
              {LISTING_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-bar__field">
            <span>Location</span>
            <select
              value={filters.location}
              onChange={(event) => onChange({ ...filters, location: event.target.value })}
            >
              <option value="">All locations</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-bar__field">
            <span>Min price</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={10000}
              placeholder="No min"
              value={filters.minPrice ?? ""}
              onChange={(event) =>
                onChange({ ...filters, minPrice: toNullableNumber(event.target.value) })
              }
            />
          </label>

          <label className="filter-bar__field">
            <span>Max price</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={10000}
              placeholder="No max"
              value={filters.maxPrice ?? ""}
              onChange={(event) =>
                onChange({ ...filters, maxPrice: toNullableNumber(event.target.value) })
              }
            />
          </label>

          <label className="filter-bar__field">
            <span>Bedrooms</span>
            <select
              value={filters.minBeds ?? ""}
              onChange={(event) =>
                onChange({ ...filters, minBeds: toNullableNumber(event.target.value) })
              }
            >
              <option value="">Any</option>
              {BEDROOM_OPTIONS.map((beds) => (
                <option key={beds} value={beds}>
                  {beds}+
                </option>
              ))}
            </select>
          </label>

          {active && (
            <button
              type="button"
              className="filter-bar__clear"
              onClick={() => onChange(defaultFilters)}
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      <p className="filter-bar__count">
        {resultCount} listing{resultCount === 1 ? "" : "s"} match
      </p>
    </div>
  );
}

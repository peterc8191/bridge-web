import { useMemo, useState } from "react";
import type { Property, PropertyFilters } from "../types/property";
import type { SwipeDirection } from "../hooks/usePropertyDeck";
import { SwipeDeck } from "../components/SwipeDeck";
import { FilterBar } from "../components/FilterBar";
import { defaultFilters, filterProperties } from "../utils/filterProperties";
import "./Discover.css";

interface DiscoverProps {
  deck: Property[];
  onDecide: (property: Property, direction: SwipeDirection) => void;
  reduceMotion?: boolean;
}

export function Discover({ deck, onDecide, reduceMotion = false }: DiscoverProps) {
  const [filters, setFilters] = useState<PropertyFilters>(defaultFilters);

  const locations = useMemo(
    () => Array.from(new Set(deck.map((property) => property.city))).sort(),
    [deck],
  );

  const filteredDeck = useMemo(() => filterProperties(deck, filters), [deck, filters]);

  const noMatches = deck.length > 0 && filteredDeck.length === 0;

  return (
    <main className="discover-page">
      <FilterBar
        filters={filters}
        onChange={setFilters}
        locations={locations}
        resultCount={filteredDeck.length}
      />
      {noMatches ? (
        <div className="discover-page__no-matches" data-testid="no-matches">
          <p>No listings match your filters.</p>
          <p className="discover-page__no-matches-hint">Try widening the filters above.</p>
        </div>
      ) : (
        <SwipeDeck deck={filteredDeck} onDecide={onDecide} reduceMotion={reduceMotion} />
      )}
    </main>
  );
}

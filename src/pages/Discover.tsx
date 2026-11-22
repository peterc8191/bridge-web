import { useMemo, useState } from "react";
import type { PropertyFilters } from "../types/property";
import { SwipeDeck } from "../components/SwipeDeck";
import { FilterBar } from "../components/FilterBar";
import { useAppData } from "../context/appDataContext";
import { defaultFilters, filterProperties } from "../utils/filterProperties";
import "./Discover.css";

export function Discover() {
  const { deck, decide, undo, canUndo, reduceMotion } = useAppData();
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
        <SwipeDeck
          deck={filteredDeck}
          onDecide={decide}
          onUndo={undo}
          canUndo={canUndo}
          reduceMotion={reduceMotion}
        />
      )}
    </main>
  );
}

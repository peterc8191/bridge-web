import { useRef } from "react";
import type { Property } from "../types/property";
import type { SwipeDirection } from "../hooks/usePropertyDeck";
import { PropertyCard, type PropertyCardHandle } from "./PropertyCard";
import { ActionButtons } from "./ActionButtons";
import "./SwipeDeck.css";

const VISIBLE_CARDS = 3;

interface SwipeDeckProps {
  deck: Property[];
  onDecide: (property: Property, direction: SwipeDirection) => void;
  reduceMotion?: boolean;
}

export function SwipeDeck({ deck, onDecide, reduceMotion = false }: SwipeDeckProps) {
  const topCardRef = useRef<PropertyCardHandle>(null);

  const visible = deck.slice(0, VISIBLE_CARDS);
  const topProperty = visible[0];

  const handleButtonSwipe = (direction: SwipeDirection) => {
    if (!topProperty) return;
    topCardRef.current?.swipe(direction);
  };

  if (visible.length === 0) {
    return (
      <div className="swipe-deck swipe-deck--empty" data-testid="deck-empty">
        <p>You've been through every listing.</p>
        <p className="swipe-deck__empty-hint">Check your Saved list for the ones you liked.</p>
      </div>
    );
  }

  return (
    <div className="swipe-deck">
      <div className="swipe-deck__stack">
        {visible
          .slice()
          .reverse()
          .map((property, indexFromBottom) => {
            const isTop = indexFromBottom === visible.length - 1;
            const depth = visible.length - 1 - indexFromBottom;
            return (
              <div
                key={property.id}
                className="swipe-deck__card-slot"
                data-testid="card-slot"
                style={{
                  transform: isTop ? undefined : `scale(${1 - depth * 0.04}) translateY(${depth * 10}px)`,
                  transition: reduceMotion ? "none" : undefined,
                }}
              >
                <PropertyCard
                  ref={isTop ? topCardRef : undefined}
                  property={property}
                  active={isTop}
                  onSwiped={(direction) => onDecide(property, direction)}
                  reduceMotion={reduceMotion}
                />
              </div>
            );
          })}
      </div>
      <ActionButtons onPass={() => handleButtonSwipe("left")} onLike={() => handleButtonSwipe("right")} />
    </div>
  );
}

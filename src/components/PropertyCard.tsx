import { forwardRef, useImperativeHandle, useState } from "react";
import { motion, useAnimation, type PanInfo } from "framer-motion";
import type { Property } from "../types/property";
import type { SwipeDirection } from "../hooks/usePropertyDeck";
import "./PropertyCard.css";

const SWIPE_THRESHOLD = 120;
const EXIT_X = 500;

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export interface PropertyCardHandle {
  swipe: (direction: SwipeDirection) => void;
}

interface PropertyCardProps {
  property: Property;
  active: boolean;
  onSwiped: (direction: SwipeDirection) => void;
  reduceMotion?: boolean;
}

export const PropertyCard = forwardRef<PropertyCardHandle, PropertyCardProps>(
  ({ property, active, onSwiped, reduceMotion = false }, ref) => {
    const controls = useAnimation();
    const [imageIndex, setImageIndex] = useState(0);

    const showPrevImage = () => setImageIndex((index) => Math.max(0, index - 1));
    const showNextImage = () =>
      setImageIndex((index) => Math.min(property.images.length - 1, index + 1));

    useImperativeHandle(ref, () => ({
      swipe: (direction: SwipeDirection) => {
        const x = direction === "right" ? EXIT_X : -EXIT_X;
        controls
          .start({
            x,
            rotate: direction === "right" ? 20 : -20,
            opacity: 0,
            transition: { duration: reduceMotion ? 0 : 0.35 },
          })
          .then(() => onSwiped(direction));
      },
    }));

    const handleDragEnd = (
      _event: MouseEvent | TouchEvent | PointerEvent,
      info: PanInfo,
    ) => {
      if (Math.abs(info.offset.x) > SWIPE_THRESHOLD) {
        const direction: SwipeDirection = info.offset.x > 0 ? "right" : "left";
        controls
          .start({
            x: direction === "right" ? EXIT_X : -EXIT_X,
            rotate: direction === "right" ? 20 : -20,
            opacity: 0,
            transition: { duration: reduceMotion ? 0 : 0.3 },
          })
          .then(() => onSwiped(direction));
      } else {
        controls.start({
          x: 0,
          rotate: 0,
          transition: reduceMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 300, damping: 25 },
        });
      }
    };

    return (
      <motion.article
        className="property-card"
        data-testid="property-card"
        drag={active ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.9}
        onDragEnd={handleDragEnd}
        animate={controls}
        initial={{ scale: 1, opacity: 1, x: 0 }}
        style={{ zIndex: active ? 2 : 1 }}
      >
        <div
          className="property-card__image"
          data-testid="property-card-image"
          style={{ backgroundImage: `url(${property.images[imageIndex]})` }}
        >
          {property.images.length > 1 && (
            <div className="property-card__progress">
              {property.images.map((image, index) => (
                <span
                  key={image}
                  className={
                    index === imageIndex
                      ? "property-card__progress-segment property-card__progress-segment--active"
                      : "property-card__progress-segment"
                  }
                />
              ))}
            </div>
          )}
          {active && property.images.length > 1 && (
            <>
              <button
                type="button"
                className="property-card__nav-zone property-card__nav-zone--left"
                onClick={showPrevImage}
                aria-label="Previous photo"
                disabled={imageIndex === 0}
              />
              <button
                type="button"
                className="property-card__nav-zone property-card__nav-zone--right"
                onClick={showNextImage}
                aria-label="Next photo"
                disabled={imageIndex === property.images.length - 1}
              />
            </>
          )}
          <div className="property-card__gradient" />
          <div className="property-card__info">
            <h2>{property.address}</h2>
            <p className="property-card__city">{property.city}</p>
            <p className="property-card__price">{currency.format(property.price)}</p>
            <p className="property-card__specs">
              {property.beds} bed · {property.baths} bath · {property.sqft.toLocaleString()} sqft
            </p>
            <p className="property-card__description">{property.description}</p>
          </div>
        </div>
      </motion.article>
    );
  },
);

PropertyCard.displayName = "PropertyCard";

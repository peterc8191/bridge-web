import { useMemo } from "react";
import { Link } from "react-router-dom";
import type { ViewingRequest } from "../types/viewing";
import { properties } from "../data/properties";
import { splitViewingsByTime } from "../utils/sortViewings";
import { formatViewingDate, formatViewingTime } from "../utils/formatViewingTime";
import "./Viewings.css";

interface ViewingsProps {
  viewings: ViewingRequest[];
}

function ViewingRow({ viewing }: { viewing: ViewingRequest }) {
  const property = properties.find((candidate) => candidate.id === viewing.propertyId);

  return (
    <li className="viewings-page__row">
      <Link to={`/property/${viewing.propertyId}`} className="viewings-page__link">
        <div className="viewings-page__row-main">
          <span className="viewings-page__address">
            {property ? property.address : "Unknown property"}
          </span>
          <span className="viewings-page__datetime">
            {formatViewingDate(viewing.date)} at {formatViewingTime(viewing.time)}
          </span>
          {viewing.note && <span className="viewings-page__note">{viewing.note}</span>}
        </div>
        <span
          className={
            viewing.confirmed
              ? "viewings-page__status viewings-page__status--confirmed"
              : "viewings-page__status viewings-page__status--pending"
          }
        >
          {viewing.confirmed ? "Confirmed" : "Pending"}
        </span>
      </Link>
    </li>
  );
}

export function Viewings({ viewings }: ViewingsProps) {
  const { upcoming, past } = useMemo(() => splitViewingsByTime(viewings), [viewings]);

  if (viewings.length === 0) {
    return (
      <main className="viewings-page viewings-page--empty" data-testid="viewings-empty">
        <p>No viewings requested yet.</p>
        <p className="viewings-page__hint">Arrange a viewing from any saved property's page.</p>
      </main>
    );
  }

  return (
    <main className="viewings-page">
      <section className="viewings-page__section">
        <h2>Upcoming</h2>
        {upcoming.length === 0 ? (
          <p className="viewings-page__section-empty">No upcoming viewings.</p>
        ) : (
          <ul className="viewings-page__list" data-testid="upcoming-viewings">
            {upcoming.map((viewing) => (
              <ViewingRow key={viewing.id} viewing={viewing} />
            ))}
          </ul>
        )}
      </section>

      <section className="viewings-page__section">
        <h2>Past</h2>
        {past.length === 0 ? (
          <p className="viewings-page__section-empty">No past viewings.</p>
        ) : (
          <ul className="viewings-page__list" data-testid="past-viewings">
            {past.map((viewing) => (
              <ViewingRow key={viewing.id} viewing={viewing} />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

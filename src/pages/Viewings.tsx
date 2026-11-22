import { useMemo } from "react";
import { Link } from "react-router-dom";
import type { ViewingRequest } from "../types/viewing";
import { ViewingStatusBadge } from "../components/ViewingStatusBadge";
import { useAppData } from "../context/appDataContext";
import { canCancelViewing, canRespondToViewing } from "../lib/permissions";
import { splitViewingsByTime } from "../utils/sortViewings";
import { formatViewingDate, formatViewingTime } from "../utils/formatViewingTime";
import "./Viewings.css";

function ViewingRow({ viewing, isUpcoming }: { viewing: ViewingRequest; isUpcoming: boolean }) {
  const { propertyById, currentUser, respondToViewing, cancelViewing } = useAppData();
  const property = propertyById.get(viewing.propertyId);
  const isMine = viewing.requesterId === currentUser?.id;
  const canRespond = canRespondToViewing(currentUser, viewing, propertyById);
  const canCancel = isUpcoming && canCancelViewing(currentUser, viewing);

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
          {!isMine && (
            <span className="viewings-page__requester">Requested by {viewing.requesterEmail}</span>
          )}
          {viewing.note && <span className="viewings-page__note">{viewing.note}</span>}
        </div>
        <ViewingStatusBadge status={viewing.status} />
      </Link>
      {(canRespond || canCancel) && (
        <div className="viewings-page__actions">
          {canRespond && (
            <>
              <button
                type="button"
                className="viewings-page__confirm-btn"
                onClick={() => respondToViewing(viewing.id, "confirmed")}
              >
                Confirm viewing
              </button>
              <button
                type="button"
                className="viewings-page__decline-btn"
                onClick={() => respondToViewing(viewing.id, "declined")}
              >
                Decline
              </button>
            </>
          )}
          {canCancel && (
            <button
              type="button"
              className="viewings-page__decline-btn"
              onClick={() => {
                if (window.confirm("Cancel this viewing request?")) cancelViewing(viewing.id);
              }}
            >
              Cancel request
            </button>
          )}
        </div>
      )}
    </li>
  );
}

export function Viewings() {
  const { viewings, currentUser } = useAppData();
  const { upcoming, past } = useMemo(() => splitViewingsByTime(viewings), [viewings]);

  if (viewings.length === 0) {
    return (
      <main className="viewings-page viewings-page--empty" data-testid="viewings-empty">
        <p>No viewings requested yet.</p>
        <p className="viewings-page__hint">
          {currentUser?.role === "landlord"
            ? "Requests on your listings will appear here."
            : "Arrange a viewing from any property's page."}
        </p>
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
              <ViewingRow key={viewing.id} viewing={viewing} isUpcoming />
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
              <ViewingRow key={viewing.id} viewing={viewing} isUpcoming={false} />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

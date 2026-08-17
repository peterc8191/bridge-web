import type { ViewingRequest } from "../types/viewing";
import { formatViewingDate, formatViewingTime } from "../utils/formatViewingTime";
import "./ViewingList.css";

interface ViewingListProps {
  viewings: ViewingRequest[];
}

export function ViewingList({ viewings }: ViewingListProps) {
  if (viewings.length === 0) {
    return (
      <p className="viewing-list--empty" data-testid="viewing-list-empty">
        No viewings requested yet.
      </p>
    );
  }

  const sortedViewings = [...viewings].sort((a, b) =>
    `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`),
  );

  return (
    <ul className="viewing-list" data-testid="viewing-list">
      {sortedViewings.map((viewing) => (
        <li key={viewing.id} className="viewing-list__item">
          <span className="viewing-list__datetime">
            {formatViewingDate(viewing.date)} at {formatViewingTime(viewing.time)}
          </span>
          {viewing.note && <span className="viewing-list__note">{viewing.note}</span>}
        </li>
      ))}
    </ul>
  );
}

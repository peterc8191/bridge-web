import type { ViewingRequest } from "../types/viewing";
import "./ViewingList.css";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatTime(time: string): string {
  const [hoursRaw, minutes] = time.split(":");
  const hours = Number(hoursRaw);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = ((hours + 11) % 12) + 1;
  return `${displayHours}:${minutes} ${period}`;
}

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
            {dateFormatter.format(new Date(`${viewing.date}T00:00:00`))} at{" "}
            {formatTime(viewing.time)}
          </span>
          {viewing.note && <span className="viewing-list__note">{viewing.note}</span>}
        </li>
      ))}
    </ul>
  );
}

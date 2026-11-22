import type { ViewingStatus } from "../types/viewing";
import "./StatusBadge.css";

const LABELS: Record<ViewingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  declined: "Declined",
  cancelled: "Cancelled",
};

// Reuses the issue status colour tokens: pending = amber, confirmed = green,
// declined = red, cancelled = neutral.
const VARIANT: Record<ViewingStatus, string> = {
  pending: "in-progress",
  confirmed: "resolved",
  declined: "open",
  cancelled: "neutral",
};

export function ViewingStatusBadge({ status }: { status: ViewingStatus }) {
  return (
    <span className={`status-badge status-badge--${VARIANT[status]}`} data-status={status}>
      {LABELS[status]}
    </span>
  );
}

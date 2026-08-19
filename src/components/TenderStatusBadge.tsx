import type { TenderStatus } from "../types/tender";
import "./TenderStatusBadge.css";

const TENDER_STATUS_LABELS: Record<TenderStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
};

interface TenderStatusBadgeProps {
  status: TenderStatus;
}

export function TenderStatusBadge({ status }: TenderStatusBadgeProps) {
  return (
    <span className={`tender-status-badge tender-status-badge--${status}`}>
      {TENDER_STATUS_LABELS[status]}
    </span>
  );
}

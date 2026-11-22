export type ViewingStatus = "pending" | "confirmed" | "declined" | "cancelled";

export interface ViewingRequest {
  id: string;
  propertyId: string;
  requesterId: string;
  requesterEmail: string;
  date: string;
  time: string;
  note: string;
  status: ViewingStatus;
  createdAt: string;
}

export interface NewViewingInput {
  propertyId: string;
  date: string;
  time: string;
  note: string;
}

export interface ViewingRequest {
  id: string;
  propertyId: string;
  date: string;
  time: string;
  note: string;
  createdAt: string;
}

export interface NewViewingInput {
  propertyId: string;
  date: string;
  time: string;
  note: string;
}

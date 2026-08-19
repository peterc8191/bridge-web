export type TenderStatus = "pending" | "accepted" | "rejected";

export interface Tender {
  id: string;
  issueId: string;
  traderId: string;
  traderEmail: string;
  traderServices: string[];
  traderAreas: string[];
  amount: number;
  message: string;
  status: TenderStatus;
  createdAt: string;
}

export interface NewTenderInput {
  issueId: string;
  traderId: string;
  traderEmail: string;
  traderServices: string[];
  traderAreas: string[];
  amount: number;
  message: string;
}

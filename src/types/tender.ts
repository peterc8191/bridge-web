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

/** What the trader fills in - identity and profile snapshot are added by the app. */
export interface NewTenderInput {
  issueId: string;
  amount: number;
  message: string;
}

export type IssueStatus = "open" | "in-progress" | "resolved";

export interface Issue {
  id: string;
  propertyId: string;
  title: string;
  description: string;
  status: IssueStatus;
  createdAt: string;
}

export interface NewIssueInput {
  propertyId: string;
  title: string;
  description: string;
}

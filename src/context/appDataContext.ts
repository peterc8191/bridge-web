import { createContext, useContext } from "react";
import type { AuthResult, AuthUser } from "../types/auth";
import type { Issue, IssueStatus, NewIssueInput } from "../types/issue";
import type { Property, PropertyInput } from "../types/property";
import type { ResolvedTheme, Theme } from "../types/settings";
import type { NewTenderInput, Tender } from "../types/tender";
import type { TraderProfile } from "../types/traderProfile";
import type { NewViewingInput, ViewingRequest } from "../types/viewing";
import type { SwipeDirection } from "../hooks/usePropertyDeck";

/**
 * Everything pages read and do, already scoped to the signed-in user:
 * lists contain only what they may see, and actions silently refuse what
 * they may not do (see lib/permissions.ts).
 */
export interface AppData {
  // Account
  currentUser: AuthUser | null;
  register: (email: string, password: string) => Promise<AuthResult>;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => void;

  // Listings
  properties: Property[];
  propertyById: Map<string, Property>;
  /** Listings owned by the signed-in landlord. */
  myListings: Property[];
  addProperty: (input: PropertyInput) => string | null;
  updateProperty: (id: string, input: PropertyInput) => void;
  deleteProperty: (id: string) => void;

  // Swipe deck (per account; "guest" when signed out)
  deck: Property[];
  saved: Property[];
  decide: (property: Property, direction: SwipeDirection) => void;
  undo: () => void;
  canUndo: boolean;
  removeSaved: (propertyId: string) => void;
  resetDeck: () => void;

  // Issues
  issues: Issue[];
  /** Properties the user rents, so can report issues on. */
  reportableProperties: Property[];
  addIssue: (input: NewIssueInput) => void;
  updateIssueStatus: (issueId: string, status: IssueStatus) => void;
  clearMyIssues: () => void;

  // Viewings
  viewings: ViewingRequest[];
  scheduleViewing: (input: NewViewingInput) => void;
  respondToViewing: (viewingId: string, response: "confirmed" | "declined") => void;
  cancelViewing: (viewingId: string) => void;

  // Tenders
  tenders: Tender[];
  addTender: (input: NewTenderInput) => void;
  acceptTender: (tenderId: string) => void;
  traderProfile: TraderProfile;
  updateTraderProfile: (profile: TraderProfile) => void;

  // Device settings
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: ResolvedTheme;
  reduceMotion: boolean;
  setReduceMotion: (reduceMotion: boolean) => void;
}

export const AppDataContext = createContext<AppData | null>(null);

export function useAppData(): AppData {
  const value = useContext(AppDataContext);
  if (!value) throw new Error("useAppData must be used inside <AppDataProvider>");
  return value;
}

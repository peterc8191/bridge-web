import type { AuthUser } from "../types/auth";
import type { Issue } from "../types/issue";
import type { Property } from "../types/property";
import type { Tender } from "../types/tender";
import type { TraderProfile } from "../types/traderProfile";
import type { ViewingRequest } from "../types/viewing";
import { canRespondToViewing, canTenderOn, canUpdateIssue } from "./permissions";

interface NavCountInput {
  currentUser: AuthUser | null;
  issues: Issue[];
  viewings: ViewingRequest[];
  tenders: Tender[];
  propertyById: Map<string, Property>;
  traderProfile: TraderProfile;
  now?: Date;
}

/**
 * Nav badge counts = "things that want your attention" - the in-app stand-in
 * for notifications until there's a backend to send email/push.
 * - Viewings: landlords -> pending requests on their listings to answer;
 *   everyone else -> their upcoming pending/confirmed viewings.
 * - Issues: landlords -> open issues on their listings; traders -> issues they
 *   can still quote on; tenants -> their unresolved reports.
 */
export function navCounts({
  currentUser,
  issues,
  viewings,
  tenders,
  propertyById,
  traderProfile,
  now = new Date(),
}: NavCountInput) {
  if (!currentUser) return { viewings: 0, issues: 0 };

  const today = now.toISOString().slice(0, 10);
  const viewingCount =
    currentUser.role === "landlord"
      ? viewings.filter((viewing) => canRespondToViewing(currentUser, viewing, propertyById)).length
      : viewings.filter(
          (viewing) =>
            viewing.requesterId === currentUser.id &&
            viewing.date >= today &&
            (viewing.status === "pending" || viewing.status === "confirmed"),
        ).length;

  let issueCount: number;
  if (currentUser.role === "landlord") {
    issueCount = issues.filter(
      (issue) => issue.status === "open" && canUpdateIssue(currentUser, issue, propertyById),
    ).length;
  } else if (currentUser.role === "tradesperson") {
    issueCount = issues.filter((issue) =>
      canTenderOn(currentUser, issue, propertyById, traderProfile, tenders),
    ).length;
  } else {
    issueCount = issues.filter(
      (issue) => issue.reporterId === currentUser.id && issue.status !== "resolved",
    ).length;
  }

  return { viewings: viewingCount, issues: issueCount };
}

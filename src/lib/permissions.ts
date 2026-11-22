// Who can see and do what. Pure functions so the rules are unit-testable and
// can move to the server unchanged when the backend lands (until then they're
// enforced in the UI only - see docs/features.md "Limitations").
import type { AuthUser } from "../types/auth";
import type { Issue } from "../types/issue";
import type { Property } from "../types/property";
import type { Tender } from "../types/tender";
import type { TraderProfile } from "../types/traderProfile";
import type { ViewingRequest } from "../types/viewing";

type PropertyLookup = Map<string, Property>;

export function indexProperties(properties: Property[]): PropertyLookup {
  return new Map(properties.map((property) => [property.id, property]));
}

export function ownsProperty(user: AuthUser | null, property: Property | undefined): boolean {
  return !!user && !!property && user.role === "landlord" && property.ownerId === user.id;
}

export function isTenantOf(user: AuthUser | null, property: Property): boolean {
  return !!user && property.tenantEmails.some((email) => email.toLowerCase() === user.email);
}

/** Properties the user rents and so can report issues on. */
export function reportableProperties(user: AuthUser | null, properties: Property[]): Property[] {
  return properties.filter((property) => isTenantOf(user, property));
}

/** Trader's service areas cover this property's city. */
export function servesArea(profile: TraderProfile, property: Property | undefined): boolean {
  return !!property && profile.areas.some((area) => area.toLowerCase() === property.city.toLowerCase());
}

/**
 * Issues a user can see:
 * - anyone: issues they reported
 * - landlord: issues on properties they own
 * - tradesperson: unresolved issues in their service areas, plus any issue
 *   they've already tendered on (so their quote history doesn't vanish)
 */
export function visibleIssues(
  user: AuthUser | null,
  issues: Issue[],
  properties: PropertyLookup,
  tenders: Tender[],
  profile: TraderProfile,
): Issue[] {
  if (!user) return [];
  const tenderedIssueIds = new Set(
    tenders.filter((tender) => tender.traderId === user.id).map((tender) => tender.issueId),
  );
  return issues.filter((issue) => {
    if (issue.reporterId === user.id) return true;
    const property = properties.get(issue.propertyId);
    if (ownsProperty(user, property)) return true;
    if (user.role === "tradesperson") {
      if (tenderedIssueIds.has(issue.id)) return true;
      return issue.status !== "resolved" && servesArea(profile, property);
    }
    return false;
  });
}

export function canUpdateIssue(user: AuthUser | null, issue: Issue, properties: PropertyLookup) {
  return ownsProperty(user, properties.get(issue.propertyId));
}

export function canTenderOn(
  user: AuthUser | null,
  issue: Issue,
  properties: PropertyLookup,
  profile: TraderProfile,
  tenders: Tender[],
): boolean {
  return (
    user?.role === "tradesperson" &&
    issue.status !== "resolved" &&
    servesArea(profile, properties.get(issue.propertyId)) &&
    !tenders.some((tender) => tender.issueId === issue.id && tender.traderId === user.id)
  );
}

/** Landlords see every tender on their own issues; traders see only their own. */
export function visibleTenders(
  user: AuthUser | null,
  tenders: Tender[],
  issues: Issue[],
  properties: PropertyLookup,
): Tender[] {
  if (!user) return [];
  const issueById = new Map(issues.map((issue) => [issue.id, issue]));
  return tenders.filter((tender) => {
    if (tender.traderId === user.id) return true;
    const issue = issueById.get(tender.issueId);
    return !!issue && ownsProperty(user, properties.get(issue.propertyId));
  });
}

export function canAcceptTender(
  user: AuthUser | null,
  tender: Tender,
  issues: Issue[],
  properties: PropertyLookup,
): boolean {
  const issue = issues.find((candidate) => candidate.id === tender.issueId);
  return tender.status === "pending" && !!issue && ownsProperty(user, properties.get(issue.propertyId));
}

/** Viewings the user requested, plus (landlords) requests on their properties. */
export function visibleViewings(
  user: AuthUser | null,
  viewings: ViewingRequest[],
  properties: PropertyLookup,
): ViewingRequest[] {
  if (!user) return [];
  return viewings.filter(
    (viewing) =>
      viewing.requesterId === user.id || ownsProperty(user, properties.get(viewing.propertyId)),
  );
}

export function canRespondToViewing(
  user: AuthUser | null,
  viewing: ViewingRequest,
  properties: PropertyLookup,
): boolean {
  return viewing.status === "pending" && ownsProperty(user, properties.get(viewing.propertyId));
}

export function canCancelViewing(user: AuthUser | null, viewing: ViewingRequest): boolean {
  return (
    !!user &&
    viewing.requesterId === user.id &&
    (viewing.status === "pending" || viewing.status === "confirmed")
  );
}

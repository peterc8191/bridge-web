import { useCallback, useMemo, type ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import { usePropertyCatalog } from "../hooks/usePropertyCatalog";
import { usePropertyDeck } from "../hooks/usePropertyDeck";
import { useIssues } from "../hooks/useIssues";
import { useViewings } from "../hooks/useViewings";
import { useTenders } from "../hooks/useTenders";
import { useTraderProfile } from "../hooks/useTraderProfile";
import { useSettings } from "../hooks/useSettings";
import {
  canAcceptTender,
  canCancelViewing,
  canRespondToViewing,
  canTenderOn,
  canUpdateIssue,
  indexProperties,
  isTenantOf,
  ownsProperty,
  reportableProperties as getReportableProperties,
  visibleIssues,
  visibleTenders,
  visibleViewings,
} from "../lib/permissions";
import type { IssueStatus, NewIssueInput } from "../types/issue";
import type { PropertyInput } from "../types/property";
import type { NewTenderInput } from "../types/tender";
import type { NewViewingInput } from "../types/viewing";
import { AppDataContext, type AppData } from "./appDataContext";

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { currentUser, register, login, logout } = useAuth();
  const userId = currentUser?.id ?? null;

  const catalog = usePropertyCatalog();
  const { properties } = catalog;
  const propertyById = useMemo(() => indexProperties(properties), [properties]);

  const deck = usePropertyDeck(properties, userId);
  const issueStore = useIssues();
  const viewingStore = useViewings();
  const tenderStore = useTenders();
  const { profile: traderProfile, updateProfile: updateTraderProfile } = useTraderProfile(userId);
  const settings = useSettings();

  // --- Scoped views -------------------------------------------------------
  const myListings = useMemo(
    () => properties.filter((property) => ownsProperty(currentUser, property)),
    [properties, currentUser],
  );
  const reportableProperties = useMemo(
    () => getReportableProperties(currentUser, properties),
    [currentUser, properties],
  );
  const issues = useMemo(
    () =>
      visibleIssues(currentUser, issueStore.issues, propertyById, tenderStore.tenders, traderProfile),
    [currentUser, issueStore.issues, propertyById, tenderStore.tenders, traderProfile],
  );
  const tenders = useMemo(
    () => visibleTenders(currentUser, tenderStore.tenders, issueStore.issues, propertyById),
    [currentUser, tenderStore.tenders, issueStore.issues, propertyById],
  );
  const viewings = useMemo(
    () => visibleViewings(currentUser, viewingStore.viewings, propertyById),
    [currentUser, viewingStore.viewings, propertyById],
  );

  // --- Guarded actions ----------------------------------------------------
  const { addProperty: addToCatalog, updateProperty: updateInCatalog, deleteProperty: deleteFromCatalog } =
    catalog;

  const addProperty = useCallback(
    (input: PropertyInput) =>
      currentUser?.role === "landlord" ? addToCatalog(currentUser.id, input) : null,
    [currentUser, addToCatalog],
  );
  const updateProperty = useCallback(
    (id: string, input: PropertyInput) => {
      if (ownsProperty(currentUser, propertyById.get(id))) updateInCatalog(id, input);
    },
    [currentUser, propertyById, updateInCatalog],
  );
  const deleteProperty = useCallback(
    (id: string) => {
      if (ownsProperty(currentUser, propertyById.get(id))) deleteFromCatalog(id);
    },
    [currentUser, propertyById, deleteFromCatalog],
  );

  const { addIssue: storeIssue, updateIssueStatus: storeIssueStatus, deleteIssuesByReporter } =
    issueStore;
  const addIssue = useCallback(
    (input: NewIssueInput) => {
      const property = propertyById.get(input.propertyId);
      if (currentUser && property && isTenantOf(currentUser, property)) storeIssue(currentUser, input);
    },
    [currentUser, propertyById, storeIssue],
  );
  const updateIssueStatus = useCallback(
    (issueId: string, status: IssueStatus) => {
      const issue = issueStore.issues.find((candidate) => candidate.id === issueId);
      if (issue && canUpdateIssue(currentUser, issue, propertyById)) storeIssueStatus(issueId, status);
    },
    [currentUser, issueStore.issues, propertyById, storeIssueStatus],
  );
  const clearMyIssues = useCallback(() => {
    if (userId) deleteIssuesByReporter(userId);
  }, [userId, deleteIssuesByReporter]);

  const { scheduleViewing: storeViewing, setViewingStatus } = viewingStore;
  const scheduleViewing = useCallback(
    (input: NewViewingInput) => {
      if (currentUser && propertyById.has(input.propertyId)) storeViewing(currentUser, input);
    },
    [currentUser, propertyById, storeViewing],
  );
  const respondToViewing = useCallback(
    (viewingId: string, response: "confirmed" | "declined") => {
      const viewing = viewingStore.viewings.find((candidate) => candidate.id === viewingId);
      if (viewing && canRespondToViewing(currentUser, viewing, propertyById)) {
        setViewingStatus(viewingId, response);
      }
    },
    [currentUser, viewingStore.viewings, propertyById, setViewingStatus],
  );
  const cancelViewing = useCallback(
    (viewingId: string) => {
      const viewing = viewingStore.viewings.find((candidate) => candidate.id === viewingId);
      if (viewing && canCancelViewing(currentUser, viewing)) setViewingStatus(viewingId, "cancelled");
    },
    [currentUser, viewingStore.viewings, setViewingStatus],
  );

  const { addTender: storeTender, acceptTender: storeAccept } = tenderStore;
  const addTender = useCallback(
    (input: NewTenderInput) => {
      const issue = issueStore.issues.find((candidate) => candidate.id === input.issueId);
      if (
        currentUser &&
        issue &&
        canTenderOn(currentUser, issue, propertyById, traderProfile, tenderStore.tenders)
      ) {
        storeTender(currentUser, traderProfile, input);
      }
    },
    [currentUser, issueStore.issues, propertyById, traderProfile, tenderStore.tenders, storeTender],
  );
  const acceptTender = useCallback(
    (tenderId: string) => {
      const tender = tenderStore.tenders.find((candidate) => candidate.id === tenderId);
      if (tender && canAcceptTender(currentUser, tender, issueStore.issues, propertyById)) {
        storeAccept(tenderId);
      }
    },
    [currentUser, tenderStore.tenders, issueStore.issues, propertyById, storeAccept],
  );

  const value: AppData = useMemo(
    () => ({
      currentUser,
      register,
      login,
      logout,
      properties,
      propertyById,
      myListings,
      addProperty,
      updateProperty,
      deleteProperty,
      deck: deck.deck,
      saved: deck.saved,
      decide: deck.decide,
      undo: deck.undo,
      canUndo: deck.canUndo,
      removeSaved: deck.removeSaved,
      resetDeck: deck.reset,
      issues,
      reportableProperties,
      addIssue,
      updateIssueStatus,
      clearMyIssues,
      viewings,
      scheduleViewing,
      respondToViewing,
      cancelViewing,
      tenders,
      addTender,
      acceptTender,
      traderProfile,
      updateTraderProfile,
      ...settings,
    }),
    [
      currentUser, register, login, logout, properties, propertyById, myListings, addProperty,
      updateProperty, deleteProperty, deck, issues, reportableProperties, addIssue,
      updateIssueStatus, clearMyIssues, viewings, scheduleViewing, respondToViewing, cancelViewing,
      tenders, addTender, acceptTender, traderProfile, updateTraderProfile, settings,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

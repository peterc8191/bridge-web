import { Link } from "react-router-dom";
import { IssueForm } from "../components/IssueForm";
import { IssueList } from "../components/IssueList";
import { useAppData } from "../context/appDataContext";
import "./Issues.css";

export function Issues() {
  const {
    currentUser,
    issues,
    reportableProperties,
    propertyById,
    addIssue,
    updateIssueStatus,
    tenders,
    traderProfile,
    addTender,
    acceptTender,
  } = useAppData();

  // Landlords and traders only see the report form if they also rent somewhere.
  const showForm = currentUser?.role === "user" || reportableProperties.length > 0;

  return (
    <main className="issues-page">
      {currentUser?.role === "landlord" && (
        <p className="issues-page__intro">Issues reported on your listings.</p>
      )}
      {currentUser?.role === "tradesperson" && (
        <p className="issues-page__intro" data-testid="trader-areas-note">
          {traderProfile.areas.length > 0 ? (
            <>Showing open issues in your service areas: {traderProfile.areas.join(", ")}.</>
          ) : (
            <>
              Add your service areas to your <Link to="/trader-profile">trader profile</Link> to see
              issues you can quote on.
            </>
          )}
        </p>
      )}
      {showForm && <IssueForm properties={reportableProperties} onSubmit={addIssue} />}
      <IssueList
        issues={issues}
        propertyById={propertyById}
        currentUser={currentUser}
        onUpdateStatus={updateIssueStatus}
        tenders={tenders}
        traderProfile={traderProfile}
        onAddTender={addTender}
        onAcceptTender={acceptTender}
      />
    </main>
  );
}

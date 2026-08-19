import { Route, Routes } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import { Discover } from "./pages/Discover";
import { Saved } from "./pages/Saved";
import { Issues } from "./pages/Issues";
import { Settings } from "./pages/Settings";
import { PropertyDetail } from "./pages/PropertyDetail";
import { Viewings } from "./pages/Viewings";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ManageListings } from "./pages/ManageListings";
import { PropertyFormPage } from "./pages/PropertyFormPage";
import { TraderProfilePage } from "./pages/TraderProfilePage";
import { usePropertyCatalog } from "./hooks/usePropertyCatalog";
import { usePropertyDeck } from "./hooks/usePropertyDeck";
import { useIssues } from "./hooks/useIssues";
import { useSettings } from "./hooks/useSettings";
import { useViewings } from "./hooks/useViewings";
import { useAuth } from "./hooks/useAuth";
import { useTenders } from "./hooks/useTenders";
import { useTraderProfile } from "./hooks/useTraderProfile";

function App() {
  const { properties, addProperty, updateProperty, deleteProperty } = usePropertyCatalog();
  const { deck, saved, decide, removeSaved, reset: resetProperties } = usePropertyDeck(properties);
  const { issues, addIssue, clearAddedIssues, updateIssueStatus } = useIssues();
  const { theme, setTheme, resolvedTheme, reduceMotion, setReduceMotion } = useSettings();
  const { viewings, scheduleViewing, confirmViewing } = useViewings();
  const { currentUser, register, login, logout } = useAuth();
  const { tenders, addTender, acceptTender } = useTenders();
  const { profile: traderProfile, updateProfile: updateTraderProfile } = useTraderProfile(
    currentUser?.id ?? null,
  );

  return (
    <>
      <NavBar
        savedCount={saved.length}
        issueCount={issues.length}
        viewingCount={viewings.length}
        currentUser={currentUser}
        onLogout={logout}
      />
      <Routes>
        <Route
          path="/"
          element={<Discover deck={deck} onDecide={decide} reduceMotion={reduceMotion} />}
        />
        <Route path="/saved" element={<Saved saved={saved} onRemove={removeSaved} />} />
        <Route
          path="/property/:id"
          element={
            <PropertyDetail
              properties={properties}
              viewings={viewings}
              onScheduleViewing={scheduleViewing}
            />
          }
        />
        <Route
          path="/viewings"
          element={
            <Viewings
              properties={properties}
              viewings={viewings}
              currentUser={currentUser}
              onConfirmViewing={confirmViewing}
            />
          }
        />
        <Route
          path="/issues"
          element={
            <Issues
              saved={saved}
              properties={properties}
              issues={issues}
              onAddIssue={addIssue}
              currentUser={currentUser}
              onUpdateIssueStatus={updateIssueStatus}
              tenders={tenders}
              traderProfile={traderProfile}
              onAddTender={addTender}
              onAcceptTender={acceptTender}
            />
          }
        />
        <Route
          path="/manage-listings"
          element={
            <ManageListings
              currentUser={currentUser}
              properties={properties}
              onDeleteProperty={deleteProperty}
            />
          }
        />
        <Route
          path="/manage-listings/new"
          element={
            <PropertyFormPage
              currentUser={currentUser}
              properties={properties}
              onAddProperty={addProperty}
              onUpdateProperty={updateProperty}
            />
          }
        />
        <Route
          path="/manage-listings/:id/edit"
          element={
            <PropertyFormPage
              currentUser={currentUser}
              properties={properties}
              onAddProperty={addProperty}
              onUpdateProperty={updateProperty}
            />
          }
        />
        <Route
          path="/trader-profile"
          element={
            <TraderProfilePage
              currentUser={currentUser}
              profile={traderProfile}
              onUpdateProfile={updateTraderProfile}
            />
          }
        />
        <Route
          path="/settings"
          element={
            <Settings
              currentUser={currentUser}
              onLogout={logout}
              theme={theme}
              onThemeChange={setTheme}
              resolvedTheme={resolvedTheme}
              reduceMotion={reduceMotion}
              onReduceMotionChange={setReduceMotion}
              onResetProperties={resetProperties}
              onClearIssues={clearAddedIssues}
            />
          }
        />
        <Route path="/login" element={<Login currentUser={currentUser} onLogin={login} />} />
        <Route
          path="/register"
          element={<Register currentUser={currentUser} onRegister={register} />}
        />
      </Routes>
    </>
  );
}

export default App;

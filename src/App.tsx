import { Route, Routes } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import { RequireAuth } from "./components/RequireAuth";
import { StorageErrorBanner } from "./components/StorageErrorBanner";
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

// Pages read their data from AppDataProvider (see main.tsx); access rules
// live in <RequireAuth> here rather than inside each page.
function App() {
  return (
    <>
      <NavBar />
      <StorageErrorBanner />
      <Routes>
        <Route path="/" element={<Discover />} />
        <Route path="/saved" element={<Saved />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
        <Route
          path="/viewings"
          element={
            <RequireAuth>
              <Viewings />
            </RequireAuth>
          }
        />
        <Route
          path="/issues"
          element={
            <RequireAuth>
              <Issues />
            </RequireAuth>
          }
        />
        <Route
          path="/manage-listings"
          element={
            <RequireAuth role="landlord">
              <ManageListings />
            </RequireAuth>
          }
        />
        <Route
          path="/manage-listings/new"
          element={
            <RequireAuth role="landlord">
              <PropertyFormPage />
            </RequireAuth>
          }
        />
        <Route
          path="/manage-listings/:id/edit"
          element={
            <RequireAuth role="landlord">
              <PropertyFormPage />
            </RequireAuth>
          }
        />
        <Route
          path="/trader-profile"
          element={
            <RequireAuth role="tradesperson">
              <TraderProfilePage />
            </RequireAuth>
          }
        />
        <Route path="/settings" element={<Settings />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

function NotFound() {
  return (
    <main className="not-found" data-testid="not-found">
      <p>That page doesn't exist.</p>
    </main>
  );
}

export default App;

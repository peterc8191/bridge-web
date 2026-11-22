import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { RequireAuth } from "./RequireAuth";
import { AppDataContext } from "../context/appDataContext";
import { makeAppData } from "../test/appData";
import type { AuthUser } from "../types/auth";
import type { UserRole } from "../types/auth";
import { landlord, tenant } from "../test/fixtures";

function LoginProbe() {
  const location = useLocation();
  return <div data-testid="login">from:{(location.state as { from?: string } | null)?.from}</div>;
}

function renderGuard(currentUser: AuthUser | null, role?: UserRole) {
  render(
    <AppDataContext.Provider value={makeAppData({ currentUser })}>
      <MemoryRouter initialEntries={["/secret"]}>
        <Routes>
          <Route
            path="/secret"
            element={
              <RequireAuth role={role}>
                <p>secret content</p>
              </RequireAuth>
            }
          />
          <Route path="/login" element={<LoginProbe />} />
          <Route path="/" element={<p>home</p>} />
        </Routes>
      </MemoryRouter>
    </AppDataContext.Provider>,
  );
}

describe("RequireAuth", () => {
  it("sends signed-out users to /login, remembering where they were going", () => {
    renderGuard(null);
    expect(screen.getByTestId("login")).toHaveTextContent("from:/secret");
  });

  it("renders the page for any signed-in user when no role is required", () => {
    renderGuard(tenant);
    expect(screen.getByText("secret content")).toBeInTheDocument();
  });

  it("sends users without the required role home", () => {
    renderGuard(tenant, "landlord");
    expect(screen.getByText("home")).toBeInTheDocument();
  });

  it("renders the page for the required role", () => {
    renderGuard(landlord, "landlord");
    expect(screen.getByText("secret content")).toBeInTheDocument();
  });
});

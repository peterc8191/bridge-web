// End-to-end-style tests through the real AppDataProvider (real hooks,
// localStorage, permission rules) and the seeded accounts in src/data.
import { describe, expect, it } from "vitest";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import { AppDataProvider } from "./context/AppDataProvider";

function renderApp(route = "/") {
  render(
    <MemoryRouter initialEntries={[route]}>
      <AppDataProvider>
        <App />
      </AppDataProvider>
    </MemoryRouter>,
  );
}

async function logIn(email: string) {
  const form = within(await screen.findByTestId("login-form"));
  await userEvent.type(form.getByLabelText(/email/i), email);
  await userEvent.type(form.getByLabelText(/password/i), "password123");
  await userEvent.click(form.getByRole("button", { name: /^log in$/i }));
  await waitFor(() => expect(screen.queryByTestId("login-form")).not.toBeInTheDocument());
}

async function logOutAndIn(email: string, then: string) {
  // The desktop nav row renders a Log out button.
  await userEvent.click(screen.getAllByRole("button", { name: /^log out$/i })[0]);
  await userEvent.click(screen.getAllByRole("link", { name: /^log in$/i })[0]);
  await logIn(email);
  await userEvent.click(screen.getAllByRole("link", { name: new RegExp(`^${then}`, "i") })[0]);
}

describe("App (integration)", () => {
  it("sends a guest to log in for Issues, then back to Issues afterwards", async () => {
    renderApp("/issues");
    expect(screen.getByTestId("login-form")).toBeInTheDocument();

    await logIn("usera@abc.com");
    expect(await screen.findByTestId("issue-list")).toBeInTheDocument();
  });

  it("keeps landlord-only pages away from other roles", async () => {
    renderApp("/login");
    await logIn("usera@abc.com");
    cleanup();

    // Same browser session (localStorage), fresh page load on a landlord URL.
    renderApp("/manage-listings");
    expect(screen.queryByRole("heading", { name: /your listings/i })).not.toBeInTheDocument();
    expect(screen.getByTestId("filter-bar")).toBeInTheDocument(); // bounced to Discover
  });

  it("shows each landlord only their own listings", async () => {
    renderApp("/login");
    await logIn("landlorda@abc.com");
    await userEvent.click(screen.getAllByRole("link", { name: /manage listings/i })[0]);

    const items = within(await screen.findByTestId("manage-listings-list")).getAllByRole("listitem");
    expect(items).toHaveLength(6); // p1-p6 in src/data/properties.ts
  });

  it("runs report -> tender -> accept across roles, visible only to the right people", async () => {
    renderApp("/login");

    // Tenant reports on the rental they live in (p3, owned by landlord A).
    await logIn("usera@abc.com");
    await userEvent.click(screen.getAllByRole("link", { name: /^issues/i })[0]);
    await userEvent.click(screen.getByRole("button", { name: /report an issue/i }));
    await userEvent.selectOptions(screen.getByLabelText(/property/i), "p3");
    await userEvent.type(screen.getByLabelText(/title/i), "Mould in bathroom");
    await userEvent.type(screen.getByLabelText(/description/i), "Black spots on the ceiling.");
    await userEvent.click(screen.getByRole("button", { name: /report issue/i }));
    expect(screen.getByText("Mould in bathroom")).toBeInTheDocument();

    // Trader serving Denver quotes on it.
    await logOutAndIn("tradea@abc.com", "issues");
    const issue = () => screen.getByText("Mould in bathroom").closest("li")!;
    await userEvent.click(within(issue()).getByRole("button", { name: /your quote/i }));
    await userEvent.type(within(issue()).getByLabelText(/quote amount/i), "320");
    await userEvent.type(within(issue()).getByLabelText(/message/i), "Can treat it Friday.");
    await userEvent.click(within(issue()).getByRole("button", { name: /tender a quote/i }));
    expect(within(issue()).getByText(/already tendered/i)).toBeInTheDocument();

    // The other landlord doesn't own p3, so never sees it.
    await logOutAndIn("landlordb@abc.com", "issues");
    expect(screen.queryByText("Mould in bathroom")).not.toBeInTheDocument();

    // The owning landlord sees the quote, accepts it, and updates the status.
    await logOutAndIn("landlorda@abc.com", "issues");
    await userEvent.click(within(issue()).getByRole("button", { name: /tenders \(1\)/i }));
    expect(within(issue()).getByText("$320")).toBeInTheDocument();
    await userEvent.click(within(issue()).getByRole("button", { name: /accept tender/i }));
    expect(within(issue()).getByText("Accepted")).toBeInTheDocument();
    await userEvent.selectOptions(within(issue()).getByLabelText(/status for/i), "in-progress");
    expect(within(issue()).getByLabelText(/status for/i)).toHaveValue("in-progress");
  });

  it("keeps saved listings separate per account", async () => {
    renderApp("/");
    await userEvent.click(screen.getByRole("button", { name: /save this property/i }));
    expect(await screen.findAllByRole("link", { name: /saved \(1\)/i })).not.toHaveLength(0);

    await userEvent.click(screen.getAllByRole("link", { name: /^log in$/i })[0]);
    await logIn("usera@abc.com");
    expect(screen.queryAllByRole("link", { name: /saved \(/i })).toHaveLength(0);
  });

  it("shows a not-found page for unknown routes", () => {
    renderApp("/nope");
    expect(screen.getByTestId("not-found")).toBeInTheDocument();
  });
});

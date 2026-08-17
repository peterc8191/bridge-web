import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { NavBar } from "./NavBar";

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location-probe">{location.pathname}</div>;
}

function renderNavBar(
  initialPath = "/",
  counts: { savedCount?: number; issueCount?: number; viewingCount?: number } = {},
) {
  const { savedCount = 0, issueCount = 0, viewingCount = 0 } = counts;
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <NavBar savedCount={savedCount} issueCount={issueCount} viewingCount={viewingCount} />
      <LocationProbe />
    </MemoryRouter>,
  );
}

describe("NavBar", () => {
  it("renders the Bridge logo as the brand image", () => {
    renderNavBar();
    expect(screen.getByRole("img", { name: "Bridge" })).toBeInTheDocument();
  });

  it("shows Discover, Saved, Viewings, Issues, and Settings links without counts when zero", () => {
    renderNavBar();
    expect(screen.getByRole("link", { name: "Discover" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Saved" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Viewings" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Issues" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Settings" })).toBeInTheDocument();
  });

  it("shows counts next to Saved, Viewings, and Issues when non-zero", () => {
    renderNavBar("/", { savedCount: 3, issueCount: 5, viewingCount: 2 });
    expect(screen.getByRole("link", { name: "Saved (3)" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Viewings (2)" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Issues (5)" })).toBeInTheDocument();
  });

  it("links to /issues", () => {
    renderNavBar();
    expect(screen.getByRole("link", { name: "Issues" })).toHaveAttribute("href", "/issues");
  });

  it("links to /viewings", () => {
    renderNavBar();
    expect(screen.getByRole("link", { name: "Viewings" })).toHaveAttribute("href", "/viewings");
  });

  it("links to /settings", () => {
    renderNavBar();
    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute("href", "/settings");
  });

  describe("More menu (mobile)", () => {
    it("shows 'More' on the button when on Discover, and is closed by default", () => {
      renderNavBar("/");
      const button = screen.getByRole("button", { name: /^more/i });
      expect(button).toHaveAttribute("aria-expanded", "false");
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("shows the active route's label on the button instead of 'More'", () => {
      renderNavBar("/issues");
      expect(screen.getByRole("button", { name: /^issues/i })).toBeInTheDocument();
    });

    it("opens the menu on click, listing Saved, Viewings, Issues, and Settings with counts", async () => {
      renderNavBar("/", { savedCount: 2, issueCount: 4, viewingCount: 1 });
      await userEvent.click(screen.getByRole("button", { name: /^more/i }));

      const menu = screen.getByRole("menu");
      expect(within(menu).getByRole("menuitem", { name: "Saved (2)" })).toBeInTheDocument();
      expect(within(menu).getByRole("menuitem", { name: "Viewings (1)" })).toBeInTheDocument();
      expect(within(menu).getByRole("menuitem", { name: "Issues (4)" })).toBeInTheDocument();
      expect(within(menu).getByRole("menuitem", { name: "Settings" })).toBeInTheDocument();
    });

    it("navigates and closes the menu when a menu item is selected", async () => {
      renderNavBar("/");
      await userEvent.click(screen.getByRole("button", { name: /^more/i }));
      await userEvent.click(screen.getByRole("menuitem", { name: "Settings" }));

      expect(screen.getByTestId("location-probe")).toHaveTextContent("/settings");
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("closes the menu when Escape is pressed", async () => {
      renderNavBar("/");
      await userEvent.click(screen.getByRole("button", { name: /^more/i }));
      expect(screen.getByRole("menu")).toBeInTheDocument();

      await userEvent.keyboard("{Escape}");
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("closes the menu when clicking outside it", async () => {
      renderNavBar("/");
      await userEvent.click(screen.getByRole("button", { name: /^more/i }));
      expect(screen.getByRole("menu")).toBeInTheDocument();

      await userEvent.click(document.body);
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
  });
});

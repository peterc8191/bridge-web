import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Settings } from "./Settings";
import { renderWithAppData } from "../test/appData";
import { landlord, tenant } from "../test/fixtures";

describe("Settings page", () => {
  afterEach(() => vi.restoreAllMocks());

  describe("Account section", () => {
    it("shows a signed-out prompt with links to log in or register", () => {
      renderWithAppData(<Settings />);
      expect(screen.getByText(/you're not signed in/i)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /^log in$/i })).toHaveAttribute("href", "/login");
      expect(screen.getByRole("link", { name: /create an account/i })).toHaveAttribute("href", "/register");
    });

    it("shows the signed-in email and role, and logs out", async () => {
      const { data } = renderWithAppData(<Settings />, { data: { currentUser: landlord } });
      expect(screen.getByText(landlord.email)).toBeInTheDocument();
      expect(screen.getByText("Landlord")).toBeInTheDocument();
      await userEvent.click(screen.getByRole("button", { name: /log out/i }));
      expect(data.logout).toHaveBeenCalled();
    });
  });

  it("shows the resolved theme only while following the system", () => {
    const { unmount } = renderWithAppData(<Settings />, { data: { theme: "system", resolvedTheme: "dark" } });
    expect(screen.getByText(/currently using dark/i)).toBeInTheDocument();
    unmount();

    renderWithAppData(<Settings />, { data: { theme: "light" } });
    expect(screen.queryByText(/currently using/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Light")).toBeChecked();
  });

  it("changes theme and reduce-motion", async () => {
    const { data } = renderWithAppData(<Settings />);
    await userEvent.click(screen.getByLabelText("Dark"));
    expect(data.setTheme).toHaveBeenCalledWith("dark");
    await userEvent.click(screen.getByLabelText(/reduce motion/i));
    expect(data.setReduceMotion).toHaveBeenCalledWith(true);
  });

  it("resets saved/passed properties only after confirmation", async () => {
    vi.spyOn(window, "confirm").mockReturnValueOnce(false).mockReturnValueOnce(true);
    const { data } = renderWithAppData(<Settings />);
    const button = screen.getByRole("button", { name: /reset saved/i });

    await userEvent.click(button);
    expect(data.resetDeck).not.toHaveBeenCalled();
    await userEvent.click(button);
    expect(data.resetDeck).toHaveBeenCalled();
  });

  it("clears the signed-in user's own issues only after confirmation", async () => {
    vi.spyOn(window, "confirm").mockReturnValueOnce(false).mockReturnValueOnce(true);
    const { data } = renderWithAppData(<Settings />, { data: { currentUser: tenant } });
    const button = screen.getByRole("button", { name: /clear issues i've reported/i });

    await userEvent.click(button);
    expect(data.clearMyIssues).not.toHaveBeenCalled();
    await userEvent.click(button);
    expect(data.clearMyIssues).toHaveBeenCalled();
    expect(screen.getByText(/applies to tenant@test.com only/i)).toBeInTheDocument();
  });

  it("hides the clear-issues action for guests", () => {
    renderWithAppData(<Settings />);
    expect(screen.queryByRole("button", { name: /clear issues/i })).not.toBeInTheDocument();
  });
});

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { TraderProfilePage } from "./TraderProfilePage";
import type { AuthUser } from "../types/auth";
import type { TraderProfile } from "../types/traderProfile";

const trader: AuthUser = { id: "u3", email: "tradea@abc.com", role: "tradesperson" };
const genericUser: AuthUser = { id: "u2", email: "usera@abc.com", role: "user" };
const emptyProfile: TraderProfile = { services: [], areas: [], bio: "" };
const filledProfile: TraderProfile = {
  services: ["Plumbing", "Electrical"],
  areas: ["Portland, OR"],
  bio: "Experienced handyman.",
};

function renderPage(
  currentUser: AuthUser | null,
  profile: TraderProfile = emptyProfile,
  onUpdateProfile = vi.fn(),
) {
  return render(
    <MemoryRouter initialEntries={["/trader-profile"]}>
      <Routes>
        <Route
          path="/trader-profile"
          element={
            <TraderProfilePage
              currentUser={currentUser}
              profile={profile}
              onUpdateProfile={onUpdateProfile}
            />
          }
        />
        <Route path="/" element={<div>Home page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("TraderProfilePage", () => {
  it("redirects home for a non-tradesperson", () => {
    renderPage(genericUser);
    expect(screen.getByText("Home page")).toBeInTheDocument();
  });

  it("redirects home when logged out", () => {
    renderPage(null);
    expect(screen.getByText("Home page")).toBeInTheDocument();
  });

  it("pre-fills fields from the existing profile", () => {
    renderPage(trader, filledProfile);
    expect(screen.getByLabelText(/bio/i)).toHaveValue(filledProfile.bio);
    expect(screen.getByLabelText(/services offered/i)).toHaveValue("Plumbing\nElectrical");
    expect(screen.getByLabelText(/areas serviced/i)).toHaveValue("Portland, OR");
  });

  it("submits the parsed services/areas lists and trimmed bio", async () => {
    const onUpdateProfile = vi.fn();
    renderPage(trader, emptyProfile, onUpdateProfile);

    await userEvent.type(screen.getByLabelText(/bio/i), "  New bio  ");
    await userEvent.type(screen.getByLabelText(/services offered/i), "Painting{Enter}Roofing");
    await userEvent.type(screen.getByLabelText(/areas serviced/i), "Denver, CO");
    await userEvent.click(screen.getByRole("button", { name: /save profile/i }));

    expect(onUpdateProfile).toHaveBeenCalledWith({
      bio: "New bio",
      services: ["Painting", "Roofing"],
      areas: ["Denver, CO"],
    });
  });

  it("shows a confirmation after saving", async () => {
    renderPage(trader, emptyProfile);
    await userEvent.click(screen.getByRole("button", { name: /save profile/i }));
    expect(await screen.findByRole("status")).toHaveTextContent(/profile saved/i);
  });
});

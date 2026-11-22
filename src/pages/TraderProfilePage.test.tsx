import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TraderProfilePage } from "./TraderProfilePage";
import { renderWithAppData } from "../test/appData";
import { trader } from "../test/fixtures";

const profile = { services: ["Plumbing", "Electrical"], areas: ["Portland, OR"], bio: "Handy." };

function renderPage() {
  return renderWithAppData(<TraderProfilePage />, { data: { currentUser: trader, traderProfile: profile } });
}

describe("TraderProfilePage", () => {
  it("pre-fills fields from the existing profile", () => {
    renderPage();
    expect(screen.getByLabelText(/bio/i)).toHaveValue("Handy.");
    expect(screen.getByLabelText(/services/i)).toHaveValue("Plumbing\nElectrical");
    expect(screen.getByLabelText(/areas/i)).toHaveValue("Portland, OR");
  });

  it("submits the parsed lists and trimmed bio, then confirms", async () => {
    const { data } = renderPage();
    await userEvent.clear(screen.getByLabelText(/bio/i));
    await userEvent.type(screen.getByLabelText(/bio/i), "  Licensed.  ");
    await userEvent.type(screen.getByLabelText(/areas/i), "{Enter}{Enter}  Seattle, WA ");
    await userEvent.click(screen.getByRole("button", { name: /save profile/i }));

    expect(data.updateTraderProfile).toHaveBeenCalledWith({
      bio: "Licensed.",
      services: ["Plumbing", "Electrical"],
      areas: ["Portland, OR", "Seattle, WA"],
    });
    expect(screen.getByRole("status")).toHaveTextContent(/profile saved/i);
  });

  it("explains that areas decide which issues they see", () => {
    renderPage();
    expect(screen.getByText(/only see issues in the areas/i)).toBeInTheDocument();
  });
});

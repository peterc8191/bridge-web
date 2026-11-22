import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Issues } from "./Issues";
import { renderWithAppData } from "../test/appData";
import { landlord, makeIssue, makeProperty, tenant, trader } from "../test/fixtures";

const rental = makeProperty({ id: "p1", listingType: "rent", tenantEmails: [tenant.email] });

describe("Issues page", () => {
  it("tells a tenant with no rentals how to get set up", () => {
    renderWithAppData(<Issues />, { data: { currentUser: tenant } });
    expect(screen.getByTestId("issue-form-empty")).toHaveTextContent(/properties you rent/i);
  });

  it("lets a tenant report an issue on a property they rent", async () => {
    const { data } = renderWithAppData(<Issues />, {
      data: { currentUser: tenant, properties: [rental], reportableProperties: [rental] },
    });

    await userEvent.click(screen.getByRole("button", { name: /report an issue/i }));
    await userEvent.selectOptions(screen.getByLabelText(/property/i), "p1");
    await userEvent.type(screen.getByLabelText(/title/i), "No hot water");
    await userEvent.type(screen.getByLabelText(/description/i), "Since Monday.");
    await userEvent.click(screen.getByRole("button", { name: /report issue/i }));

    expect(data.addIssue).toHaveBeenCalledWith({
      propertyId: "p1",
      title: "No hot water",
      description: "Since Monday.",
    });
  });

  it("hides the report form from a landlord who doesn't rent anywhere", () => {
    renderWithAppData(<Issues />, { data: { currentUser: landlord } });
    expect(screen.queryByTestId("issue-form-empty")).not.toBeInTheDocument();
    expect(screen.queryByTestId("issue-form")).not.toBeInTheDocument();
    expect(screen.getByText(/issues reported on your listings/i)).toBeInTheDocument();
  });

  it("lets the owning landlord change an issue's status", async () => {
    const { data } = renderWithAppData(<Issues />, {
      data: { currentUser: landlord, properties: [rental], issues: [makeIssue({ id: "i1" })] },
    });
    await userEvent.selectOptions(screen.getByLabelText(/status for/i), "in-progress");
    expect(data.updateIssueStatus).toHaveBeenCalledWith("i1", "in-progress");
  });

  it("tells a trader which areas they're seeing issues for", () => {
    renderWithAppData(<Issues />, {
      data: { currentUser: trader, traderProfile: { services: [], areas: ["Portland, OR"], bio: "" } },
    });
    expect(screen.getByTestId("trader-areas-note")).toHaveTextContent("Portland, OR");
  });

  it("points a trader with no areas to their profile", () => {
    renderWithAppData(<Issues />, { data: { currentUser: trader } });
    expect(screen.getByRole("link", { name: /trader profile/i })).toHaveAttribute("href", "/trader-profile");
  });

  it("lets a trader quote on an issue in their area", async () => {
    const { data } = renderWithAppData(<Issues />, {
      data: {
        currentUser: trader,
        properties: [rental],
        issues: [makeIssue({ id: "i1", propertyId: "p1" })],
        traderProfile: { services: ["Plumbing"], areas: ["Portland, OR"], bio: "" },
      },
    });

    await userEvent.click(screen.getByRole("button", { name: /your quote/i }));
    await userEvent.type(screen.getByLabelText(/quote amount/i), "200");
    await userEvent.type(screen.getByLabelText(/message/i), "Tomorrow AM");
    await userEvent.click(screen.getByRole("button", { name: /tender a quote/i }));

    expect(data.addTender).toHaveBeenCalledWith({ issueId: "i1", amount: 200, message: "Tomorrow AM" });
  });
});

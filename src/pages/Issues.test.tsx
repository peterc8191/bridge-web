import { useState } from "react";
import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Issues } from "./Issues";
import type { Issue, NewIssueInput } from "../types/issue";
import type { Property } from "../types/property";

const savedProperty: Property = {
  id: "p1",
  address: "142 Maple Street",
  city: "Portland, OR",
  price: 549000,
  beds: 3,
  baths: 2,
  sqft: 1650,
  description: "A house.",
  images: ["https://example.com/1.jpg"],
};

// Mirrors how App.tsx wires useIssues' state through to the Issues page.
function StatefulIssues({ saved }: { saved: Property[] }) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const addIssue = (input: NewIssueInput) => {
    setIssues((prev) => [
      ...prev,
      { ...input, id: `issue-${prev.length}`, status: "open", createdAt: new Date().toISOString() },
    ]);
  };
  return <Issues saved={saved} issues={issues} onAddIssue={addIssue} />;
}

describe("Issues page", () => {
  it("shows the empty-state hint when nothing is saved and no issues exist", () => {
    render(<Issues saved={[]} issues={[]} onAddIssue={() => {}} />);
    expect(screen.getByTestId("issue-form-empty")).toBeInTheDocument();
    expect(screen.getByTestId("issue-list-empty")).toBeInTheDocument();
  });

  it("reporting an issue through the form makes it appear in the list", async () => {
    render(<StatefulIssues saved={[savedProperty]} />);

    await userEvent.click(screen.getByRole("button", { name: /report an issue/i }));
    await userEvent.selectOptions(screen.getByLabelText(/property/i), savedProperty.id);
    await userEvent.type(screen.getByLabelText(/title/i), "Cracked window");
    await userEvent.type(screen.getByLabelText(/description/i), "Hairline crack in the living room window.");
    await userEvent.click(screen.getByRole("button", { name: /^report issue$/i }));

    const list = screen.getByTestId("issue-list");
    expect(within(list).getByText("Cracked window")).toBeInTheDocument();
    expect(within(list).getByText("Open")).toBeInTheDocument();
    expect(within(list).getByText(savedProperty.address)).toBeInTheDocument();
  });
});

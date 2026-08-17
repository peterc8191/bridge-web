import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IssueForm } from "./IssueForm";
import type { Property } from "../types/property";

const property: Property = {
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

function expandForm() {
  return userEvent.click(screen.getByRole("button", { name: /report an issue/i }));
}

describe("IssueForm", () => {
  it("shows an empty-state hint instead of the form when there are no properties to report against", () => {
    render(<IssueForm properties={[]} onSubmit={vi.fn()} />);
    expect(screen.getByTestId("issue-form-empty")).toBeInTheDocument();
    expect(screen.queryByTestId("issue-form")).not.toBeInTheDocument();
  });

  it("starts collapsed, hiding the form fields", () => {
    render(<IssueForm properties={[property]} onSubmit={vi.fn()} />);
    expect(screen.queryByLabelText(/property/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /report an issue/i })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("expands to show the form fields when the toggle is clicked", async () => {
    render(<IssueForm properties={[property]} onSubmit={vi.fn()} />);
    await expandForm();
    expect(screen.getByLabelText(/property/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /report an issue/i })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("collapses again on a second click", async () => {
    render(<IssueForm properties={[property]} onSubmit={vi.fn()} />);
    await expandForm();
    await expandForm();
    expect(screen.queryByLabelText(/property/i)).not.toBeInTheDocument();
  });

  it("lists the given properties in the property select", async () => {
    render(<IssueForm properties={[property]} onSubmit={vi.fn()} />);
    await expandForm();
    expect(screen.getByRole("option", { name: property.address })).toBeInTheDocument();
  });

  it("submits with trimmed values and resets the form", async () => {
    const onSubmit = vi.fn();
    render(<IssueForm properties={[property]} onSubmit={onSubmit} />);
    await expandForm();

    await userEvent.selectOptions(screen.getByLabelText(/property/i), property.id);
    await userEvent.type(screen.getByLabelText(/title/i), "  Leaking faucet  ");
    await userEvent.type(screen.getByLabelText(/description/i), "  Drips constantly  ");
    await userEvent.click(screen.getByRole("button", { name: /^report issue$/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      propertyId: property.id,
      title: "Leaking faucet",
      description: "Drips constantly",
    });
    expect(screen.getByLabelText(/title/i)).toHaveValue("");
    expect(screen.getByLabelText(/description/i)).toHaveValue("");
  });

  it("does not submit when title or description is blank", async () => {
    const onSubmit = vi.fn();
    render(<IssueForm properties={[property]} onSubmit={onSubmit} />);
    await expandForm();

    await userEvent.selectOptions(screen.getByLabelText(/property/i), property.id);
    await userEvent.click(screen.getByRole("button", { name: /^report issue$/i }));

    expect(onSubmit).not.toHaveBeenCalled();
  });
});

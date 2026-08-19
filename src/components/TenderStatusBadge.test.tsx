import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { TenderStatusBadge } from "./TenderStatusBadge";

describe("TenderStatusBadge", () => {
  it.each([
    ["pending", "Pending"],
    ["accepted", "Accepted"],
    ["rejected", "Rejected"],
  ] as const)("renders the label for status '%s'", (status, label) => {
    render(<TenderStatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { NavBar } from "./NavBar";

describe("NavBar", () => {
  it("renders the Bridge logo as the brand image", () => {
    render(
      <MemoryRouter>
        <NavBar savedCount={0} issueCount={0} />
      </MemoryRouter>,
    );
    expect(screen.getByRole("img", { name: "Bridge" })).toBeInTheDocument();
  });

  it("shows Discover, Saved, Issues, and Settings links without counts when zero", () => {
    render(
      <MemoryRouter>
        <NavBar savedCount={0} issueCount={0} />
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: "Discover" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Saved" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Issues" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Settings" })).toBeInTheDocument();
  });

  it("shows counts next to Saved and Issues when non-zero", () => {
    render(
      <MemoryRouter>
        <NavBar savedCount={3} issueCount={5} />
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: "Saved (3)" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Issues (5)" })).toBeInTheDocument();
  });

  it("links to /issues", () => {
    render(
      <MemoryRouter>
        <NavBar savedCount={0} issueCount={0} />
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: "Issues" })).toHaveAttribute("href", "/issues");
  });

  it("links to /settings", () => {
    render(
      <MemoryRouter>
        <NavBar savedCount={0} issueCount={0} />
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute("href", "/settings");
  });
});

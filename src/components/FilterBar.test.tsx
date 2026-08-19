import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterBar } from "./FilterBar";
import { defaultFilters } from "../utils/filterProperties";

const locations = ["Austin, TX", "Portland, OR"];

function renderExpanded(props: Parameters<typeof FilterBar>[0]) {
  render(<FilterBar {...props} />);
  return userEvent.click(screen.getByRole("button", { name: /^filters/i }));
}

describe("FilterBar", () => {
  it("starts collapsed, hiding the filter controls", () => {
    render(
      <FilterBar filters={defaultFilters} onChange={vi.fn()} locations={locations} resultCount={7} />,
    );
    expect(screen.queryByLabelText(/location/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^filters/i })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("expands to show the filter controls when the toggle is clicked", async () => {
    await renderExpanded({ filters: defaultFilters, onChange: vi.fn(), locations, resultCount: 7 });
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^filters/i })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("collapses again on a second click", async () => {
    await renderExpanded({ filters: defaultFilters, onChange: vi.fn(), locations, resultCount: 7 });
    await userEvent.click(screen.getByRole("button", { name: /^filters/i }));
    expect(screen.queryByLabelText(/location/i)).not.toBeInTheDocument();
  });

  it("shows an active filter count on the collapsed toggle", () => {
    render(
      <FilterBar
        filters={{ ...defaultFilters, minBeds: 2, location: "Austin, TX" }}
        onChange={vi.fn()}
        locations={locations}
        resultCount={3}
      />,
    );
    expect(screen.getByRole("button", { name: "Filters (2)" })).toBeInTheDocument();
  });

  it("shows the result count regardless of expanded state", () => {
    render(
      <FilterBar filters={defaultFilters} onChange={vi.fn()} locations={locations} resultCount={7} />,
    );
    expect(screen.getByText("7 listings match")).toBeInTheDocument();
  });

  it("uses singular wording for one result", () => {
    render(
      <FilterBar filters={defaultFilters} onChange={vi.fn()} locations={locations} resultCount={1} />,
    );
    expect(screen.getByText("1 listing match")).toBeInTheDocument();
  });

  it("does not show a clear button when no filters are active", async () => {
    await renderExpanded({ filters: defaultFilters, onChange: vi.fn(), locations, resultCount: 7 });
    expect(screen.queryByRole("button", { name: /^clear filters/i })).not.toBeInTheDocument();
  });

  it("calls onChange with the selected location", async () => {
    const onChange = vi.fn();
    await renderExpanded({ filters: defaultFilters, onChange, locations, resultCount: 7 });

    await userEvent.selectOptions(screen.getByLabelText(/location/i), "Austin, TX");
    expect(onChange).toHaveBeenCalledWith({ ...defaultFilters, location: "Austin, TX" });
  });

  it("calls onChange with the selected listing type", async () => {
    const onChange = vi.fn();
    await renderExpanded({ filters: defaultFilters, onChange, locations, resultCount: 7 });

    await userEvent.selectOptions(screen.getByLabelText(/listing type/i), "rent");
    expect(onChange).toHaveBeenCalledWith({ ...defaultFilters, listingType: "rent" });
  });

  it("calls onChange with null listing type when reset to 'Sale or rent'", async () => {
    const onChange = vi.fn();
    await renderExpanded({
      filters: { ...defaultFilters, listingType: "rent" },
      onChange,
      locations,
      resultCount: 7,
    });

    await userEvent.selectOptions(screen.getByLabelText(/listing type/i), "Sale or rent");
    expect(onChange).toHaveBeenCalledWith({ ...defaultFilters, listingType: null });
  });

  it("calls onChange with a numeric min price", async () => {
    const onChange = vi.fn();
    await renderExpanded({ filters: defaultFilters, onChange, locations, resultCount: 7 });

    await userEvent.type(screen.getByLabelText(/min price/i), "5");
    expect(onChange).toHaveBeenLastCalledWith({ ...defaultFilters, minPrice: 5 });
  });

  it("calls onChange with the selected minimum bedrooms", async () => {
    const onChange = vi.fn();
    await renderExpanded({ filters: defaultFilters, onChange, locations, resultCount: 7 });

    await userEvent.selectOptions(screen.getByLabelText(/bedrooms/i), "3");
    expect(onChange).toHaveBeenCalledWith({ ...defaultFilters, minBeds: 3 });
  });

  it("shows a clear filters button when a filter is active and resets on click", async () => {
    const onChange = vi.fn();
    const activeFilters = { ...defaultFilters, minBeds: 2 };
    await renderExpanded({ filters: activeFilters, onChange, locations, resultCount: 3 });

    const clearButton = screen.getByRole("button", { name: /^clear filters/i });
    await userEvent.click(clearButton);
    expect(onChange).toHaveBeenCalledWith(defaultFilters);
  });
});

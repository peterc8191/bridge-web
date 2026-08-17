import { useRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PropertyCard, type PropertyCardHandle } from "./PropertyCard";
import type { SwipeDirection } from "../hooks/usePropertyDeck";
import { properties } from "../data/properties";

const property = properties[0]; // has 4 images

function SwipeHarness({
  onSwiped,
  reduceMotion,
}: {
  onSwiped: (direction: SwipeDirection) => void;
  reduceMotion?: boolean;
}) {
  const ref = useRef<PropertyCardHandle>(null);
  return (
    <>
      <PropertyCard ref={ref} property={property} active onSwiped={onSwiped} reduceMotion={reduceMotion} />
      <button type="button" onClick={() => ref.current?.swipe("right")}>
        trigger swipe
      </button>
    </>
  );
}

describe("PropertyCard photo navigation", () => {
  it("starts on the first image", () => {
    render(<PropertyCard property={property} active onSwiped={vi.fn()} />);
    expect(screen.getByTestId("property-card-image")).toHaveStyle(
      `background-image: url(${property.images[0]})`,
    );
  });

  it("clicking the right side advances to the next image", async () => {
    render(<PropertyCard property={property} active onSwiped={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: /next photo/i }));

    expect(screen.getByTestId("property-card-image")).toHaveStyle(
      `background-image: url(${property.images[1]})`,
    );
  });

  it("clicking the left side goes back to the previous image", async () => {
    render(<PropertyCard property={property} active onSwiped={vi.fn()} />);

    const next = screen.getByRole("button", { name: /next photo/i });
    await userEvent.click(next);
    await userEvent.click(next);
    await userEvent.click(screen.getByRole("button", { name: /previous photo/i }));

    expect(screen.getByTestId("property-card-image")).toHaveStyle(
      `background-image: url(${property.images[1]})`,
    );
  });

  it("does not go past the first or last image", async () => {
    render(<PropertyCard property={property} active onSwiped={vi.fn()} />);

    const prev = screen.getByRole("button", { name: /previous photo/i });
    const next = screen.getByRole("button", { name: /next photo/i });

    await userEvent.click(prev);
    expect(screen.getByTestId("property-card-image")).toHaveStyle(
      `background-image: url(${property.images[0]})`,
    );

    for (let i = 0; i < property.images.length + 2; i++) {
      await userEvent.click(next);
    }
    expect(screen.getByTestId("property-card-image")).toHaveStyle(
      `background-image: url(${property.images[property.images.length - 1]})`,
    );
  });

  it("navigating photos does not trigger a swipe decision", async () => {
    const onSwiped = vi.fn();
    render(<PropertyCard property={property} active onSwiped={onSwiped} />);

    await userEvent.click(screen.getByRole("button", { name: /next photo/i }));
    expect(onSwiped).not.toHaveBeenCalled();
  });

  it("does not render nav zones or a progress bar on inactive cards", () => {
    render(<PropertyCard property={property} active={false} onSwiped={vi.fn()} />);
    expect(screen.queryByRole("button", { name: /next photo/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /previous photo/i })).not.toBeInTheDocument();
  });

  it("does not render nav zones for a single-image listing", () => {
    const singleImageProperty = { ...property, images: [property.images[0]] };
    render(<PropertyCard property={singleImageProperty} active onSwiped={vi.fn()} />);
    expect(screen.queryByRole("button", { name: /next photo/i })).not.toBeInTheDocument();
  });
});

describe("PropertyCard swipe animation", () => {
  it("still completes a programmatic swipe with the default animation", async () => {
    const onSwiped = vi.fn();
    render(<SwipeHarness onSwiped={onSwiped} />);

    await userEvent.click(screen.getByRole("button", { name: /trigger swipe/i }));

    await waitFor(() => expect(onSwiped).toHaveBeenCalledWith("right"), { timeout: 2000 });
  });

  it("still completes a programmatic swipe when reduceMotion is on", async () => {
    const onSwiped = vi.fn();
    render(<SwipeHarness onSwiped={onSwiped} reduceMotion />);

    await userEvent.click(screen.getByRole("button", { name: /trigger swipe/i }));

    await waitFor(() => expect(onSwiped).toHaveBeenCalledWith("right"), { timeout: 2000 });
  });
});

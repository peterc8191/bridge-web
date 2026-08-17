import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ViewingForm } from "./ViewingForm";

function fillDateAndTime(date: string, time: string) {
  fireEvent.change(screen.getByLabelText(/date/i), { target: { value: date } });
  fireEvent.change(screen.getByLabelText(/time/i), { target: { value: time } });
}

describe("ViewingForm", () => {
  it("submits date, time, and trimmed note for the given property", async () => {
    const onSubmit = vi.fn();
    render(<ViewingForm propertyId="p1" onSubmit={onSubmit} />);

    fillDateAndTime("2026-09-10", "14:30");
    await userEvent.type(screen.getByLabelText(/note/i), "  after 2pm please  ");
    await userEvent.click(screen.getByRole("button", { name: /request viewing/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      propertyId: "p1",
      date: "2026-09-10",
      time: "14:30",
      note: "after 2pm please",
    });
  });

  it("submits with an empty note when none is given", async () => {
    const onSubmit = vi.fn();
    render(<ViewingForm propertyId="p1" onSubmit={onSubmit} />);

    fillDateAndTime("2026-09-10", "14:30");
    await userEvent.click(screen.getByRole("button", { name: /request viewing/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      propertyId: "p1",
      date: "2026-09-10",
      time: "14:30",
      note: "",
    });
  });

  it("does not submit without a date and time", async () => {
    const onSubmit = vi.fn();
    render(<ViewingForm propertyId="p1" onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole("button", { name: /request viewing/i }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows a confirmation message after a successful request and resets the fields", async () => {
    render(<ViewingForm propertyId="p1" onSubmit={vi.fn()} />);

    fillDateAndTime("2026-09-10", "14:30");
    await userEvent.click(screen.getByRole("button", { name: /request viewing/i }));

    expect(screen.getByRole("status")).toHaveTextContent(/viewing requested/i);
    expect(screen.getByLabelText(/date/i)).toHaveValue("");
    expect(screen.getByLabelText(/time/i)).toHaveValue("");
  });
});

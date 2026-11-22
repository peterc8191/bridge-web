import { describe, expect, it } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StorageErrorBanner } from "./StorageErrorBanner";
import { STORAGE_ERROR_EVENT } from "../lib/storage";

describe("StorageErrorBanner", () => {
  it("is hidden until a write fails, then can be dismissed", async () => {
    render(<StorageErrorBanner />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new CustomEvent(STORAGE_ERROR_EVENT));
    });
    expect(screen.getByRole("alert")).toHaveTextContent(/couldn't be saved/i);

    await userEvent.click(screen.getByRole("button", { name: /dismiss/i }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

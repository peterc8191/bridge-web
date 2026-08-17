import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Settings } from "./Settings";

function renderSettings(overrides: Partial<Parameters<typeof Settings>[0]> = {}) {
  const props = {
    theme: "system" as const,
    onThemeChange: vi.fn(),
    resolvedTheme: "light" as const,
    reduceMotion: false,
    onReduceMotionChange: vi.fn(),
    onResetProperties: vi.fn(),
    onClearIssues: vi.fn(),
    ...overrides,
  };
  render(<Settings {...props} />);
  return props;
}

describe("Settings page", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the current resolved theme when set to 'system'", () => {
    renderSettings({ theme: "system", resolvedTheme: "dark" });
    expect(screen.getByText(/currently using dark based on your system/i)).toBeInTheDocument();
  });

  it("does not show the resolved-theme hint when a theme is explicitly chosen", () => {
    renderSettings({ theme: "light" });
    expect(screen.queryByText(/currently using/i)).not.toBeInTheDocument();
  });

  it("calls onThemeChange when a theme option is selected", async () => {
    const props = renderSettings({ theme: "system" });
    await userEvent.click(screen.getByRole("radio", { name: "Dark" }));
    expect(props.onThemeChange).toHaveBeenCalledWith("dark");
  });

  it("reflects the current theme selection", () => {
    renderSettings({ theme: "dark" });
    expect(screen.getByRole("radio", { name: "Dark" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Light" })).not.toBeChecked();
  });

  it("calls onReduceMotionChange when the checkbox is toggled", async () => {
    const props = renderSettings({ reduceMotion: false });
    await userEvent.click(screen.getByRole("checkbox", { name: /reduce motion/i }));
    expect(props.onReduceMotionChange).toHaveBeenCalledWith(true);
  });

  it("resets properties only after the user confirms", async () => {
    const props = renderSettings();
    vi.spyOn(window, "confirm").mockReturnValue(false);
    await userEvent.click(screen.getByRole("button", { name: /reset saved & passed properties/i }));
    expect(props.onResetProperties).not.toHaveBeenCalled();

    vi.spyOn(window, "confirm").mockReturnValue(true);
    await userEvent.click(screen.getByRole("button", { name: /reset saved & passed properties/i }));
    expect(props.onResetProperties).toHaveBeenCalledTimes(1);
  });

  it("clears issues only after the user confirms", async () => {
    const props = renderSettings();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    await userEvent.click(screen.getByRole("button", { name: /clear reported issues/i }));
    expect(props.onClearIssues).toHaveBeenCalledTimes(1);
  });
});

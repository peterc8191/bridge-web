import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Register } from "./Register";
import { renderWithAppData } from "../test/appData";
import { tenant } from "../test/fixtures";

async function fill(password = "password123", confirm = password) {
  await userEvent.type(screen.getByLabelText(/email/i), "new@example.com");
  await userEvent.type(screen.getByLabelText(/^password/i), password);
  await userEvent.type(screen.getByLabelText(/confirm password/i), confirm);
  await userEvent.click(screen.getByRole("button", { name: /create account/i }));
}

describe("Register", () => {
  it("redirects home if already logged in", () => {
    renderWithAppData(<Register />, { path: "/register", data: { currentUser: tenant } });
    expect(screen.getByTestId("location")).toHaveTextContent("/");
  });

  it("shows an error and does not register when passwords don't match", async () => {
    const { data } = renderWithAppData(<Register />, { path: "/register" });
    await fill("password123", "different1");
    expect(screen.getByRole("alert")).toHaveTextContent(/don't match/i);
    expect(data.register).not.toHaveBeenCalled();
  });

  it("submits matching credentials and navigates home on success", async () => {
    const { data } = renderWithAppData(<Register />, { path: "/register" });
    await fill();
    expect(data.register).toHaveBeenCalledWith("new@example.com", "password123");
    expect(await screen.findByTestId("location")).toHaveTextContent(/^\/$/);
  });

  it("returns to the page that required sign-in", async () => {
    renderWithAppData(<Register />, { path: "/register", state: { from: "/viewings" } });
    await fill();
    expect(await screen.findByTestId("location")).toHaveTextContent("/viewings");
  });

  it("shows the returned error and stays on the page when registration fails", async () => {
    const register = vi.fn(async () => ({ ok: false as const, error: "An account with this email already exists." }));
    renderWithAppData(<Register />, { path: "/register", data: { register } });
    await fill();
    expect(await screen.findByRole("alert")).toHaveTextContent(/already exists/i);
  });

  it("links to the login page", () => {
    renderWithAppData(<Register />, { path: "/register" });
    expect(screen.getByRole("link", { name: /log in/i })).toHaveAttribute("href", "/login");
  });
});

import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Login } from "./Login";
import { renderWithAppData } from "../test/appData";
import { tenant } from "../test/fixtures";

async function submit(email = "usera@abc.com", password = "password123") {
  await userEvent.type(screen.getByLabelText(/email/i), email);
  await userEvent.type(screen.getByLabelText(/password/i), password);
  await userEvent.click(screen.getByRole("button", { name: /log in/i }));
}

describe("Login", () => {
  it("redirects home if already logged in", () => {
    renderWithAppData(<Login />, { path: "/login", data: { currentUser: tenant } });
    expect(screen.getByTestId("location")).toHaveTextContent("/");
  });

  it("submits the entered email and password", async () => {
    const { data } = renderWithAppData(<Login />, { path: "/login" });
    await submit();
    expect(data.login).toHaveBeenCalledWith("usera@abc.com", "password123");
  });

  it("navigates home on success", async () => {
    renderWithAppData(<Login />, { path: "/login" });
    await submit();
    expect(await screen.findByTestId("location")).toHaveTextContent(/^\/$/);
  });

  it("returns to the page that required sign-in", async () => {
    renderWithAppData(<Login />, { path: "/login", state: { from: "/issues" } });
    await submit();
    expect(await screen.findByTestId("location")).toHaveTextContent("/issues");
  });

  it("shows the error and stays on the page when login fails", async () => {
    const login = vi.fn(async () => ({ ok: false as const, error: "Invalid email or password." }));
    renderWithAppData(<Login />, { path: "/login", data: { login } });
    await submit("x@y.com", "wrong");
    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email or password.");
    expect(screen.queryByTestId("location")).not.toBeInTheDocument();
  });

  it("links to the register page", () => {
    renderWithAppData(<Login />, { path: "/login" });
    expect(screen.getByRole("link", { name: /create one/i })).toHaveAttribute("href", "/register");
  });
});

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Login } from "./Login";
import type { AuthResult, AuthUser } from "../types/auth";

function renderLogin(currentUser: AuthUser | null, onLogin: (email: string, password: string) => Promise<AuthResult>) {
  return render(
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route path="/login" element={<Login currentUser={currentUser} onLogin={onLogin} />} />
        <Route path="/" element={<div>Home page</div>} />
        <Route path="/register" element={<div>Register page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("Login", () => {
  it("redirects to home if already logged in", () => {
    renderLogin({ id: "u1", email: "user@example.com", role: "user" }, vi.fn());
    expect(screen.getByText("Home page")).toBeInTheDocument();
    expect(screen.queryByTestId("login-form")).not.toBeInTheDocument();
  });

  it("submits the entered email and password", async () => {
    const onLogin = vi.fn().mockResolvedValue({ ok: true });
    renderLogin(null, onLogin);

    await userEvent.type(screen.getByLabelText(/email/i), "user@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "password123");
    await userEvent.click(screen.getByRole("button", { name: /^log in$/i }));

    expect(onLogin).toHaveBeenCalledWith("user@example.com", "password123");
  });

  it("navigates home on success", async () => {
    const onLogin = vi.fn().mockResolvedValue({ ok: true });
    renderLogin(null, onLogin);

    await userEvent.type(screen.getByLabelText(/email/i), "user@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "password123");
    await userEvent.click(screen.getByRole("button", { name: /^log in$/i }));

    expect(await screen.findByText("Home page")).toBeInTheDocument();
  });

  it("shows the error and stays on the page when login fails", async () => {
    const onLogin = vi.fn().mockResolvedValue({ ok: false, error: "Invalid email or password." });
    renderLogin(null, onLogin);

    await userEvent.type(screen.getByLabelText(/email/i), "user@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "wrong-password");
    await userEvent.click(screen.getByRole("button", { name: /^log in$/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email or password.");
    expect(screen.getByTestId("login-form")).toBeInTheDocument();
  });

  it("links to the register page", () => {
    renderLogin(null, vi.fn());
    expect(screen.getByRole("link", { name: /create one/i })).toHaveAttribute("href", "/register");
  });
});

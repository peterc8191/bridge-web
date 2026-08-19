import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Register } from "./Register";
import type { AuthResult, AuthUser } from "../types/auth";

function renderRegister(
  currentUser: AuthUser | null,
  onRegister: (email: string, password: string) => Promise<AuthResult>,
) {
  return render(
    <MemoryRouter initialEntries={["/register"]}>
      <Routes>
        <Route path="/register" element={<Register currentUser={currentUser} onRegister={onRegister} />} />
        <Route path="/" element={<div>Home page</div>} />
        <Route path="/login" element={<div>Login page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("Register", () => {
  it("redirects to home if already logged in", () => {
    renderRegister({ id: "u1", email: "user@example.com", role: "user" }, vi.fn());
    expect(screen.getByText("Home page")).toBeInTheDocument();
    expect(screen.queryByTestId("register-form")).not.toBeInTheDocument();
  });

  it("shows an error and does not call onRegister when passwords don't match", async () => {
    const onRegister = vi.fn();
    renderRegister(null, onRegister);

    await userEvent.type(screen.getByLabelText(/^email/i), "user@example.com");
    await userEvent.type(screen.getByLabelText(/^password/i), "password123");
    await userEvent.type(screen.getByLabelText(/confirm password/i), "different123");
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/don't match/i);
    expect(onRegister).not.toHaveBeenCalled();
  });

  it("submits matching credentials and navigates home on success", async () => {
    const onRegister = vi.fn().mockResolvedValue({ ok: true });
    renderRegister(null, onRegister);

    await userEvent.type(screen.getByLabelText(/^email/i), "user@example.com");
    await userEvent.type(screen.getByLabelText(/^password/i), "password123");
    await userEvent.type(screen.getByLabelText(/confirm password/i), "password123");
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(onRegister).toHaveBeenCalledWith("user@example.com", "password123");
    expect(await screen.findByText("Home page")).toBeInTheDocument();
  });

  it("shows the server-provided error and stays on the page when registration fails", async () => {
    const onRegister = vi.fn().mockResolvedValue({
      ok: false,
      error: "An account with this email already exists.",
    });
    renderRegister(null, onRegister);

    await userEvent.type(screen.getByLabelText(/^email/i), "user@example.com");
    await userEvent.type(screen.getByLabelText(/^password/i), "password123");
    await userEvent.type(screen.getByLabelText(/confirm password/i), "password123");
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/already exists/i);
    expect(screen.getByTestId("register-form")).toBeInTheDocument();
  });

  it("links to the login page", () => {
    renderRegister(null, vi.fn());
    expect(screen.getByRole("link", { name: /log in/i })).toHaveAttribute("href", "/login");
  });
});

import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAppData } from "../context/appDataContext";
import { redirectTarget } from "../utils/redirectTarget";
import "./AuthForm.css";

export function Login() {
  const { currentUser, login: onLogin } = useAppData();
  const navigate = useNavigate();
  const location = useLocation();
  const target = redirectTarget(location.state);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (currentUser) {
    return <Navigate to={target} replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await onLogin(email, password);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate(target, { replace: true });
  };

  return (
    <main className="auth-form-page">
      <form className="auth-form" onSubmit={handleSubmit} data-testid="login-form">
        <h1>Log in</h1>

        <label className="auth-form__field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label className="auth-form__field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {error && (
          <p className="auth-form__error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="auth-form__submit" disabled={submitting}>
          {submitting ? "Logging in…" : "Log in"}
        </button>

        <p className="auth-form__switch">
          Don't have an account? <Link to="/register" state={location.state}>
            Create one
          </Link>
        </p>
      </form>
    </main>
  );
}

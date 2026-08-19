import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import shortLogo from "../assets/short-logo.png";
import type { AuthUser } from "../types/auth";
import "./NavBar.css";

interface NavBarProps {
  savedCount: number;
  issueCount: number;
  viewingCount: number;
  currentUser: AuthUser | null;
  onLogout: () => void;
}

type MoreEntry =
  | { kind: "link"; path: string; label: string }
  | { kind: "action"; label: string; onSelect: () => void };

const linkClassName = ({ isActive }: { isActive: boolean }) =>
  isActive ? "nav-bar__link nav-bar__link--active" : "nav-bar__link";

export function NavBar({ savedCount, issueCount, viewingCount, currentUser, onLogout }: NavBarProps) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const moreEntries: MoreEntry[] = [
    { kind: "link", path: "/saved", label: `Saved${savedCount > 0 ? ` (${savedCount})` : ""}` },
    { kind: "link", path: "/viewings", label: `Viewings${viewingCount > 0 ? ` (${viewingCount})` : ""}` },
    { kind: "link", path: "/issues", label: `Issues${issueCount > 0 ? ` (${issueCount})` : ""}` },
    ...(currentUser?.role === "landlord"
      ? [{ kind: "link", path: "/manage-listings", label: "Manage listings" } as const]
      : []),
    ...(currentUser?.role === "tradesperson"
      ? [{ kind: "link", path: "/trader-profile", label: "Trader profile" } as const]
      : []),
    { kind: "link", path: "/settings", label: "Settings" },
    currentUser
      ? { kind: "action", label: "Log out", onSelect: onLogout }
      : { kind: "link", path: "/login", label: "Log in" },
  ];
  const activeMoreEntry = moreEntries.find(
    (entry) =>
      entry.kind === "link" &&
      (entry.path === location.pathname || location.pathname.startsWith(`${entry.path}/`)),
  );

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <header className="nav-bar">
      <img src={shortLogo} alt="Bridge" className="nav-bar__brand" />
      <nav className="nav-bar__links" aria-label="Primary">
        <NavLink to="/" end className={linkClassName}>
          Discover
        </NavLink>

        <span className="nav-bar__desktop-links">
          {moreEntries.map((entry) =>
            entry.kind === "link" ? (
              <NavLink key={entry.path} to={entry.path} className={linkClassName}>
                {entry.label}
              </NavLink>
            ) : (
              <button
                key={entry.label}
                type="button"
                className="nav-bar__link nav-bar__action-link"
                onClick={entry.onSelect}
              >
                {entry.label}
              </button>
            ),
          )}
        </span>

        <div className="nav-bar__more" ref={containerRef}>
          <button
            type="button"
            className={
              activeMoreEntry
                ? "nav-bar__link nav-bar__link--active nav-bar__more-button"
                : "nav-bar__link nav-bar__more-button"
            }
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {activeMoreEntry ? activeMoreEntry.label : "More"}
            <span className="nav-bar__chevron" aria-hidden="true">
              {open ? "▲" : "▼"}
            </span>
          </button>

          {open && (
            <div className="nav-bar__more-menu" role="menu">
              {moreEntries.map((entry) =>
                entry.kind === "link" ? (
                  <NavLink
                    key={entry.path}
                    to={entry.path}
                    role="menuitem"
                    className={({ isActive }) =>
                      isActive
                        ? "nav-bar__more-menu-item nav-bar__more-menu-item--active"
                        : "nav-bar__more-menu-item"
                    }
                  >
                    {entry.label}
                  </NavLink>
                ) : (
                  <button
                    key={entry.label}
                    type="button"
                    role="menuitem"
                    className="nav-bar__more-menu-item"
                    onClick={() => {
                      entry.onSelect();
                      setOpen(false);
                    }}
                  >
                    {entry.label}
                  </button>
                ),
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

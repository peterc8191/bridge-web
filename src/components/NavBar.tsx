import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import shortLogo from "../assets/short-logo.png";
import "./NavBar.css";

interface NavBarProps {
  savedCount: number;
  issueCount: number;
  viewingCount: number;
}

const linkClassName = ({ isActive }: { isActive: boolean }) =>
  isActive ? "nav-bar__link nav-bar__link--active" : "nav-bar__link";

export function NavBar({ savedCount, issueCount, viewingCount }: NavBarProps) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const moreLinks = [
    { path: "/saved", label: `Saved${savedCount > 0 ? ` (${savedCount})` : ""}` },
    { path: "/viewings", label: `Viewings${viewingCount > 0 ? ` (${viewingCount})` : ""}` },
    { path: "/issues", label: `Issues${issueCount > 0 ? ` (${issueCount})` : ""}` },
    { path: "/settings", label: "Settings" },
  ];
  const activeMoreLink = moreLinks.find((link) => link.path === location.pathname);

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
          {moreLinks.map((link) => (
            <NavLink key={link.path} to={link.path} className={linkClassName}>
              {link.label}
            </NavLink>
          ))}
        </span>

        <div className="nav-bar__more" ref={containerRef}>
          <button
            type="button"
            className={
              activeMoreLink
                ? "nav-bar__link nav-bar__link--active nav-bar__more-button"
                : "nav-bar__link nav-bar__more-button"
            }
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {activeMoreLink ? activeMoreLink.label : "More"}
            <span className="nav-bar__chevron" aria-hidden="true">
              {open ? "▲" : "▼"}
            </span>
          </button>

          {open && (
            <div className="nav-bar__more-menu" role="menu">
              {moreLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  role="menuitem"
                  className={({ isActive }) =>
                    isActive
                      ? "nav-bar__more-menu-item nav-bar__more-menu-item--active"
                      : "nav-bar__more-menu-item"
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

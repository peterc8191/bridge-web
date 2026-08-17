import { NavLink } from "react-router-dom";
import shortLogo from "../assets/short-logo.png";
import "./NavBar.css";

interface NavBarProps {
  savedCount: number;
  issueCount: number;
}

export function NavBar({ savedCount, issueCount }: NavBarProps) {
  return (
    <header className="nav-bar">
      <img src={shortLogo} alt="Bridge" className="nav-bar__brand" />
      <nav className="nav-bar__links">
        <NavLink to="/" end className={({ isActive }) => (isActive ? "nav-bar__link nav-bar__link--active" : "nav-bar__link")}>
          Discover
        </NavLink>
        <NavLink to="/saved" className={({ isActive }) => (isActive ? "nav-bar__link nav-bar__link--active" : "nav-bar__link")}>
          Saved{savedCount > 0 ? ` (${savedCount})` : ""}
        </NavLink>
        <NavLink to="/issues" className={({ isActive }) => (isActive ? "nav-bar__link nav-bar__link--active" : "nav-bar__link")}>
          Issues{issueCount > 0 ? ` (${issueCount})` : ""}
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => (isActive ? "nav-bar__link nav-bar__link--active" : "nav-bar__link")}>
          Settings
        </NavLink>
      </nav>
    </header>
  );
}

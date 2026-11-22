import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppData } from "../context/appDataContext";
import type { UserRole } from "../types/auth";

interface RequireAuthProps {
  children: ReactNode;
  /** Only this role may see the route; other signed-in users go home. */
  role?: UserRole;
}

/** Route guard: signed-out users go to /login (and come back after). */
export function RequireAuth({ children, role }: RequireAuthProps) {
  const { currentUser } = useAppData();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (role && currentUser.role !== role) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import TicketSpinner from "./TicketSpinner";
import { getDashboardPath } from "../utils/roleRouting";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const location = useLocation();

  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("forsa_token");
    
    if (token) {
      const decoded = parseJwt(token);
      let role = "Attendee";
      if (decoded) {
        const roleClaim = 
          decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || 
          decoded.role || 
          decoded.Role;
        role = Array.isArray(roleClaim) ? roleClaim[0] : (roleClaim || "Attendee");
      }
      setIsAuthenticated(true);
      setUserRole(role);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <TicketSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!userRole || !allowedRoles.includes(userRole)) {
      // Role not allowed
      return <Navigate to={getDashboardPath(userRole)} replace />;
    }
  }

  return <>{children}</>;
}

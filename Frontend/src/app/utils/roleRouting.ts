export function getUserRole(): string | null {
  const token = localStorage.getItem("forsa_token");
  if (!token) return localStorage.getItem("role");

  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((char) => "%" + ("00" + char.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const decoded = JSON.parse(jsonPayload);
    const roleClaim =
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      decoded.role ||
      decoded.Role ||
      localStorage.getItem("role");

    return Array.isArray(roleClaim) ? roleClaim[0] : roleClaim || null;
  } catch {
    return localStorage.getItem("role");
  }
}

export function getDashboardPath(role?: string | null): string {
  const normalizedRole = role || getUserRole();

  if (normalizedRole === "Admin") {
    return "/admin";
  }

  if (normalizedRole === "Owner" || normalizedRole === "PlaceOwner") {
    return "/owner";
  }

  if (normalizedRole === "Organizer") {
    return "/organizer";
  }

  return "/dashboard";
}

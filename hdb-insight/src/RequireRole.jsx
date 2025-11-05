// src/RequireRole.jsx
import { Navigate } from "react-router-dom";

export default function RequireRole({ role, children }) {
  const r = localStorage.getItem("role"); // "admin" or "user"
  if (r !== role) {
    // bounce to the right home for whatever you are
    if (r === "admin") return <Navigate to="/admin-dashboard" replace />;
    if (r === "user")  return <Navigate to="/dashboard" replace />;
    return <Navigate to="/" replace />; // not logged in
  }
  return children;
}

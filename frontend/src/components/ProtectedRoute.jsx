import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem("token");
  let role = localStorage.getItem("role");

  // Normalize undefined/null string flags to "user" to prevent infinite routing loops
  if (!role || role === "undefined" || role === "null" || role !== "admin") {
    role = "user";
  }

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Admins are permitted to access any route
  if (role === "admin") {
    return children;
  }

  // Handle role mismatch for non-admin users
  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  // Otherwise, render the protected component securely
  return children;
}

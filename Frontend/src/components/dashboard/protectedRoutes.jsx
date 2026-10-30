
import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoute = ({ role }) => {
  const tokenKey =
    role === "student"
      ? "studentToken"
      : role === "recruiter"
        ? "recruiterToken"
        : role === "admin"
          ? "adminToken"
          : null;

  const token = tokenKey
    ? sessionStorage.getItem(tokenKey)
    : null;

  // Redirect if the user has no token
  if (!token) {
    return (
      <Navigate
        to={role === "admin" ? "/admin/login" : "/roleSelection"}
        replace
      />
    );
  }

  // Allow access to nested dashboard routes
  return <Outlet />;
};

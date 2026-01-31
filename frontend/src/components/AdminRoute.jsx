import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/authContext";
import { getUserRole } from "../utils/jwt";

export default function AdminRoute({ children }) {
  const { token } = useContext(AuthContext);

  if (!token) {
    return <Navigate to="/" replace />;
  }

  const role = getUserRole(token);

  if (role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

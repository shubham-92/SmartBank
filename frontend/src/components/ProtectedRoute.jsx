import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getDashboard } from "../api/dashboardApi";

export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState("loading");
  const location = useLocation();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await getDashboard();

        if (!res.data.kyc_completed) {
          setStatus("kyc");
        } else if (!res.data.account) {
          setStatus("account");
        } else {
          setStatus("ok");
        }
      } catch {
        setStatus("login");
      }
    };

    checkStatus();
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Checking access...
      </div>
    );
  }

  if (status === "login") {
    return <Navigate to="/" replace />;
  }

  if (status === "kyc" && location.pathname !== "/kyc") {
    return <Navigate to="/kyc" replace />;
  }

  if (status === "account" && location.pathname !== "/create-account") {
    return <Navigate to="/create-account" replace />;
  }

  return children;
}

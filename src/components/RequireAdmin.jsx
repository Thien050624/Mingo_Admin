import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";
import LoadingIndicator from "./common/LoadingIndicator";

export default function RequireAdmin({ children }) {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-zm-bg bg-noise flex items-center justify-center">
        <LoadingIndicator />
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

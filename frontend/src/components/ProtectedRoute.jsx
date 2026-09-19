import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Wrap a page in this to require login, optionally restricted to specific roles:
// <ProtectedRoute roles={["seller"]}><SellerDashboard /></ProtectedRoute>
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

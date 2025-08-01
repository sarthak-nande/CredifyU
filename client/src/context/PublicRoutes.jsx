// src/components/ProtectedRoute.jsx
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const PublicRoutes = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.user.isLoggedIn);
  return !isAuthenticated ? children : <Navigate to="/college/dashboard" replace />;
};

export default PublicRoutes;

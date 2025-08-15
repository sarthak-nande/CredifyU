import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const AuthLayout = ({ children }) => {
  const isAuthenticated = useSelector(state => state.user.isLoggedIn);
  const isAuthChecked = useSelector(state => state.user.isAuthChecked);
  
  if (!isAuthChecked) return <h1>Loading...</h1>;

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default AuthLayout;

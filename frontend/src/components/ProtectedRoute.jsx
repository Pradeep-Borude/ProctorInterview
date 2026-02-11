import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// check for user credentials, we can not access till we login or register
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  // If not logged in
  if (!user) {
    return <Navigate to="/user/login" replace />;
  }

  // If logged in
  return children;
};

// check if user is already logged in, redirect to dashboard if already logged in
const UserAlreadyLoggedIn = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  // If logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // If not logged in
  return children;
};

export {
  ProtectedRoute,
  UserAlreadyLoggedIn
};

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

// For protected routes that need login:
export const useRedirectIfNotAuthenticated = (redirectUrl = "/login") => {
  const authState = useSelector((state) => state.auth);
  const navigate = useNavigate();
  useEffect(() => {
    if (!authState.isAuthenticated) navigate(redirectUrl);
  }, [authState.isAuthenticated, navigate, redirectUrl]);
  return authState;
};

// For routes like /log-in and /sign-up that redirect to home (/ route) if already logged in:
export const useRedirectIfAuthenticated = (redirectUrl = "/") => {
  const authState = useSelector((state) => state.auth);
  const navigate = useNavigate();
  useEffect(() => {
    if (authState.isAuthenticated) navigate(redirectUrl);
  }, [authState.isAuthenticated, navigate, redirectUrl]);
  return authState;
};

export const useRedirectToCorrectHome = () => {
  const authState = useSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    // Redirect / to correct home page (/users or /organizations):
    if (location.pathname === "/") {
      if (authState.entityType === "User") navigate("/users");
      else if (authState.entityType === "Organization") navigate("/organizations");
    }
    // Redirect unauthorized routes:
    if (location.pathname.startsWith("/organizations") && authState.entityType === "User")
      navigate("/users");
    if (location.pathname.startsWith("/users") && authState.entityType === "Organization")
      navigate("/organizations");
  }, [authState.entityType, location.pathname, navigate]);
};

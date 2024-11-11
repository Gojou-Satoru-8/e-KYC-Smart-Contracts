import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

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

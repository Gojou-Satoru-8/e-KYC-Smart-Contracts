import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

// For protected routes that need login:
export const useRedirectIfNotAuthenticated = (redirectUrl = "/") => {
  const authState = useSelector((state) => state.auth);
  const navigate = useNavigate();
  useEffect(() => {
    if (!authState.isAuthenticated) navigate(redirectUrl);
  }, [authState.isAuthenticated, navigate, redirectUrl]);
  return authState;
};

// For routes like /login and /signup that should redirect to home (/ route) if already logged in
// Once redirected, the redirectToCorrectHome hook is used to carry the entity to the appropriate home=page
export const useRedirectIfAuthenticated = (redirectUrl = "/") => {
  const authState = useSelector((state) => state.auth);
  const navigate = useNavigate();
  useEffect(() => {
    if (authState.isAuthenticated) navigate(redirectUrl);
  }, [authState.isAuthenticated, navigate, redirectUrl]);
  return authState;
};

// Redirects authenticated entities to their correct home-pages:
export const useRedirectToCorrectHome = () => {
  const authState = useSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (!authState.isAuthenticated) return;

    // (1) Redirect / to correct home page (/users or /organizations or /verifiers):
    if (location.pathname === "/") {
      if (authState.entityType === "User") navigate("/users");
      else if (authState.entityType === "Organization") navigate("/organizations");
      else if (authState.entityType === "Verifier") navigate("/verifiers");
    }

    // (2) Redirect unauthorized entities:
    // if (location.pathname.startsWith("/organizations") && authState.entityType !== "Organization")
    //   navigate(`/${authState.entityType}s`);
    // if (location.pathname.startsWith("/users") && authState.entityType !== "User")
    //   navigate(`/${authState.entityType}s`);
    // if (location.pathname.startsWith("/verifiers") && authState.entityType !== "Verifier")
    //   navigate(`/${authState.entityType}s`);
    // NOTE: Above logic simplified:
    if (!location.pathname.startsWith(`/${authState.entityType.toLowerCase()}s`))
      navigate(`/${authState.entityType}s`);
  }, [authState.isAuthenticated, authState.entityType, location.pathname, navigate]);
};

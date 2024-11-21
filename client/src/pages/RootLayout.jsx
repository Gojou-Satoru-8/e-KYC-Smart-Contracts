import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/Header";
import { useRedirectIfNotAuthenticated, useRedirectToCorrectHome } from "../hooks/checkAuthHooks";
import usePopulateDocuments from "../hooks/usePopulateDocuments";
const RootLayout = () => {
  // Redirects to Landing Page if not logged in
  const authState = useRedirectIfNotAuthenticated();
  const documentsState = usePopulateDocuments(authState.entityType);
  // Redirects authenticated entities to their appropriate home-page: /users | /verifiers | /organizations
  useRedirectToCorrectHome();

  return (
    <>
      <Header />
      <Outlet context={authState} />
      {/* <Footer /> */}
    </>
  );
};

export default RootLayout;

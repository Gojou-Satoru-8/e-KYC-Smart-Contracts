import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/Header";
import { useRedirectIfNotAuthenticated, useRedirectToCorrectHome } from "../hooks/checkAuthHooks";
import usePopulateDocuments from "../hooks/usePopulateDocuments";
const RootLayout = () => {
  const authState = useRedirectIfNotAuthenticated();
  const documentsState = usePopulateDocuments(authState.entityType);
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

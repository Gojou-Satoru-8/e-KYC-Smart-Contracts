import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import { useRedirectIfNotAuthenticated } from "../hooks/checkAuthHooks";
const RootLayout = () => {
  const authState = useRedirectIfNotAuthenticated();

  return (
    <>
      <Header />
      <Outlet context={authState} />
      {/* <Outlet /> */}
      {/* <Footer /> */}
    </>
  );
};

export default RootLayout;

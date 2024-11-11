import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, Card, CardHeader, CardBody, CardFooter, Tabs, Tab } from "@nextui-org/react";
import Header from "../components/Header";
import { authActions } from "../store";
import { useRedirectIfAuthenticated } from "../hooks/checkAuthHooks";
import LoginFormUser from "../components/LoginFormUser";
import LoginFormOrganization from "../components/LoginFormOrganization";

const LoginPage = () => {
  //   const navigate = useNavigate();
  //   const dispatch = useDispatch();

  const location = useLocation();
  // console.log("Location/Navigation messages: ", location.state);
  const navigateMessage = location.state?.message;
  // Messages coming from navigate("/log-in", {state: {message: "..."}})

  const [uiElements, setUIElements] = useState({
    loading: false,
    message: navigateMessage || "",
    error: "",
  });
  const [selectedForm, setSelectedForm] = useState("User"); // "User" / "Organization"

  const authState = useRedirectIfAuthenticated(`/${selectedForm.toLowerCase()}s`);

  const setTimeNotification = ({ message = "", error = "" }, seconds = 0) => {
    const timeout = setTimeout(() => {
      setUIElements({ loading: false, message, error });
    }, seconds * 1000);
    return timeout;
  };

  const toggleSelectedForm = () => {
    setSelectedForm((prev) => (prev === "User" ? "Organization" : "User"));
  };

  useEffect(() => {
    if (uiElements.message || uiElements.error) {
      const timeout = setTimeNotification({}, 4);
      return () => clearTimeout(timeout);
    }
  }, [uiElements.message, uiElements.error]);

  return (
    <>
      <Header />
      <main className="h-[80vh] overflow-auto">
        <Card className="w-[95%] md:w-2/3 lg:w-1/2 mx-auto mt-8" isBlurred>
          <CardHeader className="flex-col justify-center pt-10 px-20 gap-4 text-center">
            <h1 className="text-4xl">{selectedForm} Log In</h1>
            {uiElements.loading && (
              <div className="bg-primary rounded py-2 px-4">
                <p>Validating... Please wait!</p>
              </div>
            )}
            {uiElements.message && (
              <div className="bg-success rounded py-2 px-4">
                <p>{uiElements.message}</p>
              </div>
            )}
            {uiElements.error && (
              <div className="bg-danger rounded py-2 px-4">
                <p>{uiElements.error}</p>
              </div>
            )}
          </CardHeader>

          <CardBody className="px-10 lg:px-20 justify-center">
            <Tabs
              fullWidth
              size="md"
              aria-label="Tabs form"
              selectedKey={selectedForm}
              onSelectionChange={setSelectedForm}
            >
              <Tab key="User" title="User">
                <LoginFormUser
                  setUIElements={setUIElements}
                  setTimeNotification={setTimeNotification}
                />
              </Tab>
              <Tab key="Organization" title="Organization">
                <LoginFormOrganization
                  setUIElements={setUIElements}
                  setTimeNotification={setTimeNotification}
                />
              </Tab>
            </Tabs>
          </CardBody>
          <CardFooter className="justify-center text-center">
            <div className="my-1 flex flex-col gap-2">
              <p>
                Not a member yet?{" "}
                <Link to="/signup" className="text-blue-500">
                  Sign Up
                </Link>
              </p>
              <p>
                Forgot Password? Reset it{" "}
                <Link
                  to={`/${selectedForm.toLowerCase()}s/forgot-password`}
                  className="text-blue-500"
                >
                  Here
                </Link>
              </p>
            </div>
          </CardFooter>
        </Card>
      </main>
    </>
  );
};

export default LoginPage;

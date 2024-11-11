import Header from "../components/Header";
import { Card, CardHeader, CardBody, CardFooter, Tabs, Tab } from "@nextui-org/react";
import { useState, useEffect } from "react";
// import { useSelector } from "react-redux";
import { Form, Link, redirect, useActionData, useNavigate } from "react-router-dom";
import SignupFormUser from "../components/SignupFormUser";
import { useRedirectIfAuthenticated } from "../hooks/checkAuthHooks";
import SignupFormOrganization from "../components/SignupFormOrganization";

const SignUpPage = () => {
  // const authState = useSelector((state) => state.auth);
  const authState = useRedirectIfAuthenticated();

  const [uiElements, setUIElements] = useState({ loading: false, message: "", error: "" });
  const [selectedForm, setSelectedForm] = useState("User"); // "User" / "Organization"

  const toggleSelectedForm = () => {
    setSelectedForm((prev) => (prev === "User" ? "Organization" : "User"));
  };

  const setTimeNotification = ({ message = "", error = "" }, seconds = 0) => {
    const timeout = setTimeout(() => {
      setUIElements({ loading: false, message, error });
    }, seconds * 1000);
    return timeout;
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
            <h1 className="text-4xl">{selectedForm} Sign Up</h1>
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
                <SignupFormUser
                  setUIElements={setUIElements}
                  setTimeNotification={setTimeNotification}
                />
              </Tab>
              <Tab key="Organization" title="Organization">
                <SignupFormOrganization
                  setUIElements={setUIElements}
                  setTimeNotification={setTimeNotification}
                />
              </Tab>
            </Tabs>
          </CardBody>
          <CardFooter className="justify-center text-center">
            <div className="my-1 flex flex-col gap-2">
              <p>
                Already a member?{" "}
                <Link to="/login" className="text-blue-500">
                  Log In
                </Link>
              </p>
            </div>
          </CardFooter>
        </Card>
      </main>
    </>
  );
};

export default SignUpPage;

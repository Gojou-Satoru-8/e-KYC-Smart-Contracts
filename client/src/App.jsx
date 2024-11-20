import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import VerifierLoginSignupPage from "./pages/VerifierLoginSignUpPage";
import SignUpPage from "./pages/SignUpPage";
import useGetCurrentUser from "./hooks/useGetCurrentUser";
import ErrorPage from "./pages/ErrorPage";
import RootLayout from "./pages/RootLayout";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import HomePageUser from "./pages/HomePageUser";
import HomePageOrganization from "./pages/HomePageOrganization";
import DocPageUser from "./pages/DocPageUser";
import DocPageVerifier from "./pages/DocPageVerifier";
import NewDocPage from "./pages/NewDocPage";
import UserSettingsPage from "./pages/UserSettingsPage";
import HomePageVerifier from "./pages/HomePageVerifier";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/users",
        children: [
          { index: true, element: <HomePageUser /> },
          { path: "/users/documents/:id", element: <DocPageUser /> },
          { path: "/users/new-document", element: <NewDocPage /> },
          { path: "/users/settings", element: <UserSettingsPage /> },
        ],
      },
      {
        path: "/organizations",
        children: [{ index: true, element: <HomePageOrganization /> }],
      },
      {
        path: "/verifiers",
        children: [
          { index: true, element: <HomePageVerifier /> },
          { path: "/verifiers/documents/:id", element: <DocPageVerifier /> },
        ],
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/verifiers/login",
    element: <VerifierLoginSignupPage />,
  },
  {
    path: "/signup",
    element: <SignUpPage />,
  },
  { path: "/users/forgot-password", element: <ForgotPasswordPage userType={"User"} /> },
  {
    path: "/organizations/forgot-password",
    element: <ForgotPasswordPage userType={"Organization"} />,
  },
  { path: "/verifiers/forgot-password", element: <ForgotPasswordPage userType={"User"} /> },
]);

function App() {
  const authState = useGetCurrentUser();
  // if (authState.loading) return <h1>Loading</h1>;
  // if (authState.loading) return null;
  if (authState.loading) return;

  return <RouterProvider router={router} />;
}

export default App;

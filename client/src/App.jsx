import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import LoginVerifierPage from "./pages/LoginVerifierPage";
import SignUpPage from "./pages/SignUpPage";
import useGetCurrentUser from "./hooks/useGetCurrentUser";
import ErrorPage from "./pages/ErrorPage";
import RootLayout from "./pages/RootLayout";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import HomePage from "./pages/HomePage";
import DocPage from "./pages/DocPage";
import NewDocPage from "./pages/NewDocPage";
import UserSettingsPage from "./pages/UserSettingsPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/users",
        children: [
          { index: true, element: <HomePage /> },
          { path: "/users/documents/:id", element: <DocPage /> },
          { path: "/users/new-document", element: <NewDocPage /> },
          { path: "/users/settings", element: <UserSettingsPage /> },
        ],
      },
      {
        path: "/organizations",
        children: [{ index: true, element: <h1>HomePage</h1> }],
      },
      {
        path: "/verifiers",
        children: [],
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/verifiers/login",
    element: <LoginVerifierPage />,
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
  if (authState.loading) return <h1>Loading</h1>;

  return <RouterProvider router={router} />;
}

export default App;

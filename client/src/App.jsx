import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import { useRedirectIfNotAuthenticated } from "./hooks/checkAuthHooks";
import useGetCurrentUser from "./hooks/useGetCurrentUser";
import ErrorPage from "./pages/ErrorPage";
import RootLayout from "./pages/RootLayout";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/users",
        children: [{ index: true, element: <h1>HomePage</h1> }],
      },
      {
        path: "/organizations",
        children: [{ index: true, element: <h1>HomePage</h1> }],
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
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
]);

function App() {
  const authState = useGetCurrentUser();
  if (authState.loading) return <h1>Loading</h1>;

  return <RouterProvider router={router} />;
}

export default App;

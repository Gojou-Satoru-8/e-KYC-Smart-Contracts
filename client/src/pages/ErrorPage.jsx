// import MainContent from "../components/MainContent";
import Header from "../components/Header";
// import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { useRouteError } from "react-router-dom";

const ErrorPage = () => {
  const error = useRouteError();
  console.log({ error });
  console.log(error.message);

  return (
    <>
      <Header />
      <main className="m-12 p-12 min-h-[80vh] text-center">
        <h1 className="text-4xl py-10">Some Error Occurred</h1>
        {/* <h2 className="text-2xl py-10">
          {error.status}: {error.statusText}
        </h2>
        <p>{error.data}</p> */}
        <h2 className="text-2xl py-10">{error.message}</h2>
        {/* <p>{error.stack}</p> */}
        <p>
          Return to{" "}
          <Link to="/" className="text-blue-500">
            Home Page
          </Link>
        </p>
      </main>
      {/* <Footer /> */}
    </>
  );
};

export default ErrorPage;

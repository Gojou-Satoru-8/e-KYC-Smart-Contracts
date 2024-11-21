import { Form } from "react-router-dom";
import { Input, Button } from "@nextui-org/react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { MailIcon } from "../assets/MailIcon";
import { EyeSlashFilledIcon, EyeFilledIcon } from "../assets/EyeIconsPassword";
import { authActions } from "../store";
import { useState } from "react";

const ORIGIN = import.meta.env.VITE_API_BASE_URL;
const LoginFormVerifier = ({ setUIElements, setTimeNotification }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [eyeIconVisible, setEyeIconVisible] = useState(false);
  // On first load, there won't be any error, only sign up successful message
  // But on subsequent rerenders, when errors will be there, we shall show the errors only

  const toggleEyeIconVisibility = () => setEyeIconVisible((prev) => !prev);
  const handleLoginForm = async (e) => {
    e.preventDefault();

    setUIElements({ loading: true, message: "", error: "" });

    const formData = new FormData(e.target);
    // console.log(formData);
    // for (const [name, value] of formData) {
    //   console.log(name, value);
    // }

    const formDataObj = Object.fromEntries(formData);
    try {
      const response = await fetch(`${ORIGIN}/api/verifiers/login`, {
        method: "POST", // POST
        body: JSON.stringify(formDataObj),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      // console.log(response);

      const data = await response.json();
      // console.log(data);
      // Now we're ready to show the output instead of Loading text
      if (!response.ok || data.status === "fail") {
        setTimeNotification({ error: data.message }, 2);
        return;
      }

      setTimeNotification({ message: data.message }, 1.5);

      dispatch(authActions.setEntity({ entity: data.verifier, entityType: "Verifier" }));
      // setTimeout(() => navigate("/users"), 3000);
    } catch (err) {
      console.log(err.message);
      setTimeNotification({ error: err.message });
    }
  };

  return (
    <Form onSubmit={handleLoginForm} className="flex flex-col gap-4 my-2">
      <Input
        type="email"
        name="email"
        label="Email"
        labelPlacement="outside"
        size="lg"
        endContent={
          <MailIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0 m-auto" />
        }
        required
      ></Input>
      <Input
        type={eyeIconVisible ? "text" : "password"}
        name="password"
        label="Password"
        labelPlacement="outside"
        size="lg"
        endContent={
          <button
            className="focus:outline-none m-auto"
            type="button"
            onClick={toggleEyeIconVisibility}
            aria-label="toggle password visibility"
          >
            {eyeIconVisible ? (
              <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
            ) : (
              <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
            )}
          </button>
        }
        required
      ></Input>
      <div className="flex flex-row justify-center gap-8 pt-2">
        <Button type="reset" color="danger">
          Reset
        </Button>
        <Button type="submit" color="primary">
          Log In
        </Button>
      </div>
    </Form>
  );
};

export default LoginFormVerifier;

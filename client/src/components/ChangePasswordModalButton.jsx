import { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import { Input } from "@nextui-org/react";
import { Form, useNavigate } from "react-router-dom";
import { EyeFilledIcon, EyeSlashFilledIcon } from "../assets/EyeIconsPassword";
import { useDispatch, useSelector } from "react-redux";
import { authActions, documentsActions } from "../store";

const validatePassword = (currentPassword, newPassword) => {
  const errors = [];
  if (currentPassword === newPassword)
    errors.push("Your new password can't match your current one");
  if (newPassword.length < 8 || newPassword.length > 15)
    errors.push("Set a password between 8 and 15 characters");
  // if (!password.search(/(%|_|#)/))
  //   errors.push("Password must include a special character like %, _, #");
  return [...errors];
};

const ChangePasswordModalButton = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [uiElements, setUIElements] = useState({
    loading: false,
    error: "",
    message: "",
    tokenMsg: "",
  });
  const [eyeIconVisible, setEyeIconVisible] = useState({
    token: false,
    currentPassword: false,
    newPassword: false,
  });
  const toggleEyeIconVisibility = (key) => {
    setEyeIconVisible((prev) => {
      // console.log(key, prev[key]);
      return { ...prev, [key]: !prev[key] };
    });
  };

  const setTimeNotification = (
    { loading = false, message = "", error = "", tokenMsg = "" },
    seconds = 0
  ) => {
    const timeout = setTimeout(() => {
      setUIElements({ loading, message, error, tokenMsg });
    }, seconds * 1000);
    return timeout;
  };

  const getTokenMail = async (e) => {
    // setUIElements({
    //   loading: false,
    //   message: "",
    //   error: "",
    //   tokenMsg: "Trying to mail your Token...",
    // });
    setTimeNotification({ tokenMsg: "Trying to mail your Token..." });
    // onOpen(); // Opens the modal
    try {
      const response = await fetch("http://localhost:3000/api/users/generate-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authState.entity.email }),
        // credentials: "include"
      });
      const data = await response.json();
      if (!response.ok || data.status === "fail") {
        setTimeNotification({ error: data.message }, 1.5);
        return;
      }
      setTimeNotification({ tokenMsg: data.message }, 1.5);
    } catch (err) {
      setTimeNotification({ error: err.message });
    }
  };
  const handlePasswordReset = async (e) => {
    // setUIElements({ loading: true, message: "", error: "", tokenMsg: "" });
    setTimeNotification({ loading: true });
    e.preventDefault();
    const formData = new FormData(e.target);
    // for (const [name, value] of formData) {
    //   console.log(name, value);
    // }
    const formDataObj = Object.fromEntries(formData);
    console.log(formDataObj);
    const errors = validatePassword(formDataObj.currentPassword, formDataObj.newPassword);
    if (errors.length > 0) {
      //   setUIElements({ loading: false, message: "", error: errors.join(", ") });
      setTimeNotification({ error: errors.join(". ") });
      return;
    }
    try {
      const response = await fetch("http://localhost:3000/api/users/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formDataObj),
        credentials: "include",
      });

      const data = await response.json();

      if (response.status === 401) {
        dispatch(authActions.unsetEntity());
        dispatch(documentsActions.clearAll()());
        navigate("/login", { state: { message: "Time Out! Please log-in again" } });
        return;
      }

      if (!response.ok || data.status === "fail") {
        setTimeNotification({ error: data.message }, 1.5);
        return;
      }
      //   dispatch(authActions.updateUser({ user: data.user })); // No need as we are not storing password in
      // client state
      // Finally, when successful:
      setTimeNotification({ message: data.message }, 1.5);
    } catch (err) {
      setTimeNotification({ error: "No Internet Connection!" }, 1.5);
    }
  };

  useEffect(() => {
    // setTimeout(() => {
    //   if (uiElements.message || uiElements.error || uiElements.tokenMsg)
    //     setUIElements((prev) => ({ ...prev, message: "", error: "", tokenMsg: "" }));
    // }, 4000);
    if (uiElements.message || uiElements.error || uiElements.tokenMsg) {
      const timeout = setTimeNotification({}, 4);
      return () => clearTimeout(timeout);
    }
  }, [uiElements.message, uiElements.error, uiElements.tokenMsg]);

  return (
    <>
      {/* <Button onPress={onOpen}>Run Code</Button> */}
      <Button color="danger" variant="flat" onPress={onOpen}>
        Update Password
      </Button>
      <Modal
        backdrop="opaque"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        // onClose={cleanupOnCloseModal}
        size="2xl"
        classNames={{
          backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
        }}
      >
        <ModalContent>
          {(closeModal) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Update Your Password</ModalHeader>
              <Form onSubmit={handlePasswordReset}>
                <ModalBody className="flex flex-col gap-4 text-center">
                  {uiElements.loading && (
                    <div className="bg-primary rounded-lg py-2 px-4">
                      <p>Saving! Please wait</p>
                    </div>
                  )}
                  {uiElements.error && (
                    <div className="bg-danger rounded-lg py-2 px-4">
                      <p>{uiElements.error}</p>
                    </div>
                  )}
                  {uiElements.message && (
                    <div className="bg-success rounded-lg py-2 px-4">
                      <p>{uiElements.message}</p>
                    </div>
                  )}

                  {uiElements.tokenMsg && <h3 className="text-lg">{uiElements.tokenMsg}</h3>}

                  <Input
                    type={eyeIconVisible.token ? "text" : "password"}
                    name="token"
                    label="Password Reset Token"
                    endContent={
                      <button
                        className="focus:outline-none m-auto"
                        type="button"
                        onClick={(e) => toggleEyeIconVisibility("token")}
                        aria-label="toggle password visibility"
                      >
                        {eyeIconVisible.token ? (
                          <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                        ) : (
                          <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                        )}
                      </button>
                    }
                    required
                  ></Input>
                  <Input
                    type={eyeIconVisible.currentPassword ? "text" : "password"}
                    name="currentPassword"
                    label="Current Password"
                    endContent={
                      <button
                        className="focus:outline-none m-auto"
                        type="button"
                        onClick={(e) => toggleEyeIconVisibility("currentPassword")}
                        aria-label="toggle password visibility"
                      >
                        {eyeIconVisible.currentPassword ? (
                          <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                        ) : (
                          <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                        )}
                      </button>
                    }
                    required
                  ></Input>
                  <Input
                    type={eyeIconVisible.newPassword ? "text" : "password"}
                    name="newPassword"
                    label="New Password"
                    endContent={
                      <button
                        className="focus:outline-none m-auto"
                        type="button"
                        onClick={(e) => toggleEyeIconVisibility("newPassword")}
                        aria-label="toggle password visibility"
                      >
                        {eyeIconVisible.newPassword ? (
                          <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                        ) : (
                          <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                        )}
                      </button>
                    }
                    required
                  ></Input>
                </ModalBody>
                <ModalFooter>
                  <Button type="button" color="success" variant="light" onClick={getTokenMail}>
                    Get Token
                  </Button>
                  <Button type="submit" color="primary" variant="light">
                    Change Password
                  </Button>
                  {/* {!uiElements.loading && (
                    <Button type="button" color="danger" variant="light" onPress={closeModal}>
                      Cancel
                    </Button>
                  )} */}
                </ModalFooter>
              </Form>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default ChangePasswordModalButton;

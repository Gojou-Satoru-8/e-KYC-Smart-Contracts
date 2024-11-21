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

const ORIGIN = import.meta.env.VITE_API_BASE_URL;
const validatePassword = (currentPassword, newPassword) => {
  const errors = [];
  if (currentPassword === newPassword)
    errors.push("Your new password can't match your current one");
  if (newPassword.length < 8 || newPassword.length > 20)
    errors.push("Set a password between 8 and 20 characters");
  if (newPassword.search(/(%|_|#|!|@|\$|%|\^|&|\*)/) === -1)
    // All special characters from the number row
    errors.push("Password must include a special character like %, _, #, ! etc.");
  return [...errors];
};

const ChangePasswordModalButton = ({ userType }) => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [uiElements, setUIElements] = useState({
    loading: false,
    error: "",
    message: "",
  });
  const [eyeIconVisible, setEyeIconVisible] = useState({
    token: false,
    currentPassword: false,
    newPassword: false,
  });

  const [tokenState, setTokenState] = useState({ tokenSent: false, tokenMsg: "" });
  const toggleEyeIconVisibility = (key) => {
    setEyeIconVisible((prev) => {
      // console.log(key, prev[key]);
      return { ...prev, [key]: !prev[key] };
    });
  };

  const setTimeNotification = ({ loading = false, message = "", error = "" }, seconds = 0) => {
    const timeout = setTimeout(() => {
      setUIElements({ loading, message, error });
    }, seconds * 1000);
    return timeout;
  };

  const getPasswordResetTokenMail = async (e) => {
    // setUIElements({
    //   loading: false,
    //   message: "",
    //   error: "",
    //   tokenMsg: "Trying to mail your Token...",
    // });
    // setTimeNotification({ tokenMsg: "Trying to mail your Token..." });
    // onOpen(); // Opens the modal
    setTokenState({ tokenSent: false, tokenMsg: "Trying to mail your Token" });
    try {
      const response = await fetch(
        `${ORIGIN}/api/${userType.toLowerCase()}s/generate-password-token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: authState.entity.email }),
          // credentials: "include"
        }
      );
      console.log(response);
      const data = await response.json();
      console.log(data);

      if (!response.ok || data.status !== "success") {
        setTokenState({ tokenSent: false, tokenMsg: data.message });
        return;
      }
      setTokenState({ tokenSent: true, tokenMsg: data.message });
    } catch (err) {
      console.log(err);
      setTokenState({
        tokenSent: false,
        tokenMsg: "Unable to mail your token (Check your internet)",
      });
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
      const response = await fetch(`${ORIGIN}/api/${userType.toLowerCase()}s/update-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formDataObj),
        credentials: "include",
      });

      const data = await response.json();

      if (response.status === 401) {
        dispatch(authActions.unsetEntity());
        dispatch(documentsActions.clearAll());
        navigate("/login", { state: { message: "Time Out! Please log-in again" } });
        return;
      }

      if (!response.ok || data.status !== "success") {
        setTimeNotification({ error: data.message }, 1.5);
        return;
      }
      //   dispatch(authActions.updateUser({ user: data.user })); // No need as we are not storing password in
      // client state
      // Finally, when successful:
      setTimeNotification({ message: data.message }, 1.5);
      setTimeout(() => onClose(), 5000);
    } catch (err) {
      setTimeNotification({ error: "No Internet Connection!" });
    }
  };

  useEffect(() => {
    if (uiElements.message || uiElements.error) {
      const timeout = setTimeNotification({}, 4);
      return () => clearTimeout(timeout);
    }
  }, [uiElements.message, uiElements.error]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (tokenState.tokenMsg) setTokenState((prev) => ({ ...prev, tokenMsg: "" }));
    }, 8000);
    return () => clearTimeout(timeout);
  }, [tokenState.tokenMsg]);

  return (
    <>
      {/* <Button onPress={onOpen}>Run Code</Button> */}
      <Button color="danger" variant="flat" onPress={onOpen} className="text-wrap">
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

                  {tokenState.tokenMsg && <h3 className="text-lg">{tokenState.tokenMsg}</h3>}

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
                  />
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
                  />
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
                  />
                </ModalBody>
                <ModalFooter>
                  <Button
                    type="button"
                    color="success"
                    variant="light"
                    isDisabled={tokenState.tokenMsg}
                    onClick={getPasswordResetTokenMail}
                  >
                    Get {tokenState.tokenSent && "Another"} Token
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

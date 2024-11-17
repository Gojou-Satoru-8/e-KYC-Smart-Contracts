import { useEffect, useState } from "react";
import {
  Avatar,
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
import { useDispatch, useSelector } from "react-redux";
import { authActions, documentsActions } from "../store";

const VerificationModalButton = ({ property }) => {
  // NOTE: Property is either "email" or "phone"
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [uiElements, setUIElements] = useState({ loading: false, error: "", message: "" });
  const [tokenState, setTokenState] = useState({ tokenSent: false, tokenMsg: "" });
  const setTimeNotification = ({ loading = false, message = "", error = "" }, seconds = 0) => {
    const timeout = setTimeout(() => {
      setUIElements({ loading, message, error });
    }, seconds * 1000);
    return timeout;
  };

  const getVerificationToken = async (e) => {
    setTokenState({
      tokenMsg: `Trying to ${property === "email" ? "mail" : "sms"} your Token...`,
      tokenSent: false,
    });
    try {
      const response = await fetch(
        `http://localhost:3000/api/users/${property}-verification-token`,
        { credentials: "include" }
      );
      console.log(response);
      const data = await response.json();
      console.log(data);

      if (response.status === 401) {
        dispatch(authActions.unsetEntity());
        dispatch(documentsActions.clearAll());
        navigate("/login", { state: { message: "Time Out! Please log in again" } });
        return;
      }

      if (!response.ok || data.status !== "success") {
        setTimeNotification({ error: data.message }, 1.5);
        return;
      }

      setTokenState({ tokenSent: true, tokenMsg: data.message }, 1.5);
    } catch (err) {
      setTimeNotification({ error: err.message });
    }
  };
  const sendVerificationToken = async (e) => {
    e.preventDefault();
    // setUIElements({ loading: true, message: "", error: "", tokenMsg: "" });
    setTimeNotification({ loading: true });
    const formData = new FormData(e.target);
    const formDataObj = Object.fromEntries(formData);
    if (!formDataObj.token) {
      setTimeNotification({ error: "Missing Token" });
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/users/${property}-verification-token`,
        {
          method: "POST",
          body: JSON.stringify(formDataObj),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await response.json();
      console.log(data);

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

      dispatch(authActions.updateEntity({ entity: data.user, entityType: "User" }));
      // Finally, when successful:
      setTimeNotification({ message: data.message }, 1.5);
      setTimeout(() => onClose(), 4000);
    } catch (err) {
      setTimeNotification({ error: "No Internet Connection!" }, 1.5);
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
      if (tokenState.tokenSent && tokenState.tokenMsg)
        setTokenState((prev) => ({ ...prev, tokenMsg: "" }));
    }, 8000);
    return () => clearTimeout(timeout);
  }, [tokenState.tokenSent, tokenState.tokenMsg]);
  return (
    <>
      {/* <Button onPress={onOpen}>Run Code</Button> */}
      {!uiElements.loading && (
        <Button size="sm" color="warning" onPress={onOpen}>
          Verify
        </Button>
      )}

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
              <ModalHeader className="flex flex-col gap-1">
                Verify your {property === "email" ? "Email" : "Phone Number"}
              </ModalHeader>
              <Form onSubmit={sendVerificationToken}>
                <ModalBody className="flex flex-col gap-4 text-center">
                  {uiElements.loading && (
                    <div className="bg-primary rounded-lg py-2 px-4">
                      <p>Processing! Please wait</p>
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
                    type="text"
                    name="token"
                    label="Token"
                    // endContent={}
                    required
                  />
                </ModalBody>
                <ModalFooter>
                  <Button
                    type="button"
                    color="primary"
                    variant="light"
                    // isDisabled={tokenState.tokenMsg !== ""}
                    isDisabled={tokenState.tokenMsg}
                    onClick={getVerificationToken}
                  >
                    Get {tokenState.tokenSent && "Another"} Token
                  </Button>
                  {tokenState.tokenSent && (
                    <Button
                      type="submit"
                      color="success"
                      variant="light"
                      isDisabled={uiElements.loading}
                    >
                      Verify
                    </Button>
                  )}
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

export default VerificationModalButton;

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

const UpdatePfpModalButton = ({ photoSrc }) => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [uiElements, setUIElements] = useState({ loading: false, error: "", message: "" });

  const setTimeNotification = ({ loading = false, message = "", error = "" }, seconds = 0) => {
    const timeout = setTimeout(() => {
      setUIElements({ loading, message, error });
    }, seconds * 1000);
    return timeout;
  };

  const handleUploadPfp = async (e) => {
    e.preventDefault();
    // setUIElements({ loading: true, message: "", error: "", tokenMsg: "" });
    setTimeNotification({ loading: true });
    const formData = new FormData(e.target);
    console.log(Object.fromEntries(formData));

    const pfp = formData.get("pfp");
    if (pfp.size < 400 * 1024 || pfp.size > 2 * 1024 * 1024) {
      setTimeNotification({ error: "PFP must be within 500KB and 2MB" });
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/users/update-pfp", {
        method: "POST",
        body: formData,
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

  return (
    <>
      {/* <Button onPress={onOpen}>Run Code</Button> */}
      {!uiElements.loading && (
        <Avatar
          // size="lg"
          as="button"
          className="w-24 h-24"
          isBordered
          color="primary"
          showFallback
          src={photoSrc}
          // name={userInfo.name}
          onClick={onOpen}
        />
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
              <ModalHeader className="flex flex-col gap-1">Update Your Profile Picture</ModalHeader>
              <Form onSubmit={handleUploadPfp}>
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

                  <Input
                    type="file"
                    name="pfp"
                    label="Image"
                    // endContent={}
                    accept="image/*"
                    required
                  />
                </ModalBody>
                <ModalFooter>
                  <Button
                    type="submit"
                    color="primary"
                    variant="light"
                    isDisabled={uiElements.loading}
                  >
                    Update PFP
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

export default UpdatePfpModalButton;

import { pki } from "node-forge";
import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Input,
  Textarea,
} from "@nextui-org/react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { authActions, documentsActions } from "../store";
import { CopyIcon, CheckIcon } from "../assets/CopyIcons";

function generateKeyPair() {
  // Generate the key pair synchronously
  const keypair = pki.rsa.generateKeyPair({ bits: 2048 });

  // Convert to PEM format
  const publicKeyPem = pki.publicKeyToPem(keypair.publicKey);
  const privateKeyPem = pki.privateKeyToPem(keypair.privateKey);

  return { publicKeyPem, privateKeyPem };
}

const GenerateKeysModal = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [uiElements, setUIElements] = useState({ loading: false, error: "", message: "" });
  const [keys, setKeys] = useState({ publicKey: "", privateKey: "" });
  const [isCopied, setIsCopied] = useState({ publicKey: false, privateKey: false });

  const setTimeNotification = ({ loading = false, message = "", error = "" }, seconds = 0) => {
    const timeout = setTimeout(() => {
      setUIElements({ loading, message, error });
    }, seconds * 1000);
    return timeout;
  };
  useEffect(() => {
    if (uiElements.message || uiElements.error) {
      const timeout = setTimeNotification({}, 4);
      return () => clearTimeout(timeout);
    }
  }, [uiElements.message, uiElements.error]);

  useEffect(() => {
    if (isCopied.publicKey || isCopied.privateKey) {
      const timeout = setTimeout(() => {
        setIsCopied({ publicKey: false, privateKey: false });
      }, 4000);
      return () => clearTimeout(timeout);
    }
  });
  const handleGenerateKeyPair = async (e) => {
    setTimeNotification({ loading: true });
    const keys = generateKeyPair();
    console.log("Public Key:", keys.publicKeyPem);
    console.log("Private Key:", keys.privateKeyPem);

    try {
      const response = await fetch("http://localhost:3000/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicKey: keys.publicKeyPem }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.status === 401) {
        authActions.unsetEntity();
        dispatch(documentsActions.clearAll());
        navigate("/login", { state: { message: "Time Out! Please log-in again" } });
        return;
      }

      if (!response.ok || data.status !== "success") {
        setTimeNotification({ error: data.message }, 1.5);
        return;
      }

      authActions.updateEntity({ entity: data.entity, entityType: data.entityType });
      setTimeNotification(
        {
          message:
            "New Key-pair generated! Public Key saved to DB. Please securely save your private key",
        },
        1.5
      );
      setKeys({ publicKey: keys.publicKeyPem, privateKey: keys.privateKeyPem });
    } catch (err) {
      console.log(err);
      setTimeNotification({ error: err.message }, 1.5);
    }
  };
  return (
    <>
      <Button color="primary" variant="flat" onPress={onOpen}>
        Generate New Key Pair
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
              <ModalHeader className="flex flex-col gap-1">Generating your Keys</ModalHeader>
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
                {keys.publicKey && (
                  <Textarea
                    name="publicKey"
                    label="Public Key"
                    value={keys.publicKey}
                    //   readOnly
                    disabled
                    endContent={
                      <button
                        className="focus:outline-none m-auto"
                        type="button"
                        onClick={(e) => {
                          navigator.clipboard.writeText(keys.publicKey);
                          setIsCopied((prev) => ({ ...prev, publicKey: true }));
                        }}
                        aria-label="toggle copy button"
                      >
                        {isCopied.publicKey ? <CheckIcon /> : <CopyIcon />}
                      </button>
                    }
                    // required
                  ></Textarea>
                )}
                {keys.privateKey && (
                  <Textarea
                    name="privateKey"
                    label="Private Key"
                    value={keys.privateKey}
                    //   readOnly
                    disabled
                    endContent={
                      <button
                        className="focus:outline-none m-auto"
                        type="button"
                        onClick={(e) => {
                          navigator.clipboard.writeText(keys.privateKey);
                          setIsCopied((prev) => ({ ...prev, privateKey: true }));
                        }}
                        aria-label="toggle copy button"
                      >
                        {isCopied.privateKey ? <CheckIcon /> : <CopyIcon />}
                      </button>
                    }
                    //   required
                  ></Textarea>
                )}
              </ModalBody>
              <ModalFooter>
                <Button
                  type="button"
                  color="success"
                  variant="light"
                  onClick={handleGenerateKeyPair}
                >
                  Generate New Pair
                </Button>
                {/* {!uiElements.loading && (
                  <Button type="button" color="danger" variant="light" onPress={closeModal}>
                    Cancel
                  </Button>
                )} */}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default GenerateKeysModal;

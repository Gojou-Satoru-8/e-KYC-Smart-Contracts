import { pki } from "node-forge";
import { useState, useEffect, useRef } from "react";
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
import { EyeFilledIcon, EyeSlashFilledIcon } from "../assets/EyeIconsPassword";

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
  const [tokenState, setTokenState] = useState({ tokenMsg: "", tokenSent: false });
  const [keys, setKeys] = useState({ publicKey: "", privateKey: "" });
  const keysGenerated = keys.publicKey && keys.privateKey; // If both are non-empty strings, then true
  const [isCopied, setIsCopied] = useState({ publicKey: false, privateKey: false });
  const [eyeIconVisible, setEyeIconVisible] = useState(false);

  const toggleEyeIconVisibility = () => setEyeIconVisible((prev) => !prev);

  const tokenRef = useRef(null);
  const setTimeNotification = (
    { loading = false, message = "", error = "", tokenMsg = "" },
    seconds = 0
  ) => {
    const timeout = setTimeout(() => {
      setUIElements({ loading, message, error, tokenMsg });
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
    const timeout = setTimeout(() => {
      if (tokenState.tokenSent && tokenState.tokenMsg)
        setTokenState((prev) => ({ ...prev, tokenMsg: "" }));
    }, 8000);
    return () => clearTimeout(timeout);
  }, [tokenState.tokenSent, tokenState.tokenMsg]);

  useEffect(() => {
    if (isCopied.publicKey || isCopied.privateKey) {
      const timeout = setTimeout(() => {
        setIsCopied({ publicKey: false, privateKey: false });
      }, 4000);
      return () => clearTimeout(timeout);
    }
  });

  const getPublicKeyResetTokenMail = async () => {
    setTokenState({ tokenMsg: "Trying to mail your Token...", tokenSent: false });
    try {
      const response = await fetch("http://localhost:3000/api/users/generate-key-token", {
        credentials: "include",
      });
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
  const handleGenerateKeyPair = async (e) => {
    if (!tokenRef.current.value) {
      setTimeNotification({ error: "Please enter a token" });
      return;
    }
    setTimeNotification({ loading: true });
    const keys = generateKeyPair();
    console.log("Public Key:", keys.publicKeyPem);
    console.log("Private Key:", keys.privateKeyPem);

    try {
      const response = await fetch("http://localhost:3000/api/users/update-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicKey: keys.publicKeyPem,
          token: tokenRef.current.value,
        }),
        credentials: "include",
      });

      const data = await response.json();

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
              <ModalHeader className="flex flex-col gap-1 text-center">
                Generate new Keys
              </ModalHeader>
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
                {!keysGenerated && (
                  <>
                    <Input
                      type={eyeIconVisible ? "text" : "password"}
                      name="token"
                      label="Keys Reset Token"
                      ref={tokenRef}
                      endContent={
                        <button
                          className="focus:outline-none m-auto"
                          type="button"
                          onClick={(e) => toggleEyeIconVisibility()}
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
                    />

                    <div className="flex flex-row justify-center gap-8 pt-2">
                      <Button
                        type="button"
                        color="primary"
                        variant="light"
                        // isDisabled={tokenState.tokenMsg !== ""}
                        isDisabled={tokenState.tokenMsg}
                        onClick={getPublicKeyResetTokenMail}
                      >
                        Get {tokenState.tokenSent && "Another"} Token
                      </Button>
                      {tokenState.tokenSent && (
                        <Button
                          type="button"
                          color="success"
                          variant="light"
                          onClick={handleGenerateKeyPair}
                        >
                          Generate New Pair
                        </Button>
                      )}
                      {/* {!uiElements.loading && (
                  <Button type="button" color="danger" variant="light" onPress={closeModal}>
                    Cancel
                  </Button>
                )} */}
                    </div>
                  </>
                )}

                {keysGenerated && (
                  <>
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
                  </>
                )}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default GenerateKeysModal;

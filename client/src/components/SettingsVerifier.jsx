import {
  Input,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Avatar,
  Divider,
} from "@nextui-org/react";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { authActions, documentsActions } from "../store";
import ChangePasswordModalButton from "./ChangePasswordModalButton";
// import GenerateKeysModalButton from "./GenerateKeysModalButton";
// import UpdatePfpModalButton from "./UpdatePfpModalButton";
// import VerificationModalButton from "./VerificationModalButton";
import { MailIcon } from "../assets/MailIcon";
import { UserIcon } from "../assets/UserIcon";
// import PhoneIcon from "../assets/PhoneIcon";
// import { EyeFilledIcon, EyeSlashFilledIcon } from "../assets/EyeIconsPassword";

const ORIGIN = import.meta.env.VITE_API_BASE_URL;
const SettingsVerifier = () => {
  // const [eyeIconVisible, setEyeIconVisible] = useState(false);
  const authState = useSelector((state) => state.auth);
  console.log("Verifier Settings Component:", authState);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(false);
  const [error, setError] = useState("");
  // NOTE: (Important) Only those fields are included below as state-values, which are actually
  // edited here so as to keep track and reset them to authState's values upon cancel.
  // For now, only email and username are editable; changing password, photo or generating new key-pairs
  // are handled by separate Modals. Thus, use userInfo state values for email and username, use authState
  // for rest.
  const [verifierInfo, setVerifierInfo] = useState({
    // email: authState.entity?.email,
    username: authState.entity?.username,
    name: authState.entity?.name,
    // phoneNumber: authState.entity?.phoneNumber,
    // photo: authState.entity?.photo,
    // isEmailVerified: authState.entity?.isEmailVerified,
    // isPhoneNumberVerified: authState.entity?.isPhoneNumberVerified,
  });

  console.log("Verifier Info:", verifierInfo);

  const handleChangeInfo = (e) => {
    setVerifierInfo((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCancelUpdate = () => {
    setVerifierInfo({
      // email: authState.entity?.email,
      username: authState.entity?.username,
      name: authState.entity?.name,
      // phoneNumber: authState.entity?.phoneNumber,
    });
    setIsEditing(false);
  };
  const setTimeNotification = ({ loading = false, message = "", error = "" }, seconds = 0) => {
    const timeout = setTimeout(() => {
      setIsLoading(loading);
      setMessage(message);
      setError(error);
      setIsEditing(false);
    }, seconds * 1000);
    return timeout;
  };
  const handleUpdateUserInfo = async (e) => {
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${ORIGIN}/api/verifiers/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: verifierInfo.username, name: verifierInfo.name }),
        credentials: "include",
      });

      console.log(response);
      const data = await response.json();
      console.log("Data: ", data);

      if (response.status === 401) {
        dispatch(authActions.unsetEntity());
        dispatch(documentsActions.clearAll());
        navigate("/login", { state: { message: "Time Out! Please log in again" } });
        return;
      }

      if (!response.ok || data.status !== "success") {
        setTimeNotification({ error: data.message }, 2);
        setTimeout(() => handleCancelUpdate(), 2000);
        return;
      }

      dispatch(authActions.updateEntity({ entity: data.entity, entityType: "Verifier" }));
      setTimeNotification({ message: data.message }, 2);
    } catch (err) {
      console.log("Unable to update profile-info: ", err.message);
      setTimeNotification({ error: "Unable to update profile! Please check your internet" }, 2);
      handleCancelUpdate();
    }
  };
  useEffect(() => {
    // Success or Error Messages are removed after 4 seconds.
    setTimeout(() => {
      if (error) setError("");
      if (message) setMessage("");
    }, 4000);
  }, [error, message]);
  // const toggleEyeIconVisibility = () => setEyeIconVisible((prev) => !prev);
  return (
    <div className="mt-10 sm:w-5/6 lg:w-2/3 m-auto">
      {/* <h2 className="text-2xl text-center">Account Settings</h2> */}
      <Card>
        <CardHeader className="flex-col justify-center pt-10 px-20 gap-4 text-center">
          {!isEditing && (
            <>
              <Avatar
                size="lg"
                isBordered
                // color="secondary"
                classNames={{ name: "text-4xl" }}
                className="w-24 h-24"
                showFallback
                src={`${ORIGIN}/src/verifier-images/${
                  authState.entity?.photo
                }?t=${new Date().getTime()}`}
                name={verifierInfo.name
                  ?.split(" ")
                  .map((segment) => segment.at(0))
                  .join("")}
              />
              {/* <UpdatePfpModalButton
                photoSrc={`${ORIGIN}/src/user-images/${
                  authState.entity?.photo
                }?t=${new Date().getTime()}`}
              /> */}
              <h3 className="text-3xl text-center">{authState.entity?.name}</h3>
            </>
          )}
          {isLoading && (
            <div className="bg-primary rounded py-2 px-4">
              <p>Saving! Please wait</p>
            </div>
          )}
          {error && (
            <div className="bg-danger rounded py-2 px-4">
              <p>{error}</p>
            </div>
          )}
          {message && (
            <div className="bg-success rounded py-2 px-4">
              <p>{message}</p>
            </div>
          )}
        </CardHeader>
        <CardBody className="px-10 gap-5 justify-center">
          {/* <h3 className="text-xl text-center">Account Settings</h3> */}
          <Input
            type="email"
            name="email"
            label="Email"
            labelPlacement="outside"
            value={authState.entity?.email}
            onChange={handleChangeInfo}
            readOnly
            isDisabled={isEditing} // readOnly means non-editable, isDisabled is non-editable and faded
            // variant="underlined"
            classNames={{ input: "text-center" }}
            startContent={
              <MailIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0 m-auto" />
            }
            required
          />
          <Input
            type="username"
            name="username"
            label="User Name"
            labelPlacement="outside"
            value={verifierInfo.username}
            onChange={handleChangeInfo}
            // isDisabled
            readOnly={!isEditing}
            isDisabled={isLoading}
            // variant="underlined"
            classNames={{ input: "text-center" }}
            startContent={<UserIcon className="m-auto" />}
            // endContent={<Button size="sm">Edit</Button>}
            required
          />
          {isEditing && (
            <Input
              type="name"
              name="name"
              label="Name"
              labelPlacement="outside"
              value={verifierInfo.name}
              onChange={handleChangeInfo}
              // isDisabled
              readOnly={!isEditing}
              isDisabled={isLoading}
              // variant="underlined"
              classNames={{ input: "text-center" }}
              required
            />
          )}
        </CardBody>
        <CardFooter className="flex flex-col gap-5">
          <div className="flex flex-row justify-center gap-8 m-auto">
            {isEditing ? (
              <>
                <Button
                  type="button"
                  color="warning"
                  onClick={handleCancelUpdate}
                  isDisabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  color="success"
                  onClick={handleUpdateUserInfo}
                  isDisabled={isLoading}
                >
                  Update
                </Button>
              </>
            ) : (
              <Button type="button" color="primary" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            )}
          </div>
          <Divider />
          <div className="flex flex-row justify-center gap-2 m-auto">
            <ChangePasswordModalButton userType={"Verifier"} />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SettingsVerifier;

import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Divider,
  Avatar,
  Input,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  ModalContent,
  useDisclosure,
} from "@nextui-org/react";
import MainLayout from "../components/MainLayout";
import SidebarDoc from "../components/SidebarDoc";
import Content from "../components/Content";
import { useDispatch, useSelector } from "react-redux";
import { MailIcon } from "../assets/MailIcon";
import { UserIcon } from "../assets/UserIcon";
import PhoneIcon from "../assets/PhoneIcon";
import { authActions, documentsActions } from "../store";

const DocPageVerifier = () => {
  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [uiElements, setUIElements] = useState({ loading: false, error: "", message: "" });
  const rejectReasonRef = useRef(null);

  const document = useSelector((state) => {
    const { documents } = state.documents;
    // state.documents gives the documentsState object, which has a key called documents
    // console.log("notes inside useSelector:", documents);
    return documents.find((doc) => doc?._id === params.id);
    // params.id is undefined so it will return undefined for currentNote
  });
  // console.log(params);
  // const documentsState = useSelector((state) => state.documents);
  // const document = documentsState.documents.find((doc) => doc?._id === params.id);
  console.log("Current document: ", document);
  console.log("document?.user:", document?.user);
  const userInfo = document?.user || {
    email: "",
    name: "",
    phoneNumber: "",
    username: "",
    photo: "",
  };
  console.log(userInfo);

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
    const downloadDoc = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/documents/${params.id}`, {
          credentials: "include",
        });
        if (response.status === 401) {
          dispatch(authActions.unsetEntity());
          dispatch(documentsActions.clearAll());
          // navigate("/login", { state: { message: "Time Out! Please log in again" } });
          return;
        }

        if (!response.ok) {
          const data = await response.json();
          setTimeNotification({ error: data.message });
          return;
        }
        console.log(response);
        const blob = await response.blob();
        console.log(blob);
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (err) {
        console.log(err);
      }
    };
    downloadDoc();
  }, [params.id]);

  //   useEffect(() => {
  //     return () => {
  //       if (pdfUrl) {
  //         // Cleanup function to free up the memory that was allocated for this URL
  //         URL.revokeObjectURL(pdfUrl);
  //       }
  //     };
  //   }, [pdfUrl]);

  const handleUpdateDocStatus = async (status) => {
    const body = { status };
    if (status === "Rejected") {
      if (!rejectReasonRef.current.value) {
        setTimeNotification({ error: "Please specify a reason for rejection" });
        return;
      }
      body.rejectionReason = rejectReasonRef.current.value;
    }
    try {
      const response = await fetch(`http://localhost:3000/api/documents/all/${document?._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });
      console.log(response);
      const data = await response.json();
      console.log(data);

      if (response.status === 401) {
        dispatch(authActions.unsetEntity());
        dispatch(documentsActions.clearAll());
        navigate("/verifiers/login", { state: { message: "Time Out! Please log in again" } });
        return;
      }

      if (!response.ok || data.status !== "success") {
        setTimeNotification({ error: data.message }, 2);
        return;
      }

      dispatch(documentsActions.updateDocument({ document: data.document }));
      setTimeNotification({ message: data.message }, 2);
    } catch (err) {
      console.log(err.message);
    }
  };
  return (
    <MainLayout>
      <SidebarDoc styles={"default"} />

      <Content title={`${document?.type} Verification`}>
        <Card className="mt-10">
          {/* <CardHeader className="flex-col"> */}
          {/* NOTE: Settings flex-col on CardHeader centers content including lists & their bullet points */}
          <CardHeader>
            <ul className="list-disc px-10">
              <li>Status: {document?.status}</li>
              <li>
                Submitted{" "}
                {new Date(document?.submittedAt).toLocaleString("en-UK", {
                  timeZone: "Asia/Kolkata",
                })}
              </li>
              {document?.verifiedAt && (
                <li>
                  Verified{" "}
                  {new Date(document?.verifiedAt).toLocaleString("en-UK", {
                    timeZone: "Asia/Kolkata",
                  })}
                </li>
              )}
              {document?.verifiedBy && <li>Verified By {document.verifiedBy?.name}</li>}
            </ul>
          </CardHeader>
          <CardBody>
            {pdfUrl && (
              <div className=" mx-auto w-full aspect-[1/1.4] h-[600px]">
                <iframe src={pdfUrl} className="w-full h-full border-0" title={document?.type} />
              </div>
            )}
          </CardBody>
        </Card>

        <div className="mt-10 m-auto">
          <Card>
            <CardHeader className="flex-col justify-center pt-10 px-20 gap-4 text-center">
              <Avatar
                // size="lg"
                className="w-24 h-24"
                // isBordered
                // color="secondary"
                showFallback
                src={`http://localhost:3000/src/user-images/${
                  userInfo?.photo
                }?t=${new Date().getTime()}`}
                // name={authState.entity.name}
              ></Avatar>
              <h3 className="text-3xl text-center">User Information</h3>
            </CardHeader>
            <CardBody className="px-10 gap-5 justify-center">
              {/* <h3 className="text-xl text-center">Account Settings</h3> */}
              <Input
                type="email"
                name="email"
                label="Email"
                labelPlacement="outside"
                value={userInfo?.email}
                readOnly
                classNames={{ input: "text-center" }}
                startContent={
                  <MailIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0 m-auto" />
                }
                required
              />
              <Input
                type="tel"
                name="phoneNumber"
                label="Phone Number"
                labelPlacement="outside"
                value={userInfo?.phoneNumber}
                readOnly
                classNames={{ input: "text-center" }}
                startContent={
                  <PhoneIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0 m-auto" />
                }
                required
              />
              <Input
                type="username"
                name="username"
                label="User Name"
                labelPlacement="outside"
                value={userInfo?.username}
                readOnly
                classNames={{ input: "text-center" }}
                startContent={<UserIcon className="m-auto" />}
                // endContent={<Button size="sm">Edit</Button>}
                required
              />
              <Input
                type="name"
                name="name"
                label="Name"
                labelPlacement="outside"
                value={userInfo?.name}
                readOnly
                classNames={{ input: "text-center" }}
                required
              />
            </CardBody>
            {document?.status === "Pending" && (
              <CardFooter className="flex flex-col gap-5">
                {uiElements.loading && (
                  <div className="bg-primary rounded py-2 px-4">
                    <p>Saving! Please wait</p>
                  </div>
                )}
                {uiElements.error && (
                  <div className="bg-danger rounded py-2 px-4">
                    <p>{uiElements.error}</p>
                  </div>
                )}
                {uiElements.message && (
                  <div className="bg-success rounded py-2 px-4">
                    <p>{uiElements.message}</p>
                  </div>
                )}
                <Divider />
                <div className="flex flex-row justify-center gap-8 m-auto">
                  <Button type="button" color="danger" onPress={onOpen}>
                    Reject
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
                          <ModalHeader className="flex flex-col gap-1">
                            Enter Rejection Reason
                          </ModalHeader>
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
                              type="text"
                              name="rejectReason"
                              label="Reason for Rejection"
                              ref={rejectReasonRef}
                            />
                          </ModalBody>
                          <ModalFooter>
                            <Button
                              type="button"
                              color="danger"
                              // variant="light"
                              onClick={(e) => handleUpdateDocStatus("Rejected")}
                            >
                              Reject
                            </Button>
                          </ModalFooter>
                        </>
                      )}
                    </ModalContent>
                  </Modal>

                  <Button
                    type="button"
                    color="success"
                    onClick={(e) => handleUpdateDocStatus("Approved")}
                  >
                    Approve
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>
        </div>

        {/* <Button onClick={downloadDoc}>Get Document</Button> */}
      </Content>
    </MainLayout>
  );
};

export default DocPageVerifier;

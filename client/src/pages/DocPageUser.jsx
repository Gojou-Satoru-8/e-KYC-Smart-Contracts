import { useState, useEffect } from "react";
import { useParams, Form, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Breadcrumbs,
  BreadcrumbItem,
  // Spacer,
  Input,
  Button,
  Card,
  CardHeader,
  CardBody,
  Textarea,
} from "@nextui-org/react";
import MainLayout from "../components/MainLayout";
import SidebarDoc from "../components/SidebarDoc";
import Content from "../components/Content";
import { authActions, documentsActions } from "../store";
import { CheckIcon, CopyIcon } from "../assets/CopyIcons";

const DocPageUser = () => {
  const params = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [uiElements, setUIElements] = useState({ loading: false, message: "", error: "" });
  const [shareToken, setShareToken] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const document = useSelector((state) => {
    const { documents } = state.documents;
    // state.documents gives the documentsState object, which has a key called documents
    // console.log("notes inside useSelector:", documents);
    return documents.find((doc) => doc?._id === params.id);
    // params.id is undefined so it will return undefined for currentNote
  });
  // console.log(params);
  console.log("Current document: ", document);
  const setTimeNotification = ({ loading = false, message = "", error = "" }, seconds = 0) => {
    const timeout = setTimeout(() => {
      setUIElements({ loading, message, error });
    }, seconds * 1000);
    return timeout;
  };

  useEffect(() => {
    const downloadDoc = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/documents/${params.id}`, {
          credentials: "include",
        });
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

  useEffect(() => {
    if (uiElements.message || uiElements.error) {
      const timeout = setTimeNotification({}, 4);
      return () => clearTimeout(timeout);
    }
  }, [uiElements.message, uiElements.error]);

  useEffect(() => {
    if (isCopied || isCopied) {
      const timeout = setTimeout(() => {
        setIsCopied(false);
      }, 4000);
      return () => clearTimeout(timeout);
    }
  });

  const handleShareDoc = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const formDataObj = Object.fromEntries(formData);
    formDataObj.documentId = document._id;
    console.log(formDataObj);

    if (!formDataObj.organizationId) setTimeNotification({ error: "Missing Organization ID" });

    setTimeNotification({ loading: true });
    try {
      const response = await fetch("http://localhost:3000/api/documents/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formDataObj),
        credentials: "include",
      });
      console.log(response);
      const data = await response.json();
      console.log(data);

      if (response.status === 401) {
        dispatch(authActions.unsetEntity());
        dispatch(documentsActions.clearAll());
        // navigate("/login", { state: { message: "Time Out! Please log in again" } });
        return;
      }

      if (!response.ok || data.status !== "success") {
        setTimeNotification({ error: data.message }, 1.5);
        return;
      }

      setTimeNotification({ message: data.message });
      setShareToken(data.token);
    } catch (err) {
      console.log(err);
      setTimeNotification({ error: err.message });
    }
  };
  return (
    <MainLayout>
      <SidebarDoc styles={"default"} />

      <Content>
        <Breadcrumbs
          radius="full"
          variant="solid"
          size="lg"
          //   itemClasses={{
          //     item: [
          //       "data-[current=true]:bg-success data-[current=true]:rounded-xl transition-colors",
          //       "px-4",
          //       "data-[disabled=true]:border-default-400 data-[disabled=true]:bg-default-100",
          //     ],
          //   }}
        >
          <BreadcrumbItem
            isCurrent={document?.status === "Pending"}
            classNames={{
              item: [
                "data-[current=true]:bg-warning data-[current=true]:rounded-xl transition-colors px-2",
              ],
            }}
          >
            Pending
          </BreadcrumbItem>
          {document?.status === "Approved" && (
            <BreadcrumbItem
              isCurrent={document?.status === "Approved"}
              classNames={{
                item: [
                  "data-[current=true]:bg-success data-[current=true]:rounded-xl transition-colors px-2",
                ],
              }}
            >
              Approved
            </BreadcrumbItem>
          )}
          {document?.status === "Rejected" && (
            <BreadcrumbItem
              isCurrent={document?.status === "Rejected"}
              classNames={{
                item: [
                  "data-[current=true]:bg-danger data-[current=true]:rounded-xl transition-colors px-2",
                ],
              }}
            >
              Rejected
            </BreadcrumbItem>
          )}
        </Breadcrumbs>
        {pdfUrl && (
          <div className="w-full aspect-[1/1.4] h-[1000px] py-10">
            <iframe src={pdfUrl} className="w-full h-full border-0" title="Document" />
          </div>
        )}

        {document?.status === "Approved" && (
          <Card>
            <CardHeader className="flex-col justify-center pt-5 px-20 gap-4 text-center">
              <h3 className="text-xl text-center">Enter Organization ID to share document</h3>
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
            </CardHeader>

            <CardBody className="px-10 gap-5 justify-center">
              <Form onSubmit={handleShareDoc}>
                <Input
                  type="text"
                  name="organizationId"
                  label="Organization ID"
                  labelPlacement="outside"
                  required
                />
                <div className="flex flex-row justify-center gap-8 pt-2">
                  <Button type="submit" color="success" className="">
                    Get Share Code
                  </Button>
                </div>
              </Form>
              {shareToken && (
                <Textarea
                  name="shareToken"
                  label="Share Token"
                  value={shareToken}
                  //   readOnly
                  disabled
                  endContent={
                    <button
                      className="focus:outline-none m-auto"
                      type="button"
                      onClick={(e) => {
                        navigator.clipboard.writeText(shareToken);
                        setIsCopied(true);
                      }}
                      aria-label="toggle copy button"
                    >
                      {isCopied ? <CheckIcon /> : <CopyIcon />}
                    </button>
                  }
                />
              )}
            </CardBody>
          </Card>
        )}
      </Content>
    </MainLayout>
  );
};

export default DocPageUser;
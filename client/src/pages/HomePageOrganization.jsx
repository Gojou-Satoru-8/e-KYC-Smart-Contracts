import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link, Form } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import SidebarHome from "../components/SidebarHome";
import Content from "../components/Content";
// import { useEffect, useState } from "react";
import { Card, CardHeader, CardBody, Input, Button, CardFooter, Textarea } from "@nextui-org/react";

// import usePopulateDocumentsTodocumentsToDisplay from "../hooks/usePopulateDocumentsTodocumentsToDisplay";
// import { useRedirectIfNotAuthenticated } from "../hooks/checkAuthHooks";
import { authActions, documentsActions } from "../store";
// import CloseIcon from "../assets/close.png";

const statusColor = { Pending: "warning", Approved: "success", Rejected: "danger" };

const HomePageOrganization = ({ userType }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [document, setDocument] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [uiElements, setUIElements] = useState({ loading: false, message: "", error: "" });

  console.log("Current-Document: ", document);

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

  //   useEffect(() => {
  const downloadDoc = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/api/documents/${id}`, {
        credentials: "include",
      });
      console.log(response);

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
      const blob = await response.blob();
      console.log(blob);
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err) {
      console.log(err);
    }
  };
  // document && downloadDoc();
  //   }, [document?.id]);

  const handleGetDoc = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const shareToken = formData.get("shareToken");

    if (!shareToken) setTimeNotification({ error: "Missing Organization ID" });

    setTimeNotification({ loading: true });
    try {
      const response = await fetch(`http://localhost:3000/api/documents/share/${shareToken}`, {
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
      //   dispatch(documentsActions.addDocument({ document: data.document }));
      setDocument(data.document);
      downloadDoc(data.document.id);
    } catch (err) {
      console.log(err);
      setTimeNotification({ error: err.message });
    }
  };

  return (
    <MainLayout>
      {/* <SidebarHome styles={"default"} isDeleting={isDeleting} setIsDeleting={setIsDeleting} /> */}
      <Content>
        <Card>
          <CardHeader className="flex-col justify-center pt-5 px-20 gap-4 text-center">
            <h3 className="text-xl text-center">Enter code to view documents:</h3>
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
            {/* <h3 className="text-xl text-center">Account Settings</h3> */}
            <Form onSubmit={handleGetDoc}>
              <Textarea
                type="text"
                name="shareToken"
                label="Share Token"
                labelPlacement="outside"
                required
              />
              {!document && (
                <div className="flex flex-row justify-center gap-8 pt-2">
                  <Button type="submit" color="success" className="">
                    Get Document
                  </Button>
                </div>
              )}
            </Form>
          </CardBody>
        </Card>

        {document && (
          <Card className="mt-10">
            <CardHeader className="flex-col">
              <h1 className="text-2xl text-center">{document?.type}</h1>
              <h2 className="text-xl text-center">Status: {document?.status}</h2>
              <h3 className="text-lg text-center">
                Submitted on:{" "}
                {new Date(document?.submittedAt).toLocaleString("en-UK", {
                  timezone: "Asia/Kolkata",
                })}
              </h3>
            </CardHeader>
            <CardBody>
              {pdfUrl && (
                <div className=" mx-auto w-full aspect-[1/1.4] h-[600px]">
                  <iframe src={pdfUrl} className="w-full h-full border-0" title={document?.type} />
                </div>
              )}
            </CardBody>
          </Card>
        )}
      </Content>
    </MainLayout>
  );
};

export default HomePageOrganization;

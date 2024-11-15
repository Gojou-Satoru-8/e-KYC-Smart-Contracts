import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import SidebarHome from "../components/SidebarHome";
import Content from "../components/Content";
// import { useEffect, useState } from "react";
import { Card, CardHeader, CardBody, Button, CardFooter, Chip } from "@nextui-org/react";
import { ScrollShadow } from "@nextui-org/scroll-shadow";

// import usePopulateDocumentsTodocumentsToDisplay from "../hooks/usePopulateDocumentsTodocumentsToDisplay";
// import { useRedirectIfNotAuthenticated } from "../hooks/checkAuthHooks";
import { authActions, documentsActions } from "../store";
// import CloseIcon from "../assets/close.png";

const HomePage = ({ userType }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const documentsState = useSelector((state) => state.documents);
  const [isDeleting, setIsDeleting] = useState(false);

  console.log("Documents-state: ", documentsState);

  const { documents, selectedTags } = documentsState;
  let documentsToDisplay = [];
  if (selectedTags?.length === 0) documentsToDisplay = [...documents];
  else documentsToDisplay = documents.filter((doc) => selectedTags.includes(doc.status));
  const handleViewDoc = async (id) => {
    // window.location.href = `http://localhost:3000/api/documents/${id}`;  // Opens in same tab
    // window.location.assign(`http://localhost:3000/api/documents/${id}`); // Opens in same tab
    // window.open(`http://localhost:3000/api/documents/${id}`, "_blank"); // Opens in a new tab
    // (_blank option is not strictly necessary)
    navigate(`/${userType.toLowerCase()}s/documents/${id}`);
  };
  /*
  const handleDeleteDocument = async (id) => {
    const response = await fetch(`http://localhost:3000/api/documents/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    // const data = await response.json();
    // console.log(data);
    if (response.status === 401) {
      dispatch(authActions.unsetEntity());
      // dispatch(documentsActions.setNotes({ notes: [] }));
      dispatch(documentsActions.clearAll());
      navigate("/login", { state: { message: "Time Out! Please login again" } });
      return;
    }
    if (response.status !== 204) {
      alert("Unable to delete");

      return;
    }
    dispatch(documentsActions.deleteNote(id));
  };
  */

  return (
    <MainLayout>
      <SidebarHome styles={"default"} isDeleting={isDeleting} setIsDeleting={setIsDeleting} />
      <Content
        title={
          documentsToDisplay?.length === 0
            ? "You have no documents"
            : `You have ${documentsToDisplay.length} Documents`
        }
      >
        {/* {isLoading && <h1 className="mt-10 text-center">Loading your notes...</h1>} */}
        <div className="mt-10 grid xl:grid-cols-4 md:grid-cols-[repeat(3,31%)] sm:grid-cols-[repeat(2,45%)] grid-cols-1 justify-center gap-8">
          {documentsToDisplay?.length > 0 &&
            documentsToDisplay.map((document) => (
              <Card
                className="w-full hover:-translate-y-2 "
                classNames={{
                  base: "w-full h-56 hover:-translate-y-2 border hover:border-purple-300 overflow-scroll",
                }}
                // isBlurred
                isFooterBlurred
                isPressable
                onPress={() => handleViewDoc(document._id)}
                key={document._id}
              >
                <CardHeader className="justify-center">
                  <div className="flex gap-5">
                    <div className="flex flex-col gap-1 items-start justify-center">
                      <h3 className="text-medium font-semibold leading-none text-default-600">
                        {document.type}
                      </h3>
                    </div>
                  </div>
                </CardHeader>
                <CardBody>
                  <ScrollShadow hideScrollBar size={35} offset={5}>
                    <div className="text-sm">{document.status}</div>
                    <div className="text-sm">{document.submittedAt}</div>
                    <div className="text-sm">{document.verifiedAt}</div>
                  </ScrollShadow>
                </CardBody>
                {/* <CardFooter className="absolute bg-white/30 bottom-0 border-t-1 border-zinc-100/50 z-10 justify-between"> */}
                <CardFooter className="py-1 overflow-auto">
                  {isDeleting ? (
                    <div className="w-full flex flex-wrap gap-2 justify-end m-auto">
                      <Button
                        className={""}
                        color="danger"
                        radius="full"
                        size="sm"
                        variant="ghost"
                        // onClick={() => handleDeleteDocument(document._id)}
                      >
                        {/* <img src={CloseIcon} alt="" /> */}
                        Delete
                      </Button>
                    </div>
                  ) : (
                    <div className="w-full flex flex-wrap gap-2 justify-center m-auto">
                      <Chip key={document._id} variant="flat">
                        {document.status}
                      </Chip>
                    </div>
                  )}
                </CardFooter>
              </Card>
            ))}
        </div>
      </Content>
    </MainLayout>
  );
};

export default HomePage;

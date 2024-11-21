import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import SidebarHome from "../components/SidebarHome";
import Content from "../components/Content";
import { Card, CardHeader, CardBody, Button, CardFooter, Chip } from "@nextui-org/react";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { authActions, documentsActions } from "../store";
import HomeFeedSkeletons from "./HomeFeedSkeletons";
const statusColor = { Pending: "warning", Approved: "success", Rejected: "danger" };

const ORIGIN = import.meta.env.VITE_API_BASE_URL;
// const HomePageUser = ({ userType }) => {
const HomePageUser = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
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
    // navigate(`/${userType.toLowerCase()}s/documents/${id}`);
    navigate(`/users/documents/${id}`);
  };

  const handleDeleteDocument = async (id) => {
    const response = await fetch(`${ORIGIN}/api/documents/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    // const data = await response.json();
    // console.log(data);
    if (response.status === 401) {
      navigate("/login", { state: { message: "Time Out! Please login again" } });
      dispatch(authActions.unsetEntity());
      // dispatch(documentsActions.setNotes({ notes: [] }));
      dispatch(documentsActions.clearAll());
      return;
    }
    if (response.status !== 204) {
      alert("Unable to delete");

      return;
    }
    dispatch(documentsActions.deleteDocument(id));
  };

  // let title = `You have ${!documentsToDisplay.length ? "no" : documentsToDisplay.length} Documents`;
  // Setting up cancel deletion on hitting ESC key
  document.onkeydown = (e) => {
    // console.log(e);
    if (isDeleting && e.key === "Escape") setIsDeleting(false);
  };
  if (documentsState.loading) return <HomeFeedSkeletons />;
  // else
  return (
    <MainLayout>
      <SidebarHome styles={"default"} isDeleting={isDeleting} setIsDeleting={setIsDeleting} />
      <Content
        title={`You have ${
          !documentsToDisplay.length ? "no" : documentsToDisplay.length
        } Documents`}
      >
        {/* {isLoading && <h1 className="mt-10 text-center">Loading your notes...</h1>} */}
        {!authState.entity?.isVerified ? (
          <div className="bg-warning rounded">
            <h1 className="mt-10 text-center">
              You must verify your E-mail or Phone Number before submitting documents
            </h1>
          </div>
        ) : (
          <div className="mt-10 grid xl:grid-cols-4 md:grid-cols-[repeat(3,31%)] sm:grid-cols-[repeat(2,45%)] grid-cols-1 justify-center gap-8">
            {documentsToDisplay?.length > 0 &&
              documentsToDisplay.map((document) => (
                <Card
                  // className="w-full hover:-translate-y-2 "
                  classNames={{
                    base: "w-full h-56 hover:-translate-y-2 border hover:border-purple-300 overflow-scroll",
                  }}
                  // isBlurred
                  // isFooterBlurred
                  as={"div"}
                  isPressable
                  isHoverable
                  onPress={() => handleViewDoc(document._id)}
                  key={document._id}
                >
                  <CardHeader className="justify-center mb-1">
                    <div className="flex flex-col gap-1 items-start justify-center">
                      <h3 className="text-xl font-semibold leading-none text-default-600">
                        {document.type}
                      </h3>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <ScrollShadow hideScrollBar size={35} offset={5}>
                      <ul className="list-disc pl-5 flex flex-col gap-1">
                        <li className="text-sm">
                          Submitted{" "}
                          {new Date(document.submittedAt).toLocaleString("en-UK", {
                            timeZone: "Asia/Kolkata",
                          })}
                        </li>
                        {document?.verifiedAt && (
                          <li className="text-sm">
                            Verified{" "}
                            {new Date(document?.verifiedAt).toLocaleString("en-UK", {
                              timeZone: "Asia/Kolkata",
                            })}
                          </li>
                        )}
                        {document?.verifiedBy && (
                          <li className="text-sm">Verified By {document.verifiedBy?.name}</li>
                        )}
                      </ul>
                    </ScrollShadow>
                  </CardBody>
                  {/* <CardFooter className="absolute bg-white/30 bottom-0 border-t-1 border-zinc-100/50 z-10 justify-between"> */}
                  <CardFooter className="pb-3 overflow-auto">
                    {isDeleting && document.status !== "Approved" ? (
                      <div className="w-full flex flex-wrap gap-2 justify-end m-auto">
                        <Button
                          className={""}
                          color="danger"
                          radius="full"
                          size="sm"
                          variant="light"
                          onClick={() => handleDeleteDocument(document._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    ) : (
                      <div className="w-full flex flex-wrap gap-2 justify-center m-auto">
                        <Chip
                          key={document._id}
                          variant="shadow"
                          color={statusColor[document.status]}
                        >
                          {document.status}
                        </Chip>
                      </div>
                    )}
                  </CardFooter>
                </Card>
              ))}
          </div>
        )}
      </Content>
    </MainLayout>
  );
};

export default HomePageUser;

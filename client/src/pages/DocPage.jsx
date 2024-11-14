import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Breadcrumbs, BreadcrumbItem, Spacer } from "@nextui-org/react";
import MainLayout from "../components/MainLayout";
import SidebarDoc from "../components/SidebarDoc";
import Content from "../components/Content";
import { useSelector } from "react-redux";

const DocPage = () => {
  const params = useParams();
  const [pdfUrl, setPdfUrl] = useState(null);
  const document = useSelector((state) => {
    const { documents } = state.documents;
    // state.documents gives the documentsState object, which has a key called documents
    // console.log("notes inside useSelector:", documents);
    return documents.find((doc) => doc?._id === params.id);
    // params.id is undefined so it will return undefined for currentNote
  });
  // console.log(params);
  console.log("Current document: ", document);
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
          <BreadcrumbItem
            isCurrent={document?.status === "Verified"}
            classNames={{
              item: [
                "data-[current=true]:bg-success data-[current=true]:rounded-xl transition-colors px-2",
              ],
            }}
          >
            Verified
          </BreadcrumbItem>
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
          ``
        </Breadcrumbs>
        {pdfUrl && (
          <div className="w-full aspect-[1/1.4] h-[1000px]">
            <iframe src={pdfUrl} className="w-full h-full border-0" title="Document" />
          </div>
        )}
      </Content>
    </MainLayout>
  );
};

export default DocPage;

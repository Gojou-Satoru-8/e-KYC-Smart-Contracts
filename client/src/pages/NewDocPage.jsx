import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams, json, useNavigation, Form } from "react-router-dom";
import { pki } from "node-forge";
import { Button, Input, Textarea, Select, SelectItem } from "@nextui-org/react";
import MainLayout from "../components/MainLayout";
import SidebarDoc from "../components/SidebarDoc";
import Content from "../components/Content";
import { authActions, documentsActions } from "../store";
import { signDocument } from "../utils/crypto";

const docTypes = ["Passport", "Voter ID", "Driver License", "Aadhar", "PAN", "NRC", "PRC"];
const ORIGIN = import.meta.env.VITE_API_BASE_URL;

const NewDocPage = () => {
  // console.log("New Note:", isNew);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const params = useParams();

  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState("Passport"); // ["Passport", "Voter ID", "Driver License", "Aadhar"]
  console.log({ docType }, { file });

  const [uiElements, setUIElements] = useState({
    loading: false,
    error: "",
    message: "",
  });

  // useEffect(() => {
  //   if (!isNew && currentNote) {
  //     setFile(currentNote.title);
  //     setSummary(currentNote.summary);
  //     setTags(currentNote.tags);
  //     setDocType(currentNote.language);
  //     setNoteContent(currentNote.noteContent.at(0));
  //     setCodeContent(currentNote.codeContent);
  //   }
  // }, [isNew, currentNote]);

  const setTimeNotification = ({ loading = false, message = "", error = "" }, seconds = 0) => {
    const timeout = setTimeout(() => {
      setUIElements({ loading, message, error });
    }, seconds * 1000);
    return timeout;
  };
  const handleFileInputChange = (e) => {
    console.log(e.target.files, typeof e.target.files); // List of files attached
    // console.log(e.target.value, typeof e.target.value); // the file-path as a string
    // setFile(e.target.value); // Sets only the path as a string
    setFile(e.target.files[0]);
  };

  const handleDocTypeChange = (e) => setDocType(e.target.value);
  const handleDocSubmit = async (e) => {
    /*
    // If Using controlled components:
    console.log(file);
    console.log(docType);
    if (!file) {
      setTimeNotification({ error: "Please select a File" }, 0);
      return;
    }
    if (!docType) {
      setTimeNotification({ error: "Please choose a document type" }, 0);
      return;
    }
    const formData = new FormData();
    formData.append("document", file);
    formData.append("type", docType);
    // Now send this formData as body.
  */
    setTimeNotification({ loading: true });
    e.preventDefault();
    const formData = new FormData(e.target);
    // NOTE: The private key in formData is in text or PEM (Privacy Enhanced Mail) format
    // ie a Base64-encoded text format of the key with BEGIN/END markers
    if (!formData.get("documentType")) {
      setTimeNotification({ error: "Please choose a document type" });
      return;
    }
    if (!formData.get("document").size) {
      // If no file is chosen, then a File object with name = '' and size = 0 is sent into FormData constructor
      setTimeNotification({ error: "Please select a file" });
      return;
    }
    if (!formData.get("privateKey")) {
      setTimeNotification({ error: "Your key is required to sign the document" });
      return;
    }

    /*
    // (0) Convert private key into appropriate format:
    const privateKey = pki.privateKeyFromPem(formData.get("privateKey"));
    console.log("Private Key object obtained from PEM string: ", privateKey); // an object
    // (1) Obtain document hash:
    const hashedDocument = await hashDocument(formData.get("document"));
    console.log("Hashed document: ", hashedDocument);
    // (2) Sign the hashedDocument:
    const signedDocument = signDocumentHash(privateKey, hashedDocument);
    console.log("Signed Document: ", signedDocument);
    */

    // formData.set("privateKey", privateKey);

    try {
      // (1) Sign the document:
      const signature = await signDocument(formData.get("privateKey"), formData.get("document"));
      console.log(signature);

      formData.append("signature", signature);
      // Remove private key from formData (not to be sent to server):
      formData.delete("privateKey");
      console.log(Object.fromEntries(formData)); // Just to check the inputs
      // setUIElements({ loading: true, message: "", error: "" });

      let URL = `${ORIGIN}/api/documents/`;

      const response = await fetch(URL, {
        method: "POST",
        credentials: "include",
        body: formData,
        // headers: { "Content-Type": "application/json" },
        // body: JSON.stringify({ document: file, type: docType }),
        // NOTE: binary data file value isn't compatible with JSON.stringify, thus in case you're using controlled
        // components via state-values, then (1) create an empty FormData object, then manually append the fields
      });

      if (!response.ok) console.log("Request sent but unfavourable response");
      const data = await response.json();
      console.log(data);
      // Response is any of 401 (User not logged in), 406 (Invalid Signature),
      // or 201 (document uploaded and saved successfully)
      if (response.status === 401) {
        dispatch(authActions.unsetEntity());
        // dispatch(notesActions.setNotes({ notes: [] }));
        dispatch(documentsActions.clearAll());
        navigate("/login", { state: { message: "Time Out! Please login again" } });
        return;
      }

      if (!response.ok || data.status !== "success") {
        setTimeNotification({ error: data.message }, 2);
        return;
      }
      // Saving the created note to redux, to prevent additional fetch for reflecting the added note in homepage:
      dispatch(documentsActions.addDocument({ document: data.document }));
      setTimeNotification({ message: data.message }, 1.5);
      // In case the note is updated by removing a selected tag, this may cause UI inconsistency

      setTimeout(() => {
        setUIElements((prev) => ({ ...prev, message: "", error: "" }));
        navigate(`/users/`);
      }, 1000);
    } catch (err) {
      console.log(err.message);
      setTimeNotification({ error: err.message }, 1.5);
    }
  };
  useEffect(() => {
    setTimeout(() => {
      if (uiElements.message || uiElements.error)
        setUIElements({ loading: false, message: "", error: "" });
    }, 4000);
  }, [uiElements]);
  return (
    <MainLayout>
      <SidebarDoc styles={"default"}>
        {/* <div className="action-buttons w-[95%] md:w-1/2 mx-auto mt-10 flex flex-col justify-center gap-4">
          <Button
            color="danger"
            variant="flat"
            onClick={() => {
              navigate("/");
            }}
          >
            Cancel
          </Button>
        </div> */}
        {uiElements.loading && (
          <div className="bg-primary rounded py-2 px-4">
            <p>Processing! Please wait</p>
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
      </SidebarDoc>
      <Content>
        <div className="flex flex-row"></div>
        <Form onSubmit={handleDocSubmit} className="flex flex-col gap-12 justify-center">
          <Select
            classNames={{ base: "w-4/5 m-auto" }}
            isRequired
            name="documentType"
            size="lg"
            label="Document Type"
            labelPlacement="outside"
            // className="max-w-sm"
            selectedKeys={[docType]}
            onChange={handleDocTypeChange}
          >
            {docTypes.map((type) => (
              <SelectItem
                key={type}
                // value={lang.name}  // key is taken as the value
              >
                {type}
              </SelectItem>
            ))}
          </Select>
          <Input
            size="lg"
            type="file"
            classNames={{ base: "w-4/5 m-auto" }}
            name="document"
            label="Document"
            labelPlacement="outside"
            onChange={handleFileInputChange}
            // variant=""
            accept="application/pdf"
            required
          ></Input>
          <Textarea
            classNames={{ base: "w-4/5 m-auto" }}
            name="privateKey"
            label="Private Key"
            labelPlacement="outside"
            required
          ></Textarea>
          <Button type="submit" color="primary" className="m-auto">
            Submit
          </Button>
        </Form>
      </Content>
    </MainLayout>
  );
};

export default NewDocPage;

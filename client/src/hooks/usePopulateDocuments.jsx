import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { authActions, documentsActions } from "../store";
import { useNavigate } from "react-router-dom";

const usePopulateDocuments = (entityType) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const documentsState = useSelector((state) => state.documents);
  console.log(documentsState);

  useEffect(() => {
    // DONT FETCH DOCUMENTS IN CASE ORGANIZATION IS LOGGED IN:
    if (entityType === "Organization") return;
    const fetchAllDocuments = async () => {
      let URL = "http://localhost:3000/api/documents";
      if (entityType === "Verifier") URL += "/all";
      try {
        const response = await fetch(URL, { credentials: "include" });
        const data = await response.json();

        // For unauthorized errors:
        if (response.status === 401) {
          // navigate("/login", { state: { message: "Time Out! Please login again" } });
          dispatch(authActions.unsetEntity());
          dispatch(documentsActions.clearDocuments());
          navigate("/login");
          return;
          // NOTE: usePopulateDocuments hook follows the RedirectIfNotAuthenticated Hook, which means that if this hook runs,
          // at the home page, then the user is authenticated. This if check is mainly used for the case when
          // cookie was deliberately deleted.
        }
        // else if (!response.ok) alert("Failed to populate notes"); // For all other errors:

        if (response.status === 404) {
          console.warn("No documents found:", data.message);
          dispatch(documentsActions.clearDocuments());
          return;
        }

        dispatch(documentsActions.setDocuments({ documents: data.documents }));
        // Issue of data.documents turning to undefined needs to be isolated
      } catch (err) {
        alert(err.message);
      }
    };
    fetchAllDocuments();
  }, [dispatch, navigate, entityType]);
  return documentsState;
};

export default usePopulateDocuments;

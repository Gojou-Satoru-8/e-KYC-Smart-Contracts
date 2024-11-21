import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { authActions, documentsActions } from "../store";
import { useNavigate } from "react-router-dom";

const ORIGIN = import.meta.env.VITE_API_BASE_URL;
const usePopulateDocuments = (entityType) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const documentsState = useSelector((state) => state.documents);
  console.log(documentsState);

  useEffect(() => {
    // ONLY FETCH DOCUMENTS IN CASE OF USER OR VERIFIER BEING LOGGED IN:
    if (entityType !== "User" && entityType !== "Verifier") return;
    // This covers the case of entityType being "Organization" or entityType being null (in case of first load
    // or when no entity is logged in).
    const fetchAllDocuments = async () => {
      let URL = `${ORIGIN}/api/documents`;
      if (entityType === "Verifier") URL += "/all";
      try {
        const response = await fetch(URL, { credentials: "include" });
        const data = await response.json();

        // For unauthorized errors:
        if (response.status === 401) {
          // navigate("/login", { state: { message: "Time Out! Please login again" } });
          dispatch(authActions.unsetEntity());
          dispatch(documentsActions.clearAll());
          navigate("/login");
          return;
          // NOTE: usePopulateDocuments hook follows the RedirectIfNotAuthenticated Hook, which means that if this hook runs,
          // at the home page, then the user is authenticated. This if check is mainly used for the case when
          // cookie was deliberately deleted.
        }
        // else if (!response.ok) alert("Failed to populate notes"); // For all other errors:

        if (response.status === 404) {
          console.warn("No documents found:", data.message);
          dispatch(documentsActions.clearAll());
          return;
        }

        dispatch(documentsActions.setDocuments({ documents: data.documents }));
        // Issue of data.documents turning to undefined needs to be isolated
      } catch (err) {
        alert("Unable to download documents");
      } finally {
        dispatch(documentsActions.setLoading(false));
      }
    };
    fetchAllDocuments();
  }, [dispatch, navigate, entityType]);
  return documentsState;
};

export default usePopulateDocuments;

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { authActions } from "../store";

const useGetCurrentUser = () => {
  const authState = useSelector((state) => state.auth);
  console.log("Authentication status: ", authState);

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/entity", {
          credentials: "include",
        });
        console.log(response);
        const data = await response.json();
        console.log(data);
        if (response.status === 404 || data.status !== "success") {
          dispatch(authActions.unsetEntity());
          return;
        }
        // Set redux store based on whether a user was present in server-session or not.

        if (data.user) dispatch(authActions.setEntity({ entity: data.user, entityType: "User" }));
        if (data.organization)
          dispatch(
            authActions.setEntity({ entity: data.organization, entityType: "Organization" })
          );
        if (data.verifier)
          dispatch(authActions.setEntity({ entity: data.verifier, entityType: "Verifier" }));
      } catch (err) {
        console.log("Auth Check failed", err.message);
        dispatch(authActions.unsetEntity());
      } finally {
        // setLoading(false);
        dispatch(authActions.setLoading(false));
      }
    };
    fetchUser();
  }, [dispatch]);
  return authState;
};

export default useGetCurrentUser;

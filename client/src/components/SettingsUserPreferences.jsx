import { useState, useEffect } from "react";
import { Form, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Input, Card, CardHeader, CardBody, Button, Select, SelectItem } from "@nextui-org/react";
import { authActions, notesActions } from "../store";

const uiThemes = ["light", "dark"];
const CodeEditorThemes = [
  "Atomone",
  "Material Light",
  "Material Dark",
  "Github Light",
  "Github Dark",
  "Dracula",
];

const SettingsPreferences = () => {
  const authState = useSelector((state) => state.auth);
  console.log(authState);

  const [isEditing, setIsEditing] = useState(false);
  const [uiElements, setUIElements] = useState({ loading: false, message: "", error: "" });
  const [preferences, setPreferences] = useState({
    uiTheme: authState.user?.settings.uiTheme,
    codeEditorTheme: authState.user?.settings.codeEditorTheme,
    codeEditorWindowSize: authState.user?.settings.codeEditorWindowSize,
    codeEditorFontSize: authState.user?.settings.codeEditorFontSize,
  });
  console.log(preferences);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const setTimeNotification = ({ message = "", error = "" }, seconds) => {
    setTimeout(() => {
      setUIElements({ loading: false, message, error });
    }, seconds * 1000);
  };
  const toggleEditing = (e) => setIsEditing((prev) => !prev);
  const handlePreferencesChange = (e) => {
    setPreferences((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdateSettings = async (e) => {
    setUIElements({ loading: true, message: "", error: "" });
    // e.preventDefault();
    // const formData = new FormData(e.target);
    // const formDataObj = Object.fromEntries(formData);
    // console.log(formDataObj);

    try {
      const response = await fetch("http://localhost:3000/api/user/settings", {
        method: "PATCH",
        body: JSON.stringify(preferences),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      console.log(response);
      if (response.status === 401) {
        dispatch(authActions.unsetUser());
        // dispatch(notesActions.setNotes({ notes: [] }));
        dispatch(notesActions.clearAll());
        navigate("/log-in", { state: { message: "Time Out! Please log-in again" } });
        return;
      }

      const data = await response.json();
      console.log(data);

      if (!response.ok || data.status === "fail") {
        setTimeNotification({ error: data.message }, 2);
        return;
      }
      // Finally, when successful:
      setTimeNotification({ message: data.message }, 2);
      console.log(data.user.settings);

      dispatch(authActions.updateUserSettings(data.user.settings));
    } catch (err) {
      setTimeNotification({ error: "No Internet Connection!" }, 2);
    }
  };
  useEffect(() => {
    setTimeout(() => {
      if (uiElements.message || uiElements.error)
        setUIElements((prev) => ({ ...prev, message: "", error: "" }));
    }, 4000);
  }, [uiElements]);

  return (
    <div className="mt-10 sm:w-5/6 lg:w-2/3 m-auto">
      {/* <h2 className="text-2xl text-center">Account Settings</h2> */}
      <Card>
        <CardHeader className="flex-col justify-center pt-10 px-20 gap-4">
          <h3 className="text-2xl">Application Preferences</h3>
          {uiElements.loading && (
            <div className="bg-primary rounded py-2 px-4">
              <p>Validating! Please wait</p>
            </div>
          )}
          {uiElements.message && (
            <div className="bg-success rounded py-2 px-4">
              <p>{uiElements.message}</p>
            </div>
          )}
          {uiElements.error && (
            <div className="bg-danger rounded py-2 px-4">
              <p>{uiElements.error}</p>
            </div>
          )}
        </CardHeader>
        {/* <Form onSubmit={handleUpdateSettings}> */}
        <CardBody className="px-20 gap-3 justify-center">
          <Select
            classNames={{ base: "m-auto" }}
            isRequired
            name="uiTheme"
            label="Preferred UI Theme"
            labelPlacement="outside"
            isDisabled={!isEditing}
            // placeholder={authState.user?.settings?.uiTheme}
            // className="max-w-md"
            selectedKeys={[preferences.uiTheme]}
            onChange={handlePreferencesChange}
          >
            {uiThemes.map((theme) => (
              <SelectItem
                key={theme}
                // value={theme}  // key is taken as the value
              >
                {theme}
              </SelectItem>
            ))}
          </Select>
          <Select
            classNames={{ base: "m-auto" }}
            isRequired
            name="codeEditorTheme"
            label="Preferred Editor Theme"
            labelPlacement="outside"
            isDisabled={!isEditing}
            // placeholder={authState.user?.settings.codeEditorTheme}
            // className="max-w-md"
            selectedKeys={[preferences.codeEditorTheme]}
            onChange={handlePreferencesChange}
          >
            {CodeEditorThemes.map((theme) => (
              <SelectItem
                key={theme}
                // value={theme}  // key is taken as the value
              >
                {theme}
              </SelectItem>
            ))}
          </Select>
          <Input
            type="number"
            name="codeEditorWindowSize" // editor-height to be precise
            min={250}
            max={1000}
            step={50}
            label="Code Editor Size"
            labelPlacement="outside"
            placeholder="Min 250px | Default 500px | Max 1000px"
            isDisabled={!isEditing}
            value={preferences.codeEditorWindowSize}
            onChange={handlePreferencesChange}
            required
          ></Input>
          <Input
            type="number"
            name="codeEditorFontSize" // editor-height to be precise
            min={10}
            max={20}
            label="Code Editor Font Size"
            labelPlacement="outside"
            placeholder="Min 10px | Default 15px | Max 20px"
            isDisabled={!isEditing}
            value={preferences.codeEditorFontSize}
            onChange={handlePreferencesChange}
            required
          ></Input>

          <div className="flex flex-row justify-center gap-8 my-3">
            <Button type="button" color="danger" onClick={toggleEditing}>
              {isEditing ? "Cancel" : "Edit"}
            </Button>
            {isEditing && (
              <Button type="submit" color="primary" onClick={handleUpdateSettings}>
                Update
              </Button>
            )}
          </div>
        </CardBody>
        {/* </Form> */}
      </Card>
    </div>
  );
};

export default SettingsPreferences;

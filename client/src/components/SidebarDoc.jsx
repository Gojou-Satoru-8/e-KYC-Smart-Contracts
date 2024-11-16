import { Divider, Button } from "@nextui-org/react";
import { Link } from "react-router-dom";
import HomeIcon from "../assets/home.png";
import SettingsIcon from "../assets/settings.png";
import { useSelector } from "react-redux";

const SidebarDoc = ({ styles, children }) => {
  const authState = useSelector((state) => state.auth);
  return (
    <div
      className={
        styles === "default" ? "app-sidebar rounded-tr-xl shadow-large min-w-[20%]" : styles
      }
    >
      <div className="h-[20%] mx-4 my-10 flex flex-col">
        <div className="py-2 text-center">
          <Link to="/">
            <Button
              color="secondary"
              variant="light"
              className="w-[80%]"
              startContent={<img src={HomeIcon}></img>}
            >
              Home
            </Button>
          </Link>
        </div>
        <div className="py-1 text-center">
          <Link to={`/${authState.entityType?.toLowerCase()}s/settings`}>
            <Button
              color="secondary"
              variant="ghost"
              className="w-[80%]"
              startContent={<img width="22px" src={SettingsIcon}></img>}
            >
              Settings
            </Button>
          </Link>
        </div>
        {/* <div className="py-2">
          <Link to="/"></Link>
        </div> */}
      </div>
      <Divider />
      <div className="h-[50%] mx-2 my-6 flex flex-col justify-start gap-4 overflow-auto">
        <div className="text-center">
          <h1>Actions</h1>
        </div>
        {/* <div className="my-2 text-center">
          <Button
            size="sm"
            variant="flat"
            color="primary"
            radius=""
            onClick={() => dispatch(notesActions.clearSelectedTags())}
          >
            Clear Tags
          </Button>
          </div> */}
        {children}
      </div>
    </div>
  );
};

export default SidebarDoc;

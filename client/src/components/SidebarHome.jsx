import { Divider, Button } from "@nextui-org/react";
import { Link } from "react-router-dom";
import HomeIcon from "../assets/home.png";
// import { GearIcon } from "../assets/GearIcon";
import SettingsIcon from "../assets/settings.png";
import { useSelector } from "react-redux";
// import CloseIcon from "../assets/close (1).png";

const SidebarHome = ({ isDeleting, setIsDeleting, styles }) => {
  const authState = useSelector((state) => state.auth);

  const toggleDeleting = (e) => setIsDeleting((prev) => !prev);

  return (
    // <aside className={styles === "default" ? "fixed rounded-r-2xl shadow-xl h-full" : styles}>
    <aside
      className={
        styles === "default" ? "app-sidebar rounded-tr-xl shadow-large min-w-[20%]" : styles
      }
    >
      <div className="mx-4 my-10 flex flex-col gap-1 overflow-hidden">
        <div className="text-center">
          <Link to="/users/new-document">
            <Button
              variant="light"
              color="secondary"
              className="w-[80%]"
              // startContent={<img src={NoteIcon}></img>}
            >
              New Document
            </Button>
          </Link>
        </div>
        <Divider />
        <div className="py-2 text-center">
          <Link to="/users">
            <Button
              color="secondary"
              variant="solid"
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
        <div className="py-1 text-center">
          <Button
            color={isDeleting ? "success" : "danger"}
            variant="ghost"
            className="w-[80%]"
            onClick={toggleDeleting}
          >
            {isDeleting ? "Cancel" : "Delete Notes"}
          </Button>
        </div>
      </div>
      <Divider />
    </aside>
  );
};

export default SidebarHome;

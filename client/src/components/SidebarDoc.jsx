import { Divider, Button, Listbox, ListboxItem } from "@nextui-org/react";
import { Link } from "react-router-dom";
import HomeIcon from "../assets/home.png";
// import SettingsIcon from "../assets/settings.png";
import SettingsIcon from "../assets/SettingsIcon";
import IconWrapper from "./IconWrapper";
import { useSelector } from "react-redux";

const SidebarDoc = ({ styles, children }) => {
  const authState = useSelector((state) => state.auth);
  return (
    <aside
      className={
        styles === "default"
          ? "app-sidebar rounded-tr-xl shadow-large hidden sm:block sm:w-2/5 md:w-1/3 lg:w-1/4 gap-0"
          : styles
      }
    >
      <Listbox
        aria-label="User Menu"
        className="my-2 gap-0"
        itemClasses={{
          base: "px-3 first:rounded-t-medium last:rounded-b-medium rounded-none gap-3 h-12 ",
        }}
      >
        <ListboxItem
          key="home"
          href="/"
          variant="bordered"
          color="success"
          startContent={
            <IconWrapper className="bg-primary/10 text-primary">
              <img src={HomeIcon} alt="Home" />
            </IconWrapper>
          }
        >
          Home
        </ListboxItem>
        <ListboxItem
          key="settings"
          href={`/${authState.entityType?.toLowerCase()}s/settings`}
          variant="bordered"
          color="primary"
          startContent={
            <IconWrapper className="bg-primary/10 text-primary">
              <SettingsIcon />
            </IconWrapper>
          }
        >
          Settings
        </ListboxItem>
      </Listbox>

      <Divider />
      {children && (
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
      )}
    </aside>
  );
};

export default SidebarDoc;

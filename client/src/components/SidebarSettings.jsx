import { Divider, Button, Listbox, ListboxItem } from "@nextui-org/react";
import IconWrapper from "./IconWrapper";
import { Link } from "react-router-dom";
import HomeIcon from "../assets/HomeIcon";

const SidebarSettings = ({ styles, children }) => {
  return (
    <aside
      className={
        styles === "default" ? "app-sidebar rounded-tr-xl shadow-large min-w-[20%]" : styles
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
            <IconWrapper className="bg-success/10 text-success">
              <HomeIcon />
            </IconWrapper>
          }
        >
          Home
        </ListboxItem>
      </Listbox>

      <Divider />
      {children && (
        <div className="h-[70%] mx-2 my-6 flex flex-col justify-start gap-4 overflow-auto">
          <div className="text-center">
            <h1>Sections</h1>
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

export default SidebarSettings;

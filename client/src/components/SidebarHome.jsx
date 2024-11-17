import { Divider, Button, Listbox, ListboxItem, ListboxSection } from "@nextui-org/react";
import { Link } from "react-router-dom";
import HomeIcon from "../assets/home.png";
// import { GearIcon } from "../assets/GearIcon";
// import SettingsIcon from "../assets/settings.png";
import SettingsIcon from "../assets/SettingsIcon";
import { useDispatch, useSelector } from "react-redux";
import CloseIcon from "../assets/close (1).png";
import { documentsActions } from "../store";
import BookIcon from "../assets/BookIcon";
import IconWrapper from "./IconWrapper";
import DeleteIcon from "../assets/DeleteIcon";

const statusColor = { Pending: "warning", Approved: "success", Rejected: "danger" };

const SidebarHome = ({ isDeleting, setIsDeleting, styles }) => {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const documentsState = useSelector((state) => state.documents);

  const { tags, selectedTags } = documentsState;
  const toggleDeleting = (e) => setIsDeleting((prev) => !prev);
  const isVerifiedUser = authState.entityType === "User" && authState.entity?.isVerified;
  return (
    <aside
      className={
        styles === "default"
          ? "app-sidebar rounded-tr-xl shadow-large hidden sm:block sm:w-2/5 md:w-1/3 lg:w-1/4 gap-0"
          : styles
      }
    >
      <div className="px-4 my-2 text-sm">
        <h1>Quick Menu</h1>
      </div>

      <Listbox
        aria-label="User Menu"
        // onAction={(key) => alert(key)}
        className="my-2 gap-0"
        itemClasses={{
          base: "px-3 first:rounded-t-medium last:rounded-b-medium rounded-none gap-3 h-12 ",
        }}
      >
        {/* <ListboxSection showDivider> */}
        <ListboxSection>
          {isVerifiedUser && (
            <ListboxItem
              key="new_document"
              href="/users/new-document"
              variant="faded"
              color="success"
              startContent={
                <IconWrapper className="bg-success/10 text-success">
                  <BookIcon className="text-lg" />
                </IconWrapper>
              }
            >
              {/* <Link to="/users/new-document">New Document</Link> */}
              New Document
            </ListboxItem>
          )}
          <ListboxItem
            key="settings"
            href={`/${authState.entityType?.toLowerCase()}s/settings`}
            variant="faded"
            color="primary"
            startContent={
              <IconWrapper className="bg-primary/10 text-primary">
                <SettingsIcon />
              </IconWrapper>
            }
          >
            {/* <Link to={`/${authState.entityType?.toLowerCase()}s/settings`}>Settings</Link> */}
            Settings
          </ListboxItem>
          {isVerifiedUser && (
            <ListboxItem
              key="delete_document"
              color={isDeleting ? "success" : "danger"}
              variant="flat"
              onClick={toggleDeleting}
              startContent={
                <IconWrapper className="bg-primary/10 text-primary">
                  <DeleteIcon />
                </IconWrapper>
              }
            >
              {isDeleting ? "Cancel" : "Delete Notes"}
            </ListboxItem>
          )}
        </ListboxSection>
      </Listbox>
      <Divider />
      <div className="text-center my-4">
        <h1>Tags</h1>
      </div>
      <div className="my-2 text-center">
        {selectedTags?.length !== 0 && (
          <Button
            size="sm"
            variant="flat"
            color="primary"
            radius=""
            onClick={() => dispatch(documentsActions.clearSelectedTags())}
          >
            Clear Tags
          </Button>
        )}
        {/* <Divider /> */}
      </div>
      <ul>
        <div className="flex flex-row flex-wrap justify-center gap-2">
          {tags.map((tag) => (
            <div className="py-1" key={tag}>
              <li>
                <Button
                  size="sm"
                  variant={selectedTags?.includes(tag) ? "solid" : "flat"}
                  color={statusColor[tag]}
                  radius="full"
                  onClick={() => {
                    // console.log("Outer button clicked");
                    dispatch(documentsActions.addSelectedTags(tag));
                  }}
                >
                  {tag}

                  {selectedTags?.includes(tag) && (
                    <div
                      className="hover:bg-red-400 rounded-lg min-w-3"
                      onClick={(e) => {
                        e.stopPropagation(); // Stopping the "click" event here, otherwise it will trigger the onClick
                        // event-handler of the parent element Button
                        // console.log("Inner div clicked");
                        dispatch(documentsActions.removeSelectedTags(tag));
                      }}
                    >
                      <img src={CloseIcon} alt="" width={"15"} />
                    </div>
                  )}
                </Button>
              </li>
              {/* <Divider /> */}
            </div>
          ))}
        </div>
      </ul>
    </aside>
  );
};
export default SidebarHome;

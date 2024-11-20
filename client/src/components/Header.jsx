import {
  Navbar,
  // NavbarMenuToggle,
  NavbarBrand,
  NavbarContent,
  Input,
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  Avatar,
  Button,
} from "@nextui-org/react";
// import { SearchIcon } from "../assets/SearchIcon.jsx";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { authActions } from "../store/index.js";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle.jsx";

const Header = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const handleLogout = async () => {
    try {
      const { entityType } = authState;
      const response = await fetch(
        `http://localhost:3000/api/${entityType.toLowerCase()}s/logout`,
        { credentials: "include" }
      );
      if (!response.ok) {
        alert("Unable to log out! Server Issue");
        return;
      }
      const data = await response.json();
      console.log(data);
      dispatch(authActions.unsetEntity()); // Need to call this, cuz this will cause a re-render of the components
      // which are using the authState, for example HomePage, based on which we are nagivated to Login
      // dispatch(notesActions.clearAll());
    } catch (err) {
      console.log(err.message);
    }
  };

  return (
    <header className="my-6">
      <Navbar
        isBordered
        className="app-header w-[95%] sm:w-[90%] mx-auto my-2 rounded-3xl shadow-large"
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setIsMenuOpen}
      >
        {/* <NavbarContent className="sm:hidden" justify="start">
          <NavbarMenuToggle aria-label={isMenuOpen ? "Close menu" : "Open menu"} />
        </NavbarContent> */}
        <NavbarContent className="items-center gap-8" justify="start">
          <NavbarBrand className={authState.isAuthenticated ? "justify-normal" : "justify-center"}>
            <p className="font-bold text-inherit text-3xl text-purple-400">KYC Verification</p>
          </NavbarBrand>
        </NavbarContent>
        {authState.isAuthenticated && (
          <NavbarContent className="gap-8" justify="end">
            {/* <Input
              classNames={{
                base: "max-w-full sm:max-w-[15rem] h-10",
                mainWrapper: "h-full",
                input: "text-small",
                inputWrapper:
                  "h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20",
              }}
              placeholder="Type to search..."
              size="sm"
              startContent={<SearchIcon size={18} />}
              type="search"
            /> */}
            <ThemeToggle />
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  isBordered
                  showFallback
                  as="button"
                  className="transition-transform"
                  color="secondary"
                  name={authState.entity?.name
                    .split(" ")
                    .map((segment) => segment.at(0))
                    .filter((letter) => letter.charCodeAt(0) >= 65 && letter.charCodeAt(0) <= 90)
                    // This line filters small letters
                    .join("")}
                  // Here we're taking initials of each segment of name
                  size="sm"
                  src={`http://localhost:3000/src/${authState.entityType?.toLowerCase()}-images/${
                    authState.entity?.photo
                  }?t=${new Date().getTime()}`}
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="Profile Actions" variant="solid">
                {/* <DropdownItem key="profile" className="h-14 gap-2">
                {authState.user ? `Signed in as ${authState.user.email}` : "Not Signed in"}
              </DropdownItem> */}
                <DropdownItem
                  key="settings"
                  onClick={() => {
                    navigate(`/${authState.entityType?.toLowerCase()}s/settings`);
                  }}
                >
                  My Settings
                </DropdownItem>

                <DropdownItem key="logout" color="danger" onClick={handleLogout}>
                  Log Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarContent>
        )}
      </Navbar>
    </header>
  );
};

export default Header;

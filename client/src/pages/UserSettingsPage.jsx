import { Button } from "@nextui-org/react";
import MainLayout from "../components/MainLayout.jsx";
import SidebarSettings from "../components/SidebarSettings.jsx";
import Content from "../components/Content.jsx";
import SettingsAccount from "../components/SettingsAccount.jsx";
import { useState } from "react";
// import SettingsPreferences from "../components/SettingsUserPreferences.jsx";

const UserSettingsPage = () => {
  const [activeSection, setActiveSection] = useState("accounts");

  return (
    <MainLayout>
      <SidebarSettings styles="default">
        <div className="action-buttons w-[95%] md:w-3/4 mx-auto my-10 flex flex-col justify-center gap-4">
          <Button
            color="primary"
            variant={activeSection === "accounts" ? "solid" : "flat"}
            onClick={() => setActiveSection("accounts")}
          >
            Account
          </Button>
          <Button
            color="primary"
            variant={activeSection === "preferences" ? "solid" : "flat"}
            onClick={() => setActiveSection("preferences")}
          >
            Preferences
          </Button>
        </div>
      </SidebarSettings>
      <Content title="Settings">
        {activeSection === "accounts" && <SettingsAccount />}
        {/* {activeSection === "preferences" && <SettingsPreferences />} */}
      </Content>
    </MainLayout>
  );
};

export default UserSettingsPage;

import { useSelector } from "react-redux";
import MainLayout from "../components/MainLayout.jsx";
import SidebarSettings from "../components/SidebarSettings.jsx";
import Content from "../components/Content.jsx";
import SettingsUser from "../components/SettingsUser.jsx";
import SettingsVerifier from "../components/SettingsVerifier.jsx";
import SettingsOrganization from "../components/SettingsOrganization.jsx";

const SettingsPage = () => {
  const authState = useSelector((state) => state.auth);

  return (
    <MainLayout>
      <SidebarSettings styles="default"></SidebarSettings>
      <Content title="Settings">
        {authState.entityType === "User" && <SettingsUser />}
        {authState.entityType === "Verifier" && <SettingsVerifier />}
        {authState.entityType === "Organization" && <SettingsOrganization />}
      </Content>
    </MainLayout>
  );
};

export default SettingsPage;

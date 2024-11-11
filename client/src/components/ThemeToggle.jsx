import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "../assets/ThemeIcons";
import { Button } from "@nextui-org/react";
const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <Button
      isIconOnly
      radius="full"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="btn-secondary"
    >
      {theme === "dark" ? (
        <div className="flex items-center gap-2">
          <SunIcon size={16} />
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <MoonIcon size={16} />
        </div>
      )}
    </Button>
  );
};

export default ThemeToggle;

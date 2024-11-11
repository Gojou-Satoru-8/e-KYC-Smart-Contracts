import React from "react";
import ReactDOM from "react-dom/client";
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes"; // For setting theme dynamically
import { Provider } from "react-redux";
import store from "./store/index";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <NextUIProvider>
      <NextThemesProvider attribute="class" defaultTheme="system">
        <Provider store={store}>
          <App />
        </Provider>
      </NextThemesProvider>
    </NextUIProvider>
  </React.StrictMode>
);

import { createRoot } from "react-dom/client";
import { Capacitor } from "@capacitor/core";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

if (Capacitor.isNativePlatform()) {
  setBaseUrl("https://pocketchangetherapy.replit.app");
}

createRoot(document.getElementById("root")!).render(<App />);

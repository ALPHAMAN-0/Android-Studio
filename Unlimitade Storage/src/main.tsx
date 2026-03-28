import React from "react";
import ReactDOM from "react-dom/client";
import { App as CapApp } from "@capacitor/app";
import { initDatabase } from "@/lib/services/database";
import App from "./App";
import "./globals.css";

// Handle Android back button
CapApp.addListener("backButton", ({ canGoBack }) => {
  if (canGoBack) {
    window.history.back();
  } else {
    CapApp.exitApp();
  }
});

// Initialize database then render
initDatabase().then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});

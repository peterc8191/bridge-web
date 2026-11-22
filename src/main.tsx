import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { AppDataProvider } from "./context/AppDataProvider";
import { migrateStorage } from "./lib/storage";

migrateStorage();

// BrowserRouter under the deploy base path (e.g. /bridge-web/ on GitHub Pages).
// Deep links survive a hard refresh there via the 404.html redirect emitted
// by vite.config.ts and the decoder script in index.html.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <AppDataProvider>
        <App />
      </AppDataProvider>
    </BrowserRouter>
  </StrictMode>,
);

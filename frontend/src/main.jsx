import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { SessionProvider } from "./contexts/SessionContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
  <SessionProvider>
    <App />
</SessionProvider>
  </StrictMode>
);

import "./utils/patchHistory";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { UsuarioProvider } from "./context/UsuarioContext";
import App from "./App";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <UsuarioProvider>
        <App />
      </UsuarioProvider>
    </BrowserRouter>
  </StrictMode>
);

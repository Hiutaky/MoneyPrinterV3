import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
// import "./output.css";
import App from "./App.tsx";

document.addEventListener("DOMContentLoaded", () => {
    createRoot(document.getElementById("root")!).render(
        <StrictMode>
            <App />
        </StrictMode>
    );
})

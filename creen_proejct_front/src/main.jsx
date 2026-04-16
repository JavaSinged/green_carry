import { createRoot } from "react-dom/client";
import App from "./App.jsx";

// router setting
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

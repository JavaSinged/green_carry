import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

// router setting
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
    <Analytics />
    <SpeedInsights />
  </BrowserRouter>
);

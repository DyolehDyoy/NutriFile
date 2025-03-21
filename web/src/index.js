import React from "react";
import ReactDOM from "react-dom/client";  // ✅ Use react-dom/client
import Dashboard from "./App";
import { CssBaseline } from "@mui/material";

const root = ReactDOM.createRoot(document.getElementById("root"));  // ✅ Correct way in React 18+
root.render(
  <React.StrictMode>
    <CssBaseline />
    <Dashboard />
  </React.StrictMode>
);

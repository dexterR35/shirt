import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Navigate } from "react-router";
import { RouterProvider } from "react-router/dom";
import App from "./App.jsx";
import StudioPage from "./pages/StudioPage.jsx";
import CatalogPage from "./pages/CatalogPage.jsx";
import "./styles.css";

/**
 * App is the layout (fixed sidebar, collection tray, shared state); pages are its children.
 *   /studio                          plain base shirt
 *   /studio/:teamId/:variant         a team's Home or Away kit
 *   /catalog/:groupId/:competition   competition table (defaults filled in by the page)
 */
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/studio" replace /> },
      { path: "studio/:teamId?/:variant?", element: <StudioPage /> },
      { path: "catalog/:groupId?/:competitionSlug?", element: <CatalogPage /> },
      { path: "*", element: <Navigate to="/studio" replace /> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);

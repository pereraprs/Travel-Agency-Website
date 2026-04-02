import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./component/Style/Header.css";
import "./component/Style/Home.css";
import "./component/Style/Destinations.css";
import "./component/Style/Login.css";
import "./component/Style/Register.css";
import "./component/Style/Footer.css";
import "./component/Style/Packages.css";

// Initialize and render the app
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

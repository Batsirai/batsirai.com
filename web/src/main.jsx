import React from "react";
import { createRoot } from "react-dom/client";
import "./image-slot.js";
import "./batsirai-os.css";
import App from "./batsirai-os.jsx";

createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);

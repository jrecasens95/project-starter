import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "{{reactAppImportPath}}";
{{reactMainImports}}
{{reactThemeImports}}
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {{reactThemeOpen}}
    {{reactProviderOpen}}
    <App />
    {{reactProviderClose}}
    {{reactThemeClose}}
  </React.StrictMode>
);

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          gutter={8}
          toastOptions={{
            duration: 3500,
            style: {
              fontFamily: "Inter, sans-serif",
              fontSize: "0.875rem",
              fontWeight: 500,
              borderRadius: "10px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
              padding: "12px 16px",
            },
            success: {
              iconTheme: { primary: "#10B981", secondary: "#fff" },
            },
            error: {
              iconTheme: { primary: "#EF4444", secondary: "#fff" },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

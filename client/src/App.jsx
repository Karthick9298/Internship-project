import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import UploadPage from "./pages/UploadPage";
import SharePage from "./pages/SharePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"          element={<HomePage />} />
        <Route path="/upload"    element={<UploadPage />} />
        <Route path="/share"     element={<SharePage />} />
        <Route path="/share/:code" element={<SharePage />} />
        <Route path="/login"     element={<LoginPage />} />
        <Route path="/register"  element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        {/* Catch-all → home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;

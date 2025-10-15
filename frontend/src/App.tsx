import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { LoginPage } from "./components/LoginPage";
import { RegistrationPage } from "./components/RegistrationPage";
import { Dashboard } from "./components/Dashboard";
import { NotebookChat } from "./components/NotebookChat";

function ChatWrapper() {
  const { notebookId } = useParams<{ notebookId: string }>();
  const navigate = useNavigate();

  if (!notebookId) {
    navigate("/dashboard");
    return null;
  }

  return <NotebookChat notebookId={notebookId} onBack={() => navigate("/dashboard")} />;
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token && location.pathname !== "/login" && location.pathname !== "/register") {
      navigate("/login");
    } else if (token && location.pathname === "/") {
      navigate("/dashboard");
    }
  }, [navigate, location]);

  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          <LoginPage
            onLogin={() => navigate("/dashboard")}
            onGuest={() => navigate("/dashboard")}
            onSignUp={() => navigate("/register")}
          />
        } 
      />

      <Route
        path="/register"
        element={
          <RegistrationPage
            onRegister={() => navigate("/login")}
            onBackToLogin={() => navigate("/login")}
          />
        }
      />

      <Route
        path="/dashboard"
        element={
          <Dashboard
            onNotebookClick={() => navigate("/chat/:notebookId")}
          />
        }
      />

      <Route path="/chat/:notebookId" element={<ChatWrapper />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

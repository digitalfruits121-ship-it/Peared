import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Layout/Header";
import SplitBoardPage from "./pages/SplitBoardPage";
import SettingsPage from "./components/Settings/SettingsPage";
import LoginPage from "./pages/LoginPage";
import { Toaster } from "./components/ui/sonner";
import { AppSettingsProvider } from "./contexts/AppSettingsContext";
import { CardsProvider } from "./contexts/CardsContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

function AuthGuard({ children }) {
  const { currentUser, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-neon-400 text-lg animate-pulse">Loading...</div>
      </div>
    );
  }
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  const { currentUser } = useAuth();
  return (
    <Routes>
      <Route
        path="/login"
        element={currentUser ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/"
        element={
          <AuthGuard>
            <div className="App min-h-screen bg-gray-950">
              <Header />
              <SplitBoardPage />
            </div>
          </AuthGuard>
        }
      />
      <Route
        path="/settings"
        element={
          <AuthGuard>
            <div className="App min-h-screen bg-gray-950">
              <Header />
              <SettingsPage />
            </div>
          </AuthGuard>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppSettingsProvider>
        <BrowserRouter>
          <CardsProvider>
            <AppRoutes />
            <Toaster />
          </CardsProvider>
        </BrowserRouter>
      </AppSettingsProvider>
    </AuthProvider>
  );
}

export default App;

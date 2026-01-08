import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Layout/Header";
import SplitBoardPage from "./pages/SplitBoardPage";
import SettingsPage from "./components/Settings/SettingsPage";
import { Toaster } from "./components/ui/sonner";
import { AppSettingsProvider } from "./contexts/AppSettingsContext";
import { CardsProvider } from "./contexts/CardsContext";

function App() {
  return (
    <AppSettingsProvider>
      <CardsProvider>
        <div className="App min-h-screen bg-gray-950">
          <BrowserRouter>
            <Header />
            <Routes>
              <Route path="/" element={<SplitBoardPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
        </div>
      </CardsProvider>
    </AppSettingsProvider>
  );
}

export default App;

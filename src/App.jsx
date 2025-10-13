import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Favorites from "./pages/Favorites.jsx";
import Browse from "./pages/Browse.jsx";
import Settings from "./pages/Settings.jsx";
import "./App.css";

export default function App() {
  const { pathname } = useLocation();

  return (
    <div className="app">
      <Navbar activePath={pathname} />
      <main className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/favorites" replace />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/favorites" replace />} />
        </Routes>
      </main>
      <footer className="footer">
        <span>Built with API-Football • {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}

import { Link } from "react-router-dom";

export default function Navbar({ activePath }) {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="brand">Football Leagues 2025</div>
        <div className="navlinks">
          <Link
            to="/favorites"
            className={`navlink ${activePath === "/favorites" ? "active" : ""}`}
          >
            ★ Favorites
          </Link>
          <Link
            to="/browse"
            className={`navlink ${activePath === "/browse" ? "active" : ""}`}
          >
            Browse
          </Link>
        </div>
      </div>
    </nav>
  );
}

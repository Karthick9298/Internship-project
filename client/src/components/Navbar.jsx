import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Upload, Share2, LayoutDashboard, LogOut, LogIn, UserPlus, Menu, X } from "lucide-react";
import { useState } from "react";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
          <div className="navbar-logo-icon">
            <Share2 size={18} />
          </div>
          <span>CodeShare</span>
        </Link>

        {/* Desktop nav */}
        <div className="navbar-links">
          <Link to="/upload" className={`navbar-link ${isActive("/upload") ? "active" : ""}`}>
            <Upload size={16} /> Upload
          </Link>
          <Link to="/share" className={`navbar-link ${isActive("/share") ? "active" : ""}`}>
            <Share2 size={16} /> Get File
          </Link>
          {user && (
            <Link to="/dashboard" className={`navbar-link ${isActive("/dashboard") ? "active" : ""}`}>
              <LayoutDashboard size={16} /> Dashboard
            </Link>
          )}
        </div>

        {/* Auth buttons — desktop */}
        <div className="navbar-auth">
          {user ? (
            <>
              <span className="navbar-user">Hi, {user.name.split(" ")[0]}</span>
              <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                <LogOut size={15} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">
                <LogIn size={15} /> Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                <UserPlus size={15} /> Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="navbar-mobile fade-in">
          <Link to="/upload" className="navbar-mobile-link" onClick={() => setMenuOpen(false)}>
            <Upload size={16} /> Upload File
          </Link>
          <Link to="/share" className="navbar-mobile-link" onClick={() => setMenuOpen(false)}>
            <Share2 size={16} /> Get File by Code
          </Link>
          {user && (
            <Link to="/dashboard" className="navbar-mobile-link" onClick={() => setMenuOpen(false)}>
              <LayoutDashboard size={16} /> Dashboard
            </Link>
          )}
          <hr className="divider" style={{ margin: "8px 0" }} />
          {user ? (
            <button className="navbar-mobile-link" onClick={handleLogout} style={{ background: "none", border: "none", cursor: "pointer", width: "100%", textAlign: "left" }}>
              <LogOut size={16} /> Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="navbar-mobile-link" onClick={() => setMenuOpen(false)}>
                <LogIn size={16} /> Login
              </Link>
              <Link to="/register" className="navbar-mobile-link" onClick={() => setMenuOpen(false)}>
                <UserPlus size={16} /> Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiHome,
  FiBook,
  FiBarChart2,
  FiHelpCircle,
  FiUser,
  FiCalendar,
  FiMenu,
  FiX,
  FiInbox,
} from "react-icons/fi";
import Logo from "../Logo/Logo";
import { useAuth } from "../../context/AuthContext";
import "./Sidebar.css";

// ─── Öğrenci menüsü ───────────────────────────────────────────────────────────
const STUDENT_MENU = [
  { path: "/dashboard", icon: <FiHome />, label: "Anasayfa" },
  { path: "/courses", icon: <FiBook />, label: "Derslerim" },
  { path: "/exams", icon: <FiBarChart2 />, label: "Netler" },
  { path: "/questions", icon: <FiHelpCircle />, label: "Sorular" },
  { path: "/ders-programi", icon: <FiCalendar />, label: "Ders Programı" },
  { path: "/ogrenci-sorular", icon: <FiInbox />, label: "Soru Sor" },
  { path: "/profile", icon: <FiUser />, label: "Profil" },
];

// ─── Öğretmen menüsü ──────────────────────────────────────────────────────────
const TEACHER_MENU = [
  { path: "/ogretmen-panel", icon: <FiInbox />, label: "Gelen Sorular" },
  { path: "/ogretmen-dashboard", icon: <FiHome />, label: "Özet" },
  { path: "/profile", icon: <FiUser />, label: "Profil" },
];

const Sidebar = () => {
  const { isTeacher } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) setIsMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Role göre menü seç
  const menuItems = isTeacher ? TEACHER_MENU : STUDENT_MENU;

  const handleLinkClick = () => {
    if (isMobile) setIsMobileOpen(false);
  };

  return (
    <>
      {isMobile && (
        <div className="mobile-header">
          <button
            className="mobile-menu-btn"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            {isMobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            <span>Menü</span>
          </button>
        </div>
      )}

      <div
        className={`sidebar ${!isMobile && (isOpen ? "open" : "closed")} ${isMobile && isMobileOpen ? "mobile-open" : ""}`}
      >
        <div className="sidebar-header">
          <div
            className={`logo-wrapper ${!isOpen && !isMobile ? "hidden" : ""}`}
          >
            <Link
              to={isTeacher ? "/ogretmen-dashboard" : "/dashboard"}
              onClick={handleLinkClick}
            >
              <Logo size="small" />
            </Link>
          </div>

          {!isMobile && (
            <button className="toggle-btn" onClick={() => setIsOpen(!isOpen)}>
              <FiMenu size={24} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item ${location.pathname === item.path ? "active" : ""}`}
              title={!isOpen && !isMobile ? item.label : ""}
              onClick={handleLinkClick}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {isMobile && isMobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsMobileOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 999,
          }}
        />
      )}
    </>
  );
};

export default Sidebar;

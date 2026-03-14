import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiHome,
  FiBook,
  FiBarChart2,
  FiTarget,
  FiHelpCircle,
  FiUser,
  FiCalendar,
  FiMenu,
  FiX, // Mobil kapatma için eklendi
} from "react-icons/fi";
import Logo from "../Logo/Logo";
import "./Sidebar.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false); // Mobil için ayrı state
  const location = useLocation();

  // Pencere boyutunu takip et
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsMobileOpen(false); // Desktop'a geçince mobil menüyü kapat
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    { path: "/dashboard", icon: <FiHome />, label: "Anasayfa" },
    { path: "/courses", icon: <FiBook />, label: "Derslerim" },
    { path: "/exams", icon: <FiBarChart2 />, label: "Netler" },
    { path: "/questions", icon: <FiHelpCircle />, label: "Sorular" },
    { path: "/ders-programi", icon: <FiCalendar />, label: "Ders Programı" },
    { path: "/profile", icon: <FiUser />, label: "Profil" },
  ];

  // Mobil menüyü aç/kapat
  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  // Link'e tıklayınca mobil menüyü kapat
  const handleLinkClick = () => {
    if (isMobile) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobil Header - Sadece mobilde görünür */}
      {isMobile && (
        <div className="mobile-header">
          <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
            {isMobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            <span>Menü</span>
          </button>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`
          sidebar 
          ${!isMobile && (isOpen ? "open" : "closed")}
          ${isMobile && isMobileOpen ? "mobile-open" : ""}
        `}
      >
        <div className="sidebar-header">
          <div
            className={`logo-wrapper ${!isOpen && !isMobile ? "hidden" : ""}`}
          >
            <Link to="/dashboard" onClick={handleLinkClick}>
              <Logo size="small" />
            </Link>
          </div>

          {/* Desktop toggle butonu - sadece desktop'ta göster */}
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
              className={`sidebar-item ${
                location.pathname === item.path ? "active" : ""
              }`}
              title={!isOpen && !isMobile ? item.label : ""} // Sadece desktop kapalıyken tooltip
              onClick={handleLinkClick}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Overlay - Mobil menü açıkken arka plana tıklanınca kapansın */}
      {isMobile && isMobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsMobileOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 999,
          }}
        />
      )}
    </>
  );
};

export default Sidebar;

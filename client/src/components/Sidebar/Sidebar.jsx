import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiHome,
  FiBook,
  FiBarChart2,
  FiTarget,
  FiHelpCircle,
  FiUser,
  FiCalendar,
  FiMenu, // Açma/kapama butonu için eklendi
} from "react-icons/fi";
import Logo from "../Logo/Logo";
import "./Sidebar.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true); // Sidebar durumu
  const location = useLocation();

  const menuItems = [
    { path: "/dashboard", icon: <FiHome />, label: "Anasayfa" },
    { path: "/courses", icon: <FiBook />, label: "Derslerim" },
    { path: "/exams", icon: <FiBarChart2 />, label: "Netler" },
    /* { path: "/goals", icon: <FiTarget />, label: "Hedefler" }, */
    { path: "/questions", icon: <FiHelpCircle />, label: "Sorular" },
    { path: "/ders-programi", icon: <FiCalendar />, label: "Ders Programı" },
    { path: "/profile", icon: <FiUser />, label: "Profil" },
  ];

  return (
    // Dinamik class: isOpen true ise "open", false ise "closed"
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="sidebar-header">
        {/* Logo sadece sidebar açıkken görünür */}
        <div className={`logo-wrapper ${!isOpen ? "hidden" : ""}`}>
          <Link to="/dashboard">
            <Logo size="small" />
          </Link>
        </div>

        {/* Menü Açma/Kapama Butonu */}
        <button className="toggle-btn" onClick={() => setIsOpen(!isOpen)}>
          <FiMenu size={24} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-item ${
              location.pathname === item.path ? "active" : ""
            }`}
            title={!isOpen ? item.label : ""} // Kapalıyken üzerine gelince ismini göstersin (Tooltip)
          >
            <span className="sidebar-icon">{item.icon}</span>
            {/* Yazılar CSS ile gizlenip gösterilecek */}
            <span className="sidebar-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;

import { Link, useLocation } from "react-router-dom";
import {
  FiHome,
  FiBook,
  FiBarChart2,
  FiTarget,
  FiHelpCircle,
  FiUser,
  FiCalendar,
} from "react-icons/fi";
import Logo from "../Logo/Logo";
import "./Sidebar.css";

const Sidebar = () => {
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
    <div className="sidebar">
      <div className="sidebar-header">
        <Link to="/dashboard">
          <Logo size="small" />
        </Link>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-item ${
              location.pathname === item.path ? "active" : ""
            }`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;

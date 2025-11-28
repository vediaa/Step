import { Link } from "react-router-dom";
import Logo from "../Logo/Logo";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import Button from "../Button/Button";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <Logo size="small" />
        </Link>

        <div className="navbar-actions">
          <ThemeToggle />
          <Link to="/login">
            <Button variant="outline">Giriş Yap</Button>
          </Link>
          <Link to="/register">
            <Button variant="primary">Kayıt Ol</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

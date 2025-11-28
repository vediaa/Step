import { useState, useEffect } from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import "./ThemeToggle.css";

const ThemeToggle = () => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      <div className={`toggle-track ${theme}`}>
        <div className="toggle-thumb">
          {theme === "light" ? <FiSun /> : <FiMoon />}
        </div>
      </div>
    </button>
  );
};

export default ThemeToggle;

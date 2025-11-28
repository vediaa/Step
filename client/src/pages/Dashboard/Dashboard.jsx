import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiBook, FiList, FiHelpCircle, FiBarChart2 } from "react-icons/fi";
import Card from "../../components/Card/Card";
import ThemeToggle from "../../components/ThemeToggle/ThemeToggle";
import "./Dashboard.css";

const Dashboard = () => {
  const [selectedExam, setSelectedExam] = useState("TYT");

  // Örnek sınav tarihleri (güncellenebilir)
  const examDates = {
    TYT: new Date("2025-06-14"),
    AYT: new Date("2025-06-15"),
  };

  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const examDate = examDates[selectedExam];
      const difference = examDate - now;

      if (difference > 0) {
        return {
          months: Math.floor(difference / (1000 * 60 * 60 * 24 * 30)),
          days: Math.floor((difference / (1000 * 60 * 60 * 24)) % 30),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return { months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedExam]);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Merhaba Vedia!</h1>
        <ThemeToggle />
      </div>

      <div className="exam-selection">
        <button
          className={`exam-button ${selectedExam === "TYT" ? "active" : ""}`}
          onClick={() => setSelectedExam("TYT")}
        >
          TYT
        </button>
        <button
          className={`exam-button ${selectedExam === "AYT" ? "active" : ""}`}
          onClick={() => setSelectedExam("AYT")}
        >
          AYT
        </button>
      </div>

      <Card variant="dark" className="countdown-card">
        <div className="countdown">
          <div className="countdown-item">
            <span className="countdown-value">{timeLeft.months}ay</span>
          </div>
          <div className="countdown-item">
            <span className="countdown-value">{timeLeft.days}g</span>
          </div>
          <div className="countdown-item">
            <span className="countdown-value">{timeLeft.hours}sa</span>
          </div>
          <div className="countdown-item">
            <span className="countdown-value">{timeLeft.minutes}d</span>
          </div>
          <div className="countdown-item">
            <span className="countdown-value">{timeLeft.seconds}sn</span>
          </div>
        </div>
      </Card>

      <div className="features-grid">
        <Link to="/courses" className="feature-link">
          <Card variant="secondary" className="feature-card">
            <div className="feature-icon">
              <FiBook />
            </div>
            <h3 className="feature-title">Dersler</h3>
          </Card>
        </Link>

        <Link to="/study-plan" className="feature-link">
          <Card variant="accent" className="feature-card bg-darkblue">
            <div className="feature-icon dark-icon">
              <FiList />
            </div>
            <h3 className="feature-title dark-text">Çalışma Programı</h3>
          </Card>
        </Link>

        <Link to="/questions" className="feature-link">
          <Card variant="primary" className="feature-card">
            <div className="feature-icon">
              <FiHelpCircle />
            </div>
            <h3 className="feature-title">Sorular</h3>
          </Card>
        </Link>

        <Link to="/exams" className="feature-link">
          <Card variant="dark" className="feature-card">
            <div className="feature-icon">
              <FiBarChart2 />
            </div>
            <h3 className="feature-title">Netler</h3>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;

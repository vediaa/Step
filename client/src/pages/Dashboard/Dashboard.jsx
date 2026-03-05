import { Link } from "react-router-dom";
import { FiBook, FiList, FiHelpCircle, FiBarChart2 } from "react-icons/fi";
import Card from "../../components/Card/Card";
import ThemeToggle from "../../components/ThemeToggle/ThemeToggle";
import "./Dashboard.css";
import FlipCountdown from "../../components/FlipCountdown/FlipCountdown";

const Dashboard = () => {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Merhaba Vedia!</h1>
        <ThemeToggle />
      </div>

      {/* Eski karmaşık kodların ve butonların yerini tek bir satır aldı! */}
      <FlipCountdown />

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

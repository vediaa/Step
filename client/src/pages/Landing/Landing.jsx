import { Link } from "react-router-dom";
import {
  FiBook,
  FiAward,
  FiTrendingUp,
  FiUsers,
  FiClock,
  FiCheckCircle,
} from "react-icons/fi";
import Button from "../../components/Button/Button";
import Logo from "../../components/Logo/Logo";
import "./Landing.css";

const Landing = () => {
  const features = [
    {
      icon: <FiBook />,
      title: "Geniş Soru Bankası",
      description: "Binlerce soru ile pratiğini arttır",
    },
    {
      icon: <FiAward />,
      title: "Gerçek Sınav Deneyimi",
      description: "Gerçek sınavlar gibi ortamda pratik yap",
    },
    {
      icon: <FiTrendingUp />,
      title: "İlerleme Takibi",
      description: "Performansını detaylı raporlarla izle",
    },
    {
      icon: <FiUsers />,
      title: "Uzman Eğitmenler",
      description: "Alanında uzman eğitmenlerden destek al",
    },
    {
      icon: <FiClock />,
      title: "7/24 Erişim",
      description: "İstediğin zaman, istediğin yerden çalış",
    },
    {
      icon: <FiCheckCircle />,
      title: "Detaylı Çözümler",
      description: "Her sorunun detaylı çözümüne ulaş",
    },
  ];

  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-content">
          <Logo size="large" />
          <h1 className="hero-title">
            Sınavlara Hazırlığın <br />
            <span className="gradient-text">Yeni Adresi</span>
          </h1>
          <p className="hero-description">
            ExamApp ile sınavlara en etkili şekilde hazırlan. Binlerce soru,
            detaylı analizler ve uzman desteği ile hedefine ulaş.
          </p>
          <div className="hero-actions">
            <Link to="/register">
              <Button variant="primary">Hemen Başla</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline">Giriş Yap</Button>
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="floating-card card-1">
            <FiBook className="card-icon" />
            <span>1000+ Soru</span>
          </div>
          <div className="floating-card card-2">
            <FiUsers className="card-icon" />
            <span>5000+ Öğrenci</span>
          </div>
          <div className="floating-card card-3">
            <FiAward className="card-icon" />
            <span>%95 Başarı</span>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="features-container">
          <h2 className="section-title">Neden ExamApp?</h2>
          <p className="section-description">
            Sınav hazırlığını kolaylaştıran özellikleri keşfet
          </p>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="cta-content">
          <h2 className="cta-title">Başarıya Giden Yolculuğa Başla</h2>
          <p className="cta-description">
            Hemen kaydol ve hedeflerine ulaşmak için ilk adımı at!
          </p>
          <Link to="/register">
            <Button variant="primary">Ücretsiz Kaydol</Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;

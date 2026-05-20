// pages/Analysis/Analysis.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OverviewStats from "./components/OverviewStats/OverviewStats";
import ZoomableTrendChart from "./components/ZoomableTrendChart/ZoomableTrendChart";
import SubjectAnalysisCard from "./components/SubjectAnalysisCard/SubjectAnalysisCard";
import Button from "../../../components/Button/Button";
import "./Analysis.scss";

// Vite'da ortam değişkenleri process.env ile değil, import.meta.env ile okunur.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const Analysis = () => {
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [stats, setStats] = useState(null);
  const [targets, setTargets] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Lütfen giriş yapın");
        setLoading(false);
        return;
      }

      const [examsRes, statsRes, targetsRes] = await Promise.all([
        fetch(`${API_URL}/exams?limit=200`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch(`${API_URL}/targets/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch(`${API_URL}/targets`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
      ]);

      if (examsRes.ok) {
        const examsData = await examsRes.json();
        setExams(examsData.data);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data.stats);
        setTargets(statsData.data.targets);
      } else if (targetsRes.ok) {
        const targetsData = await targetsRes.json();
        setTargets(targetsData.data);
      }
    } catch (err) {
      console.error("Veri yükleme hatası:", err);
      setError("Veriler yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analysis-container">
        <div className="analysis-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Analizler hazırlanıyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analysis-container">
        <div className="analysis-content">
          <div className="error-container">
            <p className="error-icon">⚠️</p>
            <p className="error-text">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // TYT ve AYT denemeleri
  const tytExams = exams.filter((e) => e.type === "TYT");
  const aytExams = exams.filter((e) => e.type === "AYT");

  return (
    <div className="analysis-container">
      <div className="analysis-content">
        {/* Header */}
        <div className="analysis-header">
          <div className="header-text">
            <h1 className="page-title">Detaylı Analiz</h1>
            <p className="page-subtitle">
              Performansını derinlemesine incele ve gelişim alanlarını keşfet
            </p>
          </div>
          <div className="header-actions">
            <Button variant="yellow" onClick={() => navigate("/history")}>
              Geçmiş Denemeler
            </Button>
          </div>
          <div>
            <Button variant="logoblue" onClick={() => navigate("/exams")}>
              Yeni Deneme +
            </Button>
          </div>
        </div>

        {/* Boş durum */}
        {exams.length === 0 ? (
          <div className="empty-state">
            <p className="empty-icon">📈</p>
            <p className="empty-title">Henüz analiz için veri yok</p>
            <p className="empty-text">
              Deneme ekleyerek gelişimini takip etmeye başla!
            </p>
            <Button
              variant="primary"
              onClick={() => navigate("/exams")}
              style={{ marginTop: "20px" }}
            >
              İlk Denemeyi Ekle
            </Button>
          </div>
        ) : (
          <>
            {/* Genel İstatistikler */}
            <section className="analysis-section">
              <OverviewStats stats={stats} targets={targets} />
            </section>

            {/* TYT Grafiği */}
            {tytExams.length > 0 && (
              <section className="analysis-section">
                <ZoomableTrendChart
                  exams={tytExams}
                  targetNet={targets?.tytNet}
                  examType="TYT"
                />
              </section>
            )}

            {/* AYT Grafiği */}
            {aytExams.length > 0 && (
              <section className="analysis-section">
                <ZoomableTrendChart
                  exams={aytExams}
                  targetNet={targets?.aytNet}
                  examType="AYT"
                />
              </section>
            )}

            {/* Ders Bazlı Analizler */}
            <section className="analysis-section subject-section">
              <h2 className="section-title">📚 Ders Bazlı Detaylar</h2>
              <div className="subject-grid">
                {tytExams.length > 0 && (
                  <SubjectAnalysisCard exams={tytExams} examType="TYT" />
                )}
                {aytExams.length > 0 && (
                  <SubjectAnalysisCard exams={aytExams} examType="AYT" />
                )}
              </div>
            </section>

            {/* Hızlı Aksiyonlar */}
            <section className="analysis-section quick-actions">
              <div className="action-card" onClick={() => navigate("/exams")}>
                <span className="action-icon">➕</span>
                <div className="action-text">
                  <h4>Yeni Deneme Ekle</h4>
                  <p>Gelişimini takip etmeye devam et</p>
                </div>
              </div>
              <div className="action-card" onClick={() => navigate("/history")}>
                <span className="action-icon">📖</span>
                <div className="action-text">
                  <h4>Geçmiş Denemeleri Gör</h4>
                  <p>Tüm denemelerini incele</p>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default Analysis;

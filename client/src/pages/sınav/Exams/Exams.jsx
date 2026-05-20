// pages/Exams/Exams.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TargetSettings from "./components/TargetSettings/TargetSettings";
import ExamInput from "./components/ExamInput/ExamInput";
import QuickAnalysis from "./components/QuickAnalysis/QuickAnalysis";
import Button from "../../../components/Button/Button";
import "./Exams.scss";

// Vite'da ortam değişkenleri process.env ile değil, import.meta.env ile okunur.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const Exams = () => {
  const navigate = useNavigate();

  // State'ler
  const [targets, setTargets] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // İlk yükleme
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Lütfen giriş yapın");
        setLoading(false);
        return;
      }

      // Hedefleri ve denemeleri paralel yükle
      const [targetsRes, examsRes] = await Promise.all([
        fetch(`${API_URL}/targets`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch(`${API_URL}/exams?limit=10`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
      ]);

      if (targetsRes.ok) {
        const targetsData = await targetsRes.json();
        setTargets(targetsData.data);
      }

      if (examsRes.ok) {
        const examsData = await examsRes.json();
        setExams(examsData.data);
      }
    } catch (err) {
      console.error("Veri yükleme hatası:", err);
      setError("Veriler yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // Hedefleri kaydet
  const handleSaveTargets = async (targetsData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/targets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(targetsData),
      });

      const result = await response.json();

      if (result.success) {
        setTargets(result.data);
        alert("✅ Hedefler başarıyla kaydedildi!");
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error("Hedef kaydetme hatası:", err);
      alert("❌ Hedefler kaydedilirken bir hata oluştu");
    }
  };

  // Deneme kaydet
  const handleSaveExam = async (examData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/exams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(examData),
      });

      const result = await response.json();

      if (result.success) {
        setExams([result.data, ...exams]);
        alert("✅ Deneme başarıyla kaydedildi!");
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error("Deneme kaydetme hatası:", err);
      alert("❌ Deneme kaydedilirken bir hata oluştu: " + err.message);
    }
  };

  // Loading durumu
  if (loading) {
    return (
      <div className="exams-container">
        <div className="exams-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  // Hata durumu
  if (error) {
    return (
      <div className="exams-container">
        <div className="exams-content">
          <div className="error-container">
            <p className="error-icon">⚠️</p>
            <p className="error-text">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // En son deneme
  const latestExam = exams.length > 0 ? exams[0] : null;

  // Hedef net (deneme türüne göre)
  const getTargetNet = (examType) => {
    if (!targets) return null;
    return examType === "TYT" ? targets.tytNet : targets.aytNet;
  };

  return (
    <div className="exams-container">
      <div className="exams-content">
        {/* Header */}
        <div className="exams-header">
          <h1 className="page-title"> Deneme Yönetimi</h1>
          <p className="page-subtitle">
            Denemelerinizi kaydedin, hedeflerinizi takip edin!
          </p>
        </div>

        {/* Hedef Ayarları */}
        <section className="exams-section">
          <TargetSettings initialTargets={targets} onSave={handleSaveTargets} />
        </section>

        {/* Deneme Giriş Formu */}
        <section className="exams-section">
          <ExamInput targetBranch={targets?.branch} onSave={handleSaveExam} />
        </section>

        {/* Son Deneme Analizi */}
        <section className="exams-section">
          <QuickAnalysis
            exam={latestExam}
            targetNet={latestExam ? getTargetNet(latestExam.type) : null}
          />
        </section>

        {/* Geçmiş Denemeler Butonu */}
        <section className="exams-section">
          <Button
            variant="yellow"
            fullWidth
            onClick={() => navigate("/history")}
          >
            Tüm Denemelerim ({exams.length})
          </Button>
        </section>
      </div>
    </div>
  );
};

export default Exams;

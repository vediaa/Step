// pages/History/History.jsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ExamCard from "./components/ExamCard/ExamCard";
import FilterBar from "./components/FilterBar/FilterBar";
import Button from "../../../components/Button/Button";
import "./History.scss";

// Vite'da ortam değişkenleri process.env ile değil, import.meta.env ile okunur.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const History = () => {
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [targets, setTargets] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtreler
  const [filters, setFilters] = useState({
    type: null,
    branch: null,
    sortBy: "date-desc",
  });

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

      const [examsRes, targetsRes] = await Promise.all([
        fetch(`${API_URL}/exams?limit=200`, {
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

      if (targetsRes.ok) {
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

  const handleDeleteExam = async (examId) => {
    if (!window.confirm("Bu denemeyi silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/exams/${examId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();

      if (result.success) {
        setExams(exams.filter((exam) => exam._id !== examId));
        alert("✅ Deneme silindi");
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error("Silme hatası:", err);
      alert("❌ Deneme silinirken bir hata oluştu");
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const filteredAndSortedExams = useMemo(() => {
    let filtered = [...exams];

    if (filters.type) {
      filtered = filtered.filter((exam) => exam.type === filters.type);
    }

    if (filters.branch) {
      filtered = filtered.filter((exam) => exam.branch === filters.branch);
    }

    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "date-desc":
          return (
            new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
          );
        case "date-asc":
          return (
            new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt)
          );
        case "net-desc":
          return b.totalNet - a.totalNet;
        case "net-asc":
          return a.totalNet - b.totalNet;
        default:
          return 0;
      }
    });

    return filtered;
  }, [exams, filters]);

  const examCounts = useMemo(() => {
    return {
      total: exams.length,
      tyt: exams.filter((e) => e.type === "TYT").length,
      ayt: exams.filter((e) => e.type === "AYT").length,
    };
  }, [exams]);

  const getTargetNet = (examType) => {
    if (!targets) return null;
    return examType === "TYT" ? targets.tytNet : targets.aytNet;
  };

  if (loading) {
    return (
      <div className="history-container">
        <div className="history-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Denemeler yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="history-container">
        <div className="history-content">
          <div className="error-container">
            <p className="error-icon">⚠️</p>
            <p className="error-text">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="history-container">
      <div className="history-content">
        {/* Header */}
        <div className="history-header">
          <div className="header-text">
            <h1 className="page-title">Geçmiş Denemelerim</h1>
            <p className="page-subtitle">Toplam {exams.length} deneme</p>
          </div>
          <div className="header-actions">
            <Button variant="yellow" onClick={() => navigate("/analysis")}>
              Detaylı Analiz
            </Button>
          </div>
          <div>
            <Button variant="logoblue" onClick={() => navigate("/exams")}>
              Yeni Deneme +
            </Button>
          </div>
        </div>

        {exams.length === 0 ? (
          <div className="empty-state">
            <p className="empty-icon">📝</p>
            <p className="empty-title">Henüz deneme yok</p>
            <p className="empty-text">İlk denemenizi ekleyerek başlayın!</p>
            <Button
              variant="primary"
              onClick={() => navigate("/exams")}
              style={{ marginTop: "20px" }}
            >
              Deneme Ekle
            </Button>
          </div>
        ) : (
          <>
            <FilterBar
              filters={filters}
              onFilterChange={handleFilterChange}
              examCounts={examCounts}
            />

            <div className="exams-list">
              {filteredAndSortedExams.length === 0 ? (
                <div className="no-results">
                  <p className="no-results-icon">🔍</p>
                  <p className="no-results-text">
                    Filtreye uygun deneme bulunamadı
                  </p>
                </div>
              ) : (
                filteredAndSortedExams.map((exam) => (
                  <ExamCard
                    key={exam._id}
                    exam={exam}
                    targetNet={getTargetNet(exam.type)}
                    onDelete={handleDeleteExam}
                  />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default History;

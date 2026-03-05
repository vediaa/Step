/* import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import "./GecmisDenemeler.css";

const GecmisDenemeler = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [targets, setTargets] = useState({
    hedefTYT: 0,
    hedefAYT: 0,
    hedefBolum: "",
  });

  // Backend'den denemeleri çek
  useEffect(() => {
    fetchExams();
    fetchTargets();
  }, []);

  const fetchExams = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/exams", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setExams(data);
      setLoading(false);
    } catch (error) {
      console.error("Denemeler yüklenirken hata:", error);
      setLoading(false);
    }
  };

  const fetchTargets = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/targets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setTargets(data);
    } catch (error) {
      console.error("Hedefler yüklenirken hata:", error);
    }
  };

  const calculateNet = (correct, wrong) => {
    const numCorrect = isNaN(Number(correct)) ? 0 : Number(correct);
    const numWrong = isNaN(Number(wrong)) ? 0 : Number(wrong);
    return parseFloat((numCorrect - numWrong / 4).toFixed(2));
  };

  const handleDeleteExam = async (examId) => {
    const confirmDelete = window.confirm(
      "Bu denemeyi silmek istediğinize emin misiniz?"
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/exams/${examId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setExams(exams.filter((exam) => exam._id !== examId));
        alert("Deneme başarıyla silindi.");
      } else {
        alert("Deneme silinirken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Silme hatası:", error);
      alert("Deneme silinirken bir hata oluştu.");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const renderDetailedScores = (scores, type) => {
    if (!scores) return null;

    const subjectNames = {
      turkce: "Türkçe",
      matematik: "Matematik",
      sosyal: "Sosyal Bilimler",
      fen: "Fen Bilimleri",
      aytMatematik: "AYT Matematik",
      aytFen: "AYT Fen Bilimleri",
      edebiyat: "AYT Edebiyat",
      sosyal1: "AYT Sosyal 1",
      sosyal2: "AYT Sosyal 2",
    };

    return Object.entries(scores).map(([subject, data]) => {
      if (!data) return null;
      const correctVal = data.dogru || data.correct || 0;
      const wrongVal = data.yanlis || data.wrong || 0;
      const net = data.net || calculateNet(correctVal, wrongVal);

      return (
        <p key={subject} className="exam-detail-item">
          <strong>{subjectNames[subject] || subject}:</strong> D:{correctVal} Y:
          {wrongVal} Net:{net.toFixed(2)}
        </p>
      );
    });
  };

  const renderExamAnalysis = useCallback(
    (exam) => {
      const targetNet =
        exam.examType === "TYT" ? targets.hedefTYT : targets.hedefAYT;
      const currentNet = exam.totalNet || 0;

      let comparisonText = "";
      let status = "normal";

      if (targetNet > 0) {
        if (currentNet >= targetNet) {
          comparisonText = `Hedef ${exam.examType} netini (${targetNet}) geçtin! Tebrikler!`;
          status = "success";
        } else {
          const diff = (targetNet - currentNet).toFixed(2);
          comparisonText = `Hedef ${exam.examType} netine (${targetNet}) ulaşmak için ${diff} net daha yapmalısın.`;
          status = "error";
        }
      } else {
        comparisonText =
          "Hedef netlerini belirlemedin. Analiz için hedeflerini ayarla!";
      }

      return (
        <Card key={exam._id} className="exam-card">
          <div className="exam-card-header">
            <h3 className="exam-name">
              {exam.examName} - {exam.examType} ({formatDate(exam.createdAt)})
            </h3>
            <button
              className="delete-button"
              onClick={() => handleDeleteExam(exam._id)}
            >
              Sil
            </button>
          </div>

          {exam.hedefBolum && (
            <p className="exam-field">Bölüm: {exam.hedefBolum}</p>
          )}

          <p className="exam-total">
            <strong>Toplam Net:</strong>{" "}
            <span
              className={`total-net-value ${
                status === "success"
                  ? "success"
                  : status === "error"
                  ? "error"
                  : ""
              }`}
            >
              {currentNet.toFixed(2)}
            </span>
          </p>

          <div className="exam-details-section">
            {renderDetailedScores(exam.dersler, exam.examType)}
          </div>

          <p className={`exam-goal ${status}`}>{comparisonText}</p>
        </Card>
      );
    },
    [targets, exams]
  );

  if (loading) {
    return (
      <div className="gecmis-denemeler-page">
        <h1 className="page-title">Geçmiş Denemeler</h1>
        <p className="loading-text">Denemeler yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="gecmis-denemeler-page">
      <h1 className="page-title">Geçmiş Denemeler</h1>

      <Button
        variant="secondary"
        fullWidth
        onClick={() => navigate("/analiz")}
        className="analysis-button"
      >
        📊 Görsel Analiz
      </Button>

      <div className="exams-list">
        {exams.length === 0 ? (
          <Card className="no-exams-card">
            <p className="no-exams-text">
              Henüz kaydedilmiş deneme yok. İlk denemenizi ekleyin!
            </p>
          </Card>
        ) : (
          // En yeni denemeler üstte
          [...exams].reverse().map(renderExamAnalysis)
        )}
      </div>
    </div>
  );
};

export default GecmisDenemeler;
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import "./GecmisDenemeler.css";

const GecmisDenemeler = () => {
  const navigate = useNavigate();

  // Örnek veriler - mobil koddaki gibi
  const [exams] = useState([
    {
      id: "1",
      name: "Bilgi Sarmal Deneme 1",
      type: "TYT",
      date: "2024-12-15",
      totalNet: 85.5,
      targetBranchAtExamTime: "Bilgisayar Mühendisliği",
      scores: {
        turkce: { correct: 30, wrong: 10 },
        matematik: { correct: 28, wrong: 12 },
        sosyal: { correct: 15, wrong: 5 },
        fen: { correct: 18, wrong: 2 },
      },
    },
    {
      id: "2",
      name: "Apotemi AYT Denemesi",
      type: "AYT",
      date: "2024-12-18",
      totalNet: 62.25,
      targetBranchAtExamTime: "Bilgisayar Mühendisliği",
      scores: {
        aytMatematik: { correct: 25, wrong: 15 },
        aytFen: { correct: 20, wrong: 10 },
        aytEdebiyat: { correct: 18, wrong: 6 },
        aytSosyal1: { correct: 12, wrong: 8 },
        aytSosyal2: { correct: 10, wrong: 5 },
      },
    },
  ]);

  // Hedef netler - props olarak gelecek ama şimdilik statik
  const targetTytNet = 90;
  const targetAytNet = 70;
  const targetBranch = "Bilgisayar Mühendisliği";

  const calculateNet = (correct, wrong) => {
    const numCorrect = isNaN(Number(correct)) ? 0 : Number(correct);
    const numWrong = isNaN(Number(wrong)) ? 0 : Number(wrong);
    return parseFloat((numCorrect - numWrong / 4).toFixed(2));
  };

  const handleDeleteExam = (examId) => {
    if (window.confirm("Bu denemeyi silmek istediğinize emin misiniz?")) {
      alert("Deneme silindi! (API bağlandığında gerçekten silinecek)");
      // API bağlandığında: DELETE isteği atılacak
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const renderDetailedScores = (scores) => {
    if (!scores) return null;

    const subjectNames = {
      turkce: "Türkçe",
      matematik: "Matematik",
      sosyal: "Sosyal Bilimler",
      fen: "Fen Bilimleri",
      aytMatematik: "AYT Matematik",
      aytFen: "AYT Fen Bilimleri",
      aytEdebiyat: "AYT Edebiyat",
      aytSosyal1: "AYT Sosyal 1",
      aytSosyal2: "AYT Sosyal 2",
    };

    return Object.entries(scores).map(([subject, data]) => {
      const correctVal = data?.correct || 0;
      const wrongVal = data?.wrong || 0;
      const net = calculateNet(correctVal, wrongVal).toFixed(2);

      return (
        <p key={subject} className="detail-text">
          {subjectNames[subject]}: D:{correctVal} Y:{wrongVal} Net:{net}
        </p>
      );
    });
  };

  const renderExamCard = (exam) => {
    const targetNet = exam.type === "TYT" ? targetTytNet : targetAytNet;
    const currentNet = Number(exam.totalNet);

    let comparisonText = "";
    let status = "normal";

    if (targetNet > 0) {
      if (currentNet >= targetNet) {
        comparisonText = `Hedef ${exam.type} netini (${targetNet}) geçtin! Tebrikler!`;
        status = "success";
      } else {
        const diff = (targetNet - currentNet).toFixed(2);
        comparisonText = `Hedef ${exam.type} netine (${targetNet}) ulaşmak için ${diff} net daha yapmalısın.`;
        status = "warning";
      }
    } else {
      comparisonText =
        "Hedef netlerini belirlemedin. Analiz için hedeflerini ayarla!";
      status = "normal";
    }

    return (
      <Card key={exam.id} className="exam-card">
        <div className="card-header">
          <h3 className="exam-title">
            {exam.name} - {exam.type} ({formatDate(exam.date)})
          </h3>
          <button
            className="delete-button"
            onClick={() => handleDeleteExam(exam.id)}
          >
            Sil
          </button>
        </div>

        {exam.targetBranchAtExamTime && (
          <p className="detail-text">Bölüm: {exam.targetBranchAtExamTime}</p>
        )}

        <p className="total-net">
          Toplam Net:{" "}
          <span
            className={
              status === "success"
                ? "success-text"
                : status === "warning"
                ? "warning-text"
                : "normal-text"
            }
          >
            {exam.totalNet}
          </span>
        </p>

        <div className="detail-section">
          {renderDetailedScores(exam.scores)}
        </div>

        <p className={`comparison-text ${status}`}>{comparisonText}</p>
      </Card>
    );
  };

  return (
    <div className="gecmis-denemeler-container">
      <h1 className="page-title">Geçmiş Denemeler</h1>

      <button className="analysis-button" onClick={() => navigate("/analiz")}>
        Görsel Analiz
      </button>

      <div className="exams-list">
        {exams.length === 0 ? (
          <p className="no-exams-text">Henüz kaydedilmiş deneme yok.</p>
        ) : (
          // En son eklenen en üstte - mobil koddaki gibi reverse
          [...exams].reverse().map(renderExamCard)
        )}
      </div>
    </div>
  );
};

export default GecmisDenemeler;

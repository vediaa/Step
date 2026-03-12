/* /* import { useState } from "react";
import Card from "../../components/Card/Card";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import "./Exams.css";

const Exams = () => {
  const [examType, setExamType] = useState("AYT");
  const [examName, setExamName] = useState("");
  const [showNewExam, setShowNewExam] = useState(false);

  const [examScores, setExamScores] = useState({
    edebiyat: { correct: 25, wrong: 9 },
    sosyal1: { correct: 15, wrong: 5 },
    sosyal2: { correct: 12, wrong: 6 },
  });

  const calculateNet = (correct, wrong) => {
    return correct - wrong / 4;
  };

  const totalNet = Object.values(examScores).reduce((sum, score) => {
    return sum + calculateNet(score.correct, score.wrong);
  }, 0);

  const previousExams = [
    {
      name: "Bilgi sarmal - TYT",
      date: "28.05.2025",
      field: "Eşit Ağırlık",
      totalNet: 39,
      details: "Türkçe: D:10 Y:9 Net:7.75\nMatematik: D:25 Y:5 Net:23.75",
      goal: 60,
      difference: -21,
    },
    {
      name: "Apotemi - AYT",
      date: "28.05.2025",
      field: "Eşit Ağırlık",
      totalNet: 48.5,
      details:
        "AYT Matematik: D:25 Y:5 Net:23.75\nAYT Edebiyat: D:26 Y:5 Net:24.75",
      goal: 40,
      difference: 8.5,
    },
  ];

  return (
    <div className="exams-page">
      <div className="exams-header">
        <h1 className="page-title">Netler</h1>
      </div>

      <div className="exam-sections">
        <Card className="new-exam-section">
          <h2 className="section-title">Deneme Adı</h2>
          <Input
            type="text"
            placeholder="Deneme adını gir"
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
          />

          <h3 className="subsection-title">Deneme Türü:</h3>
          <div className="exam-type-buttons">
            <button
              className={`type-button ${examType === "TYT" ? "active" : ""}`}
              onClick={() => setExamType("TYT")}
            >
              TYT
            </button>
            <button
              className={`type-button ${examType === "AYT" ? "active" : ""}`}
              onClick={() => setExamType("AYT")}
            >
              AYT
            </button>
          </div>

          <h3 className="subsection-title">AYT Dersleri</h3>

          <div className="score-inputs">
            <div className="score-row">
              <span className="subject-name">AYT Edebiyat</span>
              <div className="score-fields">
                <Input
                  type="number"
                  placeholder="D"
                  value={examScores.edebiyat.correct}
                  onChange={(e) =>
                    setExamScores({
                      ...examScores,
                      edebiyat: {
                        ...examScores.edebiyat,
                        correct: Number(e.target.value),
                      },
                    })
                  }
                />
                <Input
                  type="number"
                  placeholder="Y"
                  value={examScores.edebiyat.wrong}
                  onChange={(e) =>
                    setExamScores({
                      ...examScores,
                      edebiyat: {
                        ...examScores.edebiyat,
                        wrong: Number(e.target.value),
                      },
                    })
                  }
                />
                <span className="net-value">
                  {calculateNet(
                    examScores.edebiyat.correct,
                    examScores.edebiyat.wrong
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="score-row">
              <span className="subject-name">AYT Sosyal 1</span>
              <div className="score-fields">
                <Input
                  type="number"
                  placeholder="D"
                  value={examScores.sosyal1.correct}
                  onChange={(e) =>
                    setExamScores({
                      ...examScores,
                      sosyal1: {
                        ...examScores.sosyal1,
                        correct: Number(e.target.value),
                      },
                    })
                  }
                />
                <Input
                  type="number"
                  placeholder="Y"
                  value={examScores.sosyal1.wrong}
                  onChange={(e) =>
                    setExamScores({
                      ...examScores,
                      sosyal1: {
                        ...examScores.sosyal1,
                        wrong: Number(e.target.value),
                      },
                    })
                  }
                />
                <span className="net-value">
                  {calculateNet(
                    examScores.sosyal1.correct,
                    examScores.sosyal1.wrong
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="score-row">
              <span className="subject-name">AYT Sosyal 2</span>
              <div className="score-fields">
                <Input
                  type="number"
                  placeholder="D"
                  value={examScores.sosyal2.correct}
                  onChange={(e) =>
                    setExamScores({
                      ...examScores,
                      sosyal2: {
                        ...examScores.sosyal2,
                        correct: Number(e.target.value),
                      },
                    })
                  }
                />
                <Input
                  type="number"
                  placeholder="Y"
                  value={examScores.sosyal2.wrong}
                  onChange={(e) =>
                    setExamScores({
                      ...examScores,
                      sosyal2: {
                        ...examScores.sosyal2,
                        wrong: Number(e.target.value),
                      },
                    })
                  }
                />
                <span className="net-value">
                  {calculateNet(
                    examScores.sosyal2.correct,
                    examScores.sosyal2.wrong
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="total-net">
            <strong>AYT Toplam Net:</strong>
            <span className="total-value">{totalNet.toFixed(2)}</span>
          </div>

          <Button variant="primary" fullWidth>
            Denemeyi Kaydet
          </Button>
        </Card>
      </div>

      <h2 className="section-title" style={{ marginTop: "48px" }}>
        Geçmiş Denemeler
      </h2>

      <div className="previous-exams">
        {previousExams.map((exam, index) => (
          <Card key={index} className="exam-card">
            <div className="exam-card-header">
              <h3 className="exam-name">
                {exam.name} ({exam.date})
              </h3>
              <button className="delete-button">Sil</button>
            </div>
            <p className="exam-field">Bölüm: {exam.field}</p>
            <p className="exam-total">
              <strong>Toplam Net:</strong> {exam.totalNet}
            </p>
            <p className="exam-details">{exam.details}</p>
            <p
              className={`exam-goal ${
                exam.difference > 0 ? "success" : "error"
              }`}
            >
              Hedef {examType} netine ({exam.goal}) ulaşmak için{" "}
              {Math.abs(exam.difference)} net
              {exam.difference > 0
                ? " daha yaptınız. Tebrikler!"
                : " daha yapmalısın."}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Exams;
 */

/* 
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/Card/Card";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import "./Exams.css";

const Exams = () => {
  const navigate = useNavigate();
  const [examType, setExamType] = useState("TYT");
  const [examName, setExamName] = useState("");
  const [loading, setLoading] = useState(false);
  const [previousExams, setPreviousExams] = useState([]);
  const [targets, setTargets] = useState({
    hedefTYT: 0,
    hedefAYT: 0,
    hedefBolum: "",
  });

  // TYT için başlangıç değerleri
  const [tytScores, setTytScores] = useState({
    turkce: { correct: 0, wrong: 0 },
    matematik: { correct: 0, wrong: 0 },
    sosyal: { correct: 0, wrong: 0 },
    fen: { correct: 0, wrong: 0 },
  });

  // AYT için başlangıç değerleri
  const [aytScores, setAytScores] = useState({
    edebiyat: { correct: 0, wrong: 0 },
    sosyal1: { correct: 0, wrong: 0 },
    sosyal2: { correct: 0, wrong: 0 },
    aytMatematik: { correct: 0, wrong: 0 },
    aytFen: { correct: 0, wrong: 0 },
  });

  const examScores = examType === "TYT" ? tytScores : aytScores;
  const setExamScores = examType === "TYT" ? setTytScores : setAytScores;

  // Sayfa yüklendiğinde verileri çek
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
      setPreviousExams(data);
    } catch (error) {
      console.error("Denemeler yüklenirken hata:", error);
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

  const totalNet = Object.values(examScores).reduce((sum, score) => {
    return sum + calculateNet(score.correct, score.wrong);
  }, 0);

  const handleSaveExam = async () => {
    if (!examName.trim()) {
      alert("Lütfen deneme adı girin!");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      // Backend formatına dönüştür
      const dersler = {};
      Object.entries(examScores).forEach(([key, value]) => {
        dersler[key] = {
          dogru: value.correct,
          yanlis: value.wrong,
          bos: 0,
        };
      });

      const response = await fetch("/api/exams/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          examName,
          examType,
          dersler,
        }),
      });

      if (response.ok) {
        alert("✅ Deneme başarıyla kaydedildi!");
        setExamName("");
        
        // Skorları sıfırla
        if (examType === "TYT") {
          setTytScores({
            turkce: { correct: 0, wrong: 0 },
            matematik: { correct: 0, wrong: 0 },
            sosyal: { correct: 0, wrong: 0 },
            fen: { correct: 0, wrong: 0 },
          });
        } else {
          setAytScores({
            edebiyat: { correct: 0, wrong: 0 },
            sosyal1: { correct: 0, wrong: 0 },
            sosyal2: { correct: 0, wrong: 0 },
            aytMatematik: { correct: 0, wrong: 0 },
            aytFen: { correct: 0, wrong: 0 },
          });
        }

        // Listeyi yenile
        fetchExams();
      } else {
        const error = await response.json();
        alert("❌ Hata: " + error.message);
      }
    } catch (error) {
      console.error("Kaydetme hatası:", error);
      alert("❌ Deneme kaydedilirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
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
        alert("✅ Deneme başarıyla silindi.");
        fetchExams();
      } else {
        alert("❌ Deneme silinirken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Silme hatası:", error);
      alert("❌ Deneme silinirken bir hata oluştu.");
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

  const renderScoreInputs = () => {
    const subjectNames = {
      // TYT
      turkce: "Türkçe",
      matematik: "Matematik",
      sosyal: "Sosyal Bilimler",
      fen: "Fen Bilimleri",
      // AYT
      edebiyat: "AYT Edebiyat",
      aytMatematik: "AYT Matematik",
      aytFen: "AYT Fen",
      sosyal1: "AYT Sosyal 1",
      sosyal2: "AYT Sosyal 2",
    };

    return Object.entries(examScores).map(([subject, score]) => (
      <div key={subject} className="score-row">
        <span className="subject-name">{subjectNames[subject]}</span>
        <div className="score-fields">
          <Input
            type="number"
            placeholder="D"
            value={score.correct}
            onChange={(e) =>
              setExamScores({
                ...examScores,
                [subject]: {
                  ...examScores[subject],
                  correct: Number(e.target.value),
                },
              })
            }
          />
          <Input
            type="number"
            placeholder="Y"
            value={score.wrong}
            onChange={(e) =>
              setExamScores({
                ...examScores,
                [subject]: {
                  ...examScores[subject],
                  wrong: Number(e.target.value),
                },
              })
            }
          />
          <span className="net-value">
            {calculateNet(score.correct, score.wrong).toFixed(2)}
          </span>
        </div>
      </div>
    ));
  };

  const renderDetailedScores = (exam) => {
    if (!exam.dersler) return null;

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

    return Object.entries(exam.dersler)
      .filter(([_, data]) => data && (data.dogru > 0 || data.yanlis > 0))
      .map(([subject, data]) => (
        <p key={subject} className="exam-detail-line">
          {subjectNames[subject]}: D:{data.dogru} Y:{data.yanlis} Net:
          {data.net.toFixed(2)}
        </p>
      ));
  };

  return (
    <div className="exams-page">
      <div className="exams-header">
        <h1 className="page-title">Netler</h1>
      </div>

      <div className="exam-sections">
        <Card className="new-exam-section">
          <h2 className="section-title">Deneme Adı</h2>
          <Input
            type="text"
            placeholder="Deneme adını gir"
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
          />

          <h3 className="subsection-title">Deneme Türü:</h3>
          <div className="exam-type-buttons">
            <button
              className={`type-button ${examType === "TYT" ? "active" : ""}`}
              onClick={() => setExamType("TYT")}
            >
              TYT
            </button>
            <button
              className={`type-button ${examType === "AYT" ? "active" : ""}`}
              onClick={() => setExamType("AYT")}
            >
              AYT
            </button>
          </div>

          <h3 className="subsection-title">
            {examType === "TYT" ? "TYT Dersleri" : "AYT Dersleri"}
          </h3>

          <div className="score-inputs">{renderScoreInputs()}</div>

          <div className="total-net">
            <strong>{examType} Toplam Net:</strong>
            <span className="total-value">{totalNet.toFixed(2)}</span>
          </div>

          <Button
            variant="primary"
            fullWidth
            onClick={handleSaveExam}
            disabled={loading}
          >
            {loading ? "Kaydediliyor..." : "Denemeyi Kaydet"}
          </Button>
        </Card>
      </div>

      <h2 className="section-title" style={{ marginTop: "48px" }}>
        Geçmiş Denemeler
      </h2>

      <Button
        variant="secondary"
        fullWidth
        onClick={() => navigate("/analiz")}
        style={{ marginBottom: "24px" }}
      >
        📊 Görsel Analiz
      </Button>

      <div className="previous-exams">
        {previousExams.length === 0 ? (
          <Card className="no-exams-card">
            <p className="no-exams-text">
              Henüz kaydedilmiş deneme yok. İlk denemenizi yukarıdan ekleyin!
            </p>
          </Card>
        ) : (
          [...previousExams].reverse().map((exam) => {
            const targetNet =
              exam.examType === "TYT" ? targets.hedefTYT : targets.hedefAYT;
            const currentNet = exam.totalNet || 0;
            const difference = currentNet - targetNet;
            const isSuccess = difference >= 0;

            let comparisonText = "";
            if (targetNet > 0) {
              if (isSuccess) {
                comparisonText = `Hedef ${exam.examType} netini (${targetNet}) geçtin! Tebrikler!`;
              } else {
                comparisonText = `Hedef ${
                  exam.examType
                } netine (${targetNet}) ulaşmak için ${Math.abs(
                  difference
                ).toFixed(2)} net daha yapmalısın.`;
              }
            } else {
              comparisonText =
                "Hedef netlerini belirlemedin. Analiz için hedeflerini ayarla!";
            }

            return (
              <Card key={exam._id} className="exam-card">
                <div className="exam-card-header">
                  <h3 className="exam-name">
                    {exam.examName} - {exam.examType} (
                    {formatDate(exam.createdAt)})
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
                  <span className={isSuccess ? "success-text" : "error-text"}>
                    {currentNet.toFixed(2)}
                  </span>
                </p>
                <div className="exam-details">{renderDetailedScores(exam)}</div>
                <p className={`exam-goal ${isSuccess ? "success" : "error"}`}>
                  {comparisonText}
                </p>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
/*
export default Exams; 
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/Card/Card";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import {
  calculateNet,
  calculateTYTTotalNet,
  calculateAYTTotalNet,
  getSubjectName,
} from "../../utils/netCalculator";
import "./Exams.css";

// UI Bileşenleri
const NetInputRow = ({
  label,
  correct,
  wrong,
  onCorrectChange,
  onWrongChange,
}) => {
  const calculatedNet = calculateNet(correct, wrong).toFixed(2);
  return (
    <div className="net-input-row">
      <span className="net-label">{label}</span>
      <div className="net-inputs">
        <input
          type="number"
          className="net-input"
          value={correct}
          onChange={(e) => onCorrectChange(e.target.value)}
          placeholder="D"
        />
        <input
          type="number"
          className="net-input"
          value={wrong}
          onChange={(e) => onWrongChange(e.target.value)}
          placeholder="Y"
        />
        <span className="net-result">{calculatedNet}</span>
      </div>
    </div>
  );
};

const Netler = () => {
  const navigate = useNavigate();

  // State'ler - ŞİMDİLİK SADECE STATE, API HAZIR OLUNCA BACKEND'DEN GELECEKö
  const [targetBranch, setTargetBranch] = useState("");
  const [targetTytNet, setTargetTytNet] = useState("");
  const [targetAytNet, setTargetAytNet] = useState("");
  const [exams, setExams] = useState([]); // API'den gelecek

  const [examName, setExamName] = useState("");
  const [examType, setExamType] = useState("TYT");

  const [tytScores, setTytScores] = useState({
    turkce: { correct: "", wrong: "" },
    matematik: { correct: "", wrong: "" },
    sosyal: { correct: "", wrong: "" },
    fen: { correct: "", wrong: "" },
  });

  const [aytScores, setAytScores] = useState({
    aytMatematik: { correct: "", wrong: "" },
    aytFen: { correct: "", wrong: "" },
    aytEdebiyat: { correct: "", wrong: "" },
    aytSosyal1: { correct: "", wrong: "" },
    aytSosyal2: { correct: "", wrong: "" },
  });

  // API hazir olunca bu fonksiyon çalışacak
  useEffect(() => {
    // TODO: API'den verileri çek
    // fetchTargets();
    // fetchExams();
  }, []);

  const saveTargets = async () => {
    if (!targetBranch || !targetTytNet || !targetAytNet) {
      alert("Lütfen tüm hedefleri doldurun.");
      return;
    }
    if (isNaN(Number(targetTytNet)) || isNaN(Number(targetAytNet))) {
      alert("TYT ve AYT netleri sayısal bir değer olmalıdır.");
      return;
    }

    // TODO: API'ye gönder
    /*
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/targets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetBranch,
          targetTytNet: Number(targetTytNet),
          targetAytNet: Number(targetAytNet),
        }),
      });

      if (response.ok) {
        alert("✅ Hedefleriniz kaydedildi!");
      } else {
        alert("❌ Kayıt hatası");
      }
    } catch (e) {
      console.error("Hata:", e);
      alert("❌ Sunucu hatası");
    }
    */

/*
    // ŞİMDİLİK SADECE ALERT
    alert(
      "✅ Hedefleriniz kaydedildi! (API hazır olunca MongoDB'ye kaydedilecek)"
    );
  };

  const handleTytChange = (subject, type, value) => {
    const filteredValue = value.replace(/[^0-9]/g, "");
    setTytScores((prev) => ({
      ...prev,
      [subject]: { ...prev[subject], [type]: filteredValue },
    }));
  };

  const handleAytChange = (subject, type, value) => {
    const filteredValue = value.replace(/[^0-9]/g, "");
    setAytScores((prev) => ({
      ...prev,
      [subject]: { ...prev[subject], [type]: filteredValue },
    }));
  };

  const calculateCurrentTytTotal = useCallback(() => {
    return calculateTYTTotalNet(tytScores);
  }, [tytScores]);

  const calculateCurrentAytTotal = useCallback(() => {
    return calculateAYTTotalNet(aytScores, targetBranch);
  }, [aytScores, targetBranch]);

  const handleSaveExam = async () => {
    if (!examName) {
      alert("Lütfen deneme adını girin.");
      return;
    }

    let totalNet = 0;
    let examScoresToSave = {};

    if (examType === "TYT") {
      totalNet = calculateCurrentTytTotal();
      examScoresToSave = { ...tytScores };
    } else {
      totalNet = calculateCurrentAytTotal();
      if (targetBranch === "Sayısal") {
        examScoresToSave = {
          aytMatematik: aytScores.aytMatematik,
          aytFen: aytScores.aytFen,
        };
      } else if (targetBranch === "Eşit Ağırlık") {
        examScoresToSave = {
          aytMatematik: aytScores.aytMatematik,
          aytEdebiyat: aytScores.aytEdebiyat,
        };
      } else if (targetBranch === "Sözel") {
        examScoresToSave = {
          aytEdebiyat: aytScores.aytEdebiyat,
          aytSosyal1: aytScores.aytSosyal1,
          aytSosyal2: aytScores.aytSosyal2,
        };
      } else {
        examScoresToSave = { ...aytScores };
      }
    }

    // TODO: API'ye gönder
    /*
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/exams/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: examName,
          type: examType,
          scores: examScoresToSave,
          totalNet: totalNet,
          targetBranchAtExamTime: targetBranch,
        }),
      });

      if (response.ok) {
        const newExam = await response.json();
        setExams([...exams, newExam]);
        alert("✅ Deneme kaydedildi!");
        // Formu sıfırla
        setExamName("");
        // ...
      }
    } catch (e) {
      console.error("Hata:", e);
    }
    */

/*
    // ŞİMDİLİK SADECE STATE'E EKLE
    const newExam = {
      id: Date.now().toString(),
      name: examName,
      type: examType,
      date: new Date().toISOString(),
      scores: examScoresToSave,
      totalNet: totalNet,
      targetBranchAtExamTime: targetBranch,
    };

    setExams([...exams, newExam]);
    alert("✅ Deneme kaydedildi! (API hazır olunca MongoDB'ye kaydedilecek)");

    // Formu sıfırla
    setExamName("");
    setTytScores({
      turkce: { correct: "", wrong: "" },
      matematik: { correct: "", wrong: "" },
      sosyal: { correct: "", wrong: "" },
      fen: { correct: "", wrong: "" },
    });
    setAytScores({
      aytMatematik: { correct: "", wrong: "" },
      aytFen: { correct: "", wrong: "" },
      aytEdebiyat: { correct: "", wrong: "" },
      aytSosyal1: { correct: "", wrong: "" },
      aytSosyal2: { correct: "", wrong: "" },
    });
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

    return Object.entries(scores).map(([subject, data]) => {
      const correctVal = data?.correct || 0;
      const wrongVal = data?.wrong || 0;
      const net = calculateNet(correctVal, wrongVal).toFixed(2);

      return (
        <p key={subject} className="detail-text">
          {getSubjectName(subject)}: D:{correctVal} Y:{wrongVal} Net:{net}
        </p>
      );
    });
  };

  const renderExamAnalysis = (exam) => {
    if (!exam) return null;

    const targetNet =
      exam.type === "TYT"
        ? parseFloat(targetTytNet || "0")
        : parseFloat(targetAytNet || "0");
    const currentNet = parseFloat(exam.totalNet || "0");

    let comparisonText = "";
    let status = "normal";

    if (!isNaN(targetNet) && targetNet > 0) {
      if (currentNet >= targetNet) {
        comparisonText = `Hedef ${exam.type} netini (${targetNet}) geçtin! Tebrikler!`;
        status = "success";
      } else {
        const difference = parseFloat((targetNet - currentNet).toFixed(2));
        comparisonText = `Hedef ${exam.type} netine (${targetNet}) ulaşmak için ${difference} net daha yapmalısın.`;
        status = "warning";
      }
    } else {
      comparisonText =
        "Hedef netlerini belirlemedin. Analiz için hedeflerini ayarla!";
      status = "normal";
    }

    return (
      <Card className="analysis-card">
        <h3 className="exam-analysis-title">
          {exam.name} - {exam.type} ({formatDate(exam.date)})
        </h3>
        {exam.targetBranchAtExamTime && (
          <p className="detail-text">Bölüm: {exam.targetBranchAtExamTime}</p>
        )}
        <p className="exam-total-net">
          Toplam Net:{" "}
          <span className={`net-value ${status}`}>{exam.totalNet}</span>
        </p>
        <div className="detail-section">
          {renderDetailedScores(exam.scores)}
        </div>
        <p className={`comparison-text ${status}`}>{comparisonText}</p>
      </Card>
    );
  };

  const renderAytInputs = () => {
    if (examType === "AYT") {
      if (targetBranch === "Sayısal") {
        return (
          <>
            <NetInputRow
              label="AYT Matematik"
              correct={aytScores.aytMatematik?.correct || ""}
              wrong={aytScores.aytMatematik?.wrong || ""}
              onCorrectChange={(text) =>
                handleAytChange("aytMatematik", "correct", text)
              }
              onWrongChange={(text) =>
                handleAytChange("aytMatematik", "wrong", text)
              }
            />
            <NetInputRow
              label="AYT Fen Bilimleri"
              correct={aytScores.aytFen?.correct || ""}
              wrong={aytScores.aytFen?.wrong || ""}
              onCorrectChange={(text) =>
                handleAytChange("aytFen", "correct", text)
              }
              onWrongChange={(text) => handleAytChange("aytFen", "wrong", text)}
            />
          </>
        );
      } else if (targetBranch === "Eşit Ağırlık") {
        return (
          <>
            <NetInputRow
              label="AYT Matematik"
              correct={aytScores.aytMatematik?.correct || ""}
              wrong={aytScores.aytMatematik?.wrong || ""}
              onCorrectChange={(text) =>
                handleAytChange("aytMatematik", "correct", text)
              }
              onWrongChange={(text) =>
                handleAytChange("aytMatematik", "wrong", text)
              }
            />
            <NetInputRow
              label="AYT Edebiyat"
              correct={aytScores.aytEdebiyat?.correct || ""}
              wrong={aytScores.aytEdebiyat?.wrong || ""}
              onCorrectChange={(text) =>
                handleAytChange("aytEdebiyat", "correct", text)
              }
              onWrongChange={(text) =>
                handleAytChange("aytEdebiyat", "wrong", text)
              }
            />
          </>
        );
      } else if (targetBranch === "Sözel") {
        return (
          <>
            <NetInputRow
              label="AYT Edebiyat"
              correct={aytScores.aytEdebiyat?.correct || ""}
              wrong={aytScores.aytEdebiyat?.wrong || ""}
              onCorrectChange={(text) =>
                handleAytChange("aytEdebiyat", "correct", text)
              }
              onWrongChange={(text) =>
                handleAytChange("aytEdebiyat", "wrong", text)
              }
            />
            <NetInputRow
              label="AYT Sosyal 1"
              correct={aytScores.aytSosyal1?.correct || ""}
              wrong={aytScores.aytSosyal1?.wrong || ""}
              onCorrectChange={(text) =>
                handleAytChange("aytSosyal1", "correct", text)
              }
              onWrongChange={(text) =>
                handleAytChange("aytSosyal1", "wrong", text)
              }
            />
            <NetInputRow
              label="AYT Sosyal 2"
              correct={aytScores.aytSosyal2?.correct || ""}
              wrong={aytScores.aytSosyal2?.wrong || ""}
              onCorrectChange={(text) =>
                handleAytChange("aytSosyal2", "correct", text)
              }
              onWrongChange={(text) =>
                handleAytChange("aytSosyal2", "wrong", text)
              }
            />
          </>
        );
      } else {
        return (
          <p className="info-message">
            Lütfen önce hedef bölümünüzü seçin (Sayısal, Eşit Ağırlık, Sözel)
            AYT derslerini doğru şekilde girebilmek için.
          </p>
        );
      }
    }
    return null;
  };

  return (
    <div className="netler-container">
      <div className="netler-content">
        /* Hedef Netleri Belirleme */ /*
        <section className="netler-section">
          <h2 className="section-title">Hedef Netlerini Belirle</h2>
          <Card>
            <label className="form-label">Alan Seçin:</label>
            <div className="branch-selection">
              {["Sayısal", "Eşit Ağırlık", "Sözel"].map((b) => (
                <button
                  key={b}
                  className={`branch-button ${
                    targetBranch === b ? "active" : ""
                  }`}
                  onClick={() => setTargetBranch(b)}
                >
                  {b}
                </button>
              ))}
            </div>

            <div className="input-group">
              <label className="form-label">Hedef TYT Netiniz</label>
              <input
                type="text"
                className="form-input"
                value={targetTytNet}
                onChange={(e) => setTargetTytNet(e.target.value)}
                placeholder="Örn: 90.75"
              />
            </div>

            <div className="input-group">
              <label className="form-label">Hedef AYT Netiniz</label>
              <input
                type="text"
                className="form-input"
                value={targetAytNet}
                onChange={(e) => setTargetAytNet(e.target.value)}
                placeholder="Örn: 65.25"
              />
            </div>

            <Button variant="primary" fullWidth onClick={saveTargets}>
              Hedefleri Kaydet
            </Button>
          </Card>
        </section>

        /* Yeni Deneme Ekle 
        <section className="netler-section">
          <h2 className="section-title">Yeni Deneme Ekle</h2>
          <Card>
            <div className="input-group">
              <label className="form-label">Deneme Adı</label>
              <input
                type="text"
                className="form-input"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                placeholder="Örn: 3D Yayınları TYT Denemesi"
              />
            </div>

            <label className="form-label">Deneme Türü:</label>
            <div className="exam-type-selection">
              <button
                className={`exam-type-button ${
                  examType === "TYT" ? "active" : ""
                }`}
                onClick={() => setExamType("TYT")}
              >
                TYT
              </button>
              <button
                className={`exam-type-button ${
                  examType === "AYT" ? "active" : ""
                }`}
                onClick={() => setExamType("AYT")}
              >
                AYT
              </button>
            </div>

            {examType === "TYT" ? (
              <>
                <h3 className="sub-heading">TYT Dersleri</h3>
                <NetInputRow
                  label="Türkçe"
                  correct={tytScores.turkce.correct}
                  wrong={tytScores.turkce.wrong}
                  onCorrectChange={(text) =>
                    handleTytChange("turkce", "correct", text)
                  }
                  onWrongChange={(text) =>
                    handleTytChange("turkce", "wrong", text)
                  }
                />
                <NetInputRow
                  label="Matematik"
                  correct={tytScores.matematik.correct}
                  wrong={tytScores.matematik.wrong}
                  onCorrectChange={(text) =>
                    handleTytChange("matematik", "correct", text)
                  }
                  onWrongChange={(text) =>
                    handleTytChange("matematik", "wrong", text)
                  }
                />
                <NetInputRow
                  label="Sosyal Bilimler"
                  correct={tytScores.sosyal.correct}
                  wrong={tytScores.sosyal.wrong}
                  onCorrectChange={(text) =>
                    handleTytChange("sosyal", "correct", text)
                  }
                  onWrongChange={(text) =>
                    handleTytChange("sosyal", "wrong", text)
                  }
                />
                <NetInputRow
                  label="Fen Bilimleri"
                  correct={tytScores.fen.correct}
                  wrong={tytScores.fen.wrong}
                  onCorrectChange={(text) =>
                    handleTytChange("fen", "correct", text)
                  }
                  onWrongChange={(text) =>
                    handleTytChange("fen", "wrong", text)
                  }
                />
                <p className="total-net-display">
                  TYT Toplam Net:{" "}
                  <span className="total-net-value">
                    {calculateCurrentTytTotal().toFixed(2)}
                  </span>
                </p>
              </>
            ) : (
              <>
                <h3 className="sub-heading">AYT Dersleri</h3>
                {renderAytInputs()}
                <p className="total-net-display">
                  AYT Toplam Net:{" "}
                  <span className="total-net-value">
                    {calculateCurrentAytTotal().toFixed(2)}
                  </span>
                </p>
                {!targetBranch && (
                  <p className="error-message">
                    Bölümünü belirlemedin. AYT ders girişleri ve toplam neti
                    doğru hesaplanmayabilir.
                  </p>
                )}
              </>
            )}

            <Button
              variant="primary"
              fullWidth
              onClick={handleSaveExam}
              style={{ marginTop: "20px" }}
            >
              Denemeyi Kaydet
            </Button>
          </Card>
        </section>

        /* Son Deneme Analizi 
        <section className="netler-section">
          <h2 className="section-title">Son Deneme Analizi</h2>
          {exams.length === 0 ? (
            <Card>
              <p className="no-exam-text">
                Henüz Deneme Yok - Yeni bir deneme ekle!
              </p>
            </Card>
          ) : (
            renderExamAnalysis(exams[exams.length - 1])
          )}
        </section>

        <section className="netler-section">
          <button
            className="history-button"
            onClick={() => navigate("/gecmis-denemeler")}
          >
            Geçmiş Denemeler
          </button>
        </section>
      </div>
    </div>
  );
};

export default Netler;
 */

// pages/Exams/Exams.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TargetSettings from "./components/TargetSettings/TargetSettings";
import ExamInput from "./components/ExamInput/ExamInput";
import QuickAnalysis from "./components/QuickAnalysis/QuickAnalysis";
import Button from "../../components/Button/Button";
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
          <h1 className="page-title">📚 Deneme Yönetimi</h1>
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
            variant="secondary"
            fullWidth
            onClick={() => navigate("/history")}
          >
            📊 Tüm Denemelerim ({exams.length})
          </Button>
        </section>
      </div>
    </div>
  );
};

export default Exams;

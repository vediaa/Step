// pages/Exams/components/ExamInput/ExamInput.jsx
import { useState, useCallback } from "react";
import Card from "../../../../../components/Card/Card";
import Button from "../../../../../components/Button/Button";
import ExamTypeSelector from "../ExamTypeSelector/ExamTypeSelector";
import SubjectRow from "../SubjectRow/SubjectRow";
import {
  calculateTYTTotalNet,
  calculateAYTTotalNet,
} from "../../../../../utils/netCalculator";
import {
  validateExam,
  validateExamName,
} from "../../../../../utils/examValidation";
import "./ExamInput.css";

const ExamInput = ({ targetBranch, onSave }) => {
  const [examName, setExamName] = useState("");
  const [examType, setExamType] = useState("TYT");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  console.log("GELEN HEDEF ALAN:", targetBranch);

  // TYT Skorları
  const [tytScores, setTytScores] = useState({
    turkce: { dogru: "", yanlis: "", bos: "" },
    matematik: { dogru: "", yanlis: "", bos: "" },
    sosyal: { dogru: "", yanlis: "", bos: "" },
    fen: { dogru: "", yanlis: "", bos: "" },
  });

  // AYT Skorları
  const [aytScores, setAytScores] = useState({
    aytMatematik: { dogru: "", yanlis: "", bos: "" },
    aytFizik: { dogru: "", yanlis: "", bos: "" },
    aytKimya: { dogru: "", yanlis: "", bos: "" },
    aytBiyoloji: { dogru: "", yanlis: "", bos: "" },
    aytEdebiyat: { dogru: "", yanlis: "", bos: "" },
    aytTarih1: { dogru: "", yanlis: "", bos: "" },
    aytCografya1: { dogru: "", yanlis: "", bos: "" },
    aytTarih2: { dogru: "", yanlis: "", bos: "" },
    aytCografya2: { dogru: "", yanlis: "", bos: "" },
    aytFelsefe: { dogru: "", yanlis: "", bos: "" },
    aytDin: { dogru: "", yanlis: "", bos: "" },
    aytDil: { dogru: "", yanlis: "", bos: "" },
  });

  // TYT değişikliği
  const handleTytChange = useCallback((subject, field, value) => {
    setTytScores((prev) => ({
      ...prev,
      [subject]: { ...prev[subject], [field]: value },
    }));
  }, []);

  // AYT değişikliği
  const handleAytChange = useCallback((subject, field, value) => {
    setAytScores((prev) => ({
      ...prev,
      [subject]: { ...prev[subject], [field]: value },
    }));
  }, []);

  // Toplam net hesapla (DÜZELTİLDİ: Artık kendi yerinde)
  const totalNet = useCallback(() => {
    if (examType === "TYT") {
      return calculateTYTTotalNet(tytScores);
    } else {
      return calculateAYTTotalNet(aytScores, targetBranch);
    }
  }, [examType, tytScores, aytScores, targetBranch]);

  // AYT için hangi dersleri göstereceğiz? (DÜZELTİLDİ: Kendi yerinde ve güçlü eşleşme)
  // AYT için hangi dersleri göstereceğiz? (KURŞUNGEÇİRMEZ VERSİYON)
  const getAYTSubjects = () => {
    if (!targetBranch) return [];

    // 2. Gelen veriyi her türlü ihtimale karşı temizle
    const branch = String(targetBranch).trim().toLowerCase();

    // İçinde "say" kelimesi geçiyorsa kesin Sayısaldır
    if (branch.includes("say")) {
      return ["aytMatematik", "aytFizik", "aytKimya", "aytBiyoloji"];
    }
    // İçinde "eşit", "esit", "ağır" veya "ea" geçiyorsa Eşit Ağırlıktır
    else if (
      branch.includes("eşit") ||
      branch.includes("esit") ||
      branch.includes("ea") ||
      branch.includes("ağır")
    ) {
      return ["aytMatematik", "aytEdebiyat", "aytTarih1", "aytCografya1"];
    }
    // İçinde "söz" veya "soz" geçiyorsa kesin Sözelsir
    else if (branch.includes("söz") || branch.includes("soz")) {
      return [
        "aytEdebiyat",
        "aytTarih1",
        "aytCografya1",
        "aytTarih2",
        "aytCografya2",
        "aytFelsefe",
        "aytDin",
      ];
    }
    // İçinde "dil" geçiyorsa Dildir
    else if (branch.includes("dil")) {
      return ["aytDil"];
    }

    return [];
  };

  const aytSubjects = getAYTSubjects();

  // Form kaydet (DÜZELTİLDİ: Sınırları kapatıldı)
  const handleSubmit = async () => {
    setErrors([]);

    const nameValidation = validateExamName(examName);
    if (!nameValidation.valid) {
      setErrors([nameValidation.error]);
      return;
    }

    if (examType === "AYT" && !targetBranch) {
      setErrors(["AYT için lütfen önce alan seçiniz (Hedefler bölümünden)"]);
      return;
    }

    let scoresToValidate = {};
    if (examType === "TYT") {
      scoresToValidate = tytScores;
    } else {
      aytSubjects.forEach((sub) => {
        scoresToValidate[sub] = aytScores[sub];
      });
    }

    const scoreValidation = validateExam(examType, scoresToValidate);
    if (!scoreValidation.valid) {
      setErrors(scoreValidation.errors);
      return;
    }

    setLoading(true);

    try {
      const examData = {
        name: examName,
        type: examType,
        branch: examType === "AYT" ? targetBranch : null,
        tytScores: examType === "TYT" ? scoresToValidate : {},
        aytScores: examType === "AYT" ? scoresToValidate : {},
        totalNet: totalNet(),
      };

      await onSave(examData);

      // Formu temizle
      setExamName("");
      setTytScores({
        turkce: { dogru: "", yanlis: "", bos: "" },
        matematik: { dogru: "", yanlis: "", bos: "" },
        sosyal: { dogru: "", yanlis: "", bos: "" },
        fen: { dogru: "", yanlis: "", bos: "" },
      });
      setAytScores({
        aytMatematik: { dogru: "", yanlis: "", bos: "" },
        aytFizik: { dogru: "", yanlis: "", bos: "" },
        aytKimya: { dogru: "", yanlis: "", bos: "" },
        aytBiyoloji: { dogru: "", yanlis: "", bos: "" },
        aytEdebiyat: { dogru: "", yanlis: "", bos: "" },
        aytTarih1: { dogru: "", yanlis: "", bos: "" },
        aytCografya1: { dogru: "", yanlis: "", bos: "" },
        aytTarih2: { dogru: "", yanlis: "", bos: "" },
        aytCografya2: { dogru: "", yanlis: "", bos: "" },
        aytFelsefe: { dogru: "", yanlis: "", bos: "" },
        aytDin: { dogru: "", yanlis: "", bos: "" },
        aytDil: { dogru: "", yanlis: "", bos: "" },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="exam-input-card">
      <h3 className="exam-input-title">📝 Yeni Deneme Ekle</h3>

      {/* Deneme Adı */}
      <div className="form-group">
        <label className="form-label">Deneme Adı</label>
        <input
          type="text"
          className="form-input"
          value={examName}
          onChange={(e) => setExamName(e.target.value)}
          placeholder="Örn: 3D Yayınları 5. TYT Denemesi"
        />
      </div>

      {/* Deneme Türü */}
      <ExamTypeSelector selectedType={examType} onTypeChange={setExamType} />

      {/* Dersler */}
      <div className="subjects-container">
        {examType === "TYT" ? (
          <>
            <h4 className="subjects-title">TYT Dersleri</h4>
            <div className="subjects-grid">
              <SubjectRow
                label="Türkçe"
                examType="TYT"
                subject="turkce"
                dogru={tytScores.turkce.dogru}
                yanlis={tytScores.turkce.yanlis}
                bos={tytScores.turkce.bos}
                onDogruChange={(v) => handleTytChange("turkce", "dogru", v)}
                onYanlisChange={(v) => handleTytChange("turkce", "yanlis", v)}
                onBosChange={(v) => handleTytChange("turkce", "bos", v)}
              />
              <SubjectRow
                label="Matematik"
                examType="TYT"
                subject="matematik"
                dogru={tytScores.matematik.dogru}
                yanlis={tytScores.matematik.yanlis}
                bos={tytScores.matematik.bos}
                onDogruChange={(v) => handleTytChange("matematik", "dogru", v)}
                onYanlisChange={(v) =>
                  handleTytChange("matematik", "yanlis", v)
                }
                onBosChange={(v) => handleTytChange("matematik", "bos", v)}
              />
              <SubjectRow
                label="Sosyal Bilimler"
                examType="TYT"
                subject="sosyal"
                dogru={tytScores.sosyal.dogru}
                yanlis={tytScores.sosyal.yanlis}
                bos={tytScores.sosyal.bos}
                onDogruChange={(v) => handleTytChange("sosyal", "dogru", v)}
                onYanlisChange={(v) => handleTytChange("sosyal", "yanlis", v)}
                onBosChange={(v) => handleTytChange("sosyal", "bos", v)}
              />
              <SubjectRow
                label="Fen Bilimleri"
                examType="TYT"
                subject="fen"
                dogru={tytScores.fen.dogru}
                yanlis={tytScores.fen.yanlis}
                bos={tytScores.fen.bos}
                onDogruChange={(v) => handleTytChange("fen", "dogru", v)}
                onYanlisChange={(v) => handleTytChange("fen", "yanlis", v)}
                onBosChange={(v) => handleTytChange("fen", "bos", v)}
              />
            </div>
          </>
        ) : (
          <>
            <h4 className="subjects-title">
              AYT Dersleri
              {targetBranch && ` (${targetBranch})`}
            </h4>
            {!targetBranch ? (
              <div className="warning-box">
                <p>⚠️ AYT dersleri için önce hedef alanınızı seçiniz</p>
              </div>
            ) : (
              <div className="subjects-grid">
                {aytSubjects.map((subject) => {
                  const subjectNames = {
                    aytMatematik: "Matematik",
                    aytFizik: "Fizik",
                    aytKimya: "Kimya",
                    aytBiyoloji: "Biyoloji",
                    aytEdebiyat: "Edebiyat",
                    aytTarih1: "Tarih-1",
                    aytCografya1: "Coğrafya-1",
                    aytTarih2: "Tarih-2",
                    aytCografya2: "Coğrafya-2",
                    aytFelsefe: "Felsefe",
                    aytDin: "Din Kültürü",
                    aytDil: "Yabancı Dil",
                  };

                  return (
                    <SubjectRow
                      key={subject}
                      label={subjectNames[subject]}
                      examType="AYT"
                      subject={subject}
                      dogru={aytScores[subject].dogru}
                      yanlis={aytScores[subject].yanlis}
                      bos={aytScores[subject].bos}
                      onDogruChange={(v) =>
                        handleAytChange(subject, "dogru", v)
                      }
                      onYanlisChange={(v) =>
                        handleAytChange(subject, "yanlis", v)
                      }
                      onBosChange={(v) => handleAytChange(subject, "bos", v)}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Toplam Net */}
      <div className="total-net-display">
        <span className="total-net-label">{examType} Toplam Net:</span>
        <span className="total-net-value">{totalNet().toFixed(2)}</span>
      </div>

      {/* Hata Mesajları */}
      {errors.length > 0 && (
        <div className="error-box">
          {errors.map((error, index) => (
            <p key={index} className="error-message">
              ❌ {error}
            </p>
          ))}
        </div>
      )}

      {/* Kaydet Butonu */}
      <Button
        variant="logoblue"
        fullWidth
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Kaydediliyor..." : "Denemeyi Kaydet"}
      </Button>
    </Card>
  );
};

export default ExamInput;

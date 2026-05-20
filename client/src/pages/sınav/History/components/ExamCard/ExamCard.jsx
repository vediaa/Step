// pages/History/components/ExamCard/ExamCard.jsx
import { useState } from "react";
import Card from "../../../../../components/Card/Card";
import { calculateNet } from "../../../../../utils/netCalculator";
import "./ExamCard.css";

const ExamCard = ({ exam, targetNet, onDelete, onViewDetails }) => {
  const [showDetails, setShowDetails] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Hedef durumu
  const isTargetReached = targetNet && exam.totalNet >= targetNet;
  const targetDifference = targetNet
    ? (exam.totalNet - targetNet).toFixed(2)
    : null;

  // Skorları render et
  const renderScores = () => {
    const scores = exam.type === "TYT" ? exam.tytScores : exam.aytScores;
    if (!scores) return null;

    return Object.entries(scores).map(([subject, data]) => {
      if (!data || (!data.dogru && data.dogru !== 0)) return null;

      const subjectNames = {
        turkce: "Türkçe",
        matematik: "Matematik",
        sosyal: "Sosyal",
        fen: "Fen",
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
        aytDin: "Din",
        aytDil: "Yabancı Dil",
      };

      const net = calculateNet(data.dogru || 0, data.yanlis || 0);

      return (
        <div key={subject} className="detail-score-row">
          <span className="detail-subject">{subjectNames[subject]}</span>
          <div className="detail-numbers">
            <span className="detail-dyw">
              D:{data.dogru} Y:{data.yanlis} B:{data.bos || 0}
            </span>
            <span className="detail-net">{net.toFixed(2)}</span>
          </div>
        </div>
      );
    });
  };

  return (
    <Card className={`exam-card ${isTargetReached ? "success" : "warning"}`}>
      {/* Header */}
      <div className="exam-card-header">
        <div className="exam-card-info">
          <h3 className="exam-card-title">{exam.name}</h3>
          <div className="exam-card-meta">
            <span className="exam-date">
              📅 {formatDate(exam.date || exam.createdAt)}
            </span>
            <span className="exam-time">
              🕐 {formatTime(exam.date || exam.createdAt)}
            </span>
          </div>
        </div>

        {/* Badges */}
        <div className="exam-badges">
          <span className={`exam-badge type-${exam.type.toLowerCase()}`}>
            {exam.type}
          </span>
          {exam.branch && (
            <span className="exam-badge branch">{exam.branch}</span>
          )}
        </div>
      </div>

      {/* Net Display */}
      <div className="exam-net-display">
        <div className="exam-net-main">
          <span className="exam-net-label">Toplam Net</span>
          <span
            className={`exam-net-value ${isTargetReached ? "success" : "warning"}`}
          >
            {exam.totalNet.toFixed(2)}
          </span>
        </div>

        {/* Hedef Karşılaştırma */}
        {targetNet && (
          <div
            className={`exam-target-status ${isTargetReached ? "success" : "warning"}`}
          >
            {isTargetReached ? (
              <>
                <span className="status-icon">✅</span>
                <span className="status-text">
                  Hedefi {Math.abs(targetDifference)} net ile geçtin!
                </span>
              </>
            ) : (
              <>
                <span className="status-icon">❌</span>
                <span className="status-text">
                  Hedefe {Math.abs(targetDifference)} net kaldı
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Detaylar Toggle */}
      <button
        className="details-toggle"
        onClick={() => setShowDetails(!showDetails)}
      >
        {showDetails ? "Detayları Gizle ▲" : "Detayları Göster ▼"}
      </button>

      {/* Detaylı Skorlar */}
      {showDetails && (
        <div className="exam-details">
          <h4 className="details-title">Ders Bazlı Netler</h4>
          <div className="details-scores">{renderScores()}</div>

          {/* Notlar */}
          {exam.notes && (
            <div className="exam-notes">
              <strong>📝 Notlar:</strong>
              <p>{exam.notes}</p>
            </div>
          )}

          {/* Aksiyonlar */}
          <div className="exam-actions">
            <button
              className="action-btn delete"
              onClick={() => onDelete(exam._id)}
            >
              🗑️ Sil
            </button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ExamCard;

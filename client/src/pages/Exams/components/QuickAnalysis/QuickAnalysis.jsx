// pages/Exams/components/QuickAnalysis/QuickAnalysis.jsx
import Card from "../../../../components/Card/Card";
import { getSubjectName } from "../../../../utils/netCalculator";
import { calculateNet } from "../../../../utils/netCalculator";
import "./QuickAnalysis.css";

const QuickAnalysis = ({ exam, targetNet }) => {
  if (!exam) {
    return (
      <Card className="quick-analysis-card">
        <div className="no-exam-container">
          <p className="no-exam-icon">📊</p>
          <p className="no-exam-text">Henüz deneme yok</p>
          <p className="no-exam-hint">İlk denemenizi ekleyerek başlayın!</p>
        </div>
      </Card>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Hedef karşılaştırması
  let comparisonStatus = "normal";
  let comparisonText = "";

  if (targetNet) {
    const difference = exam.totalNet - targetNet;
    if (difference >= 0) {
      comparisonStatus = "success";
      comparisonText = `🎉 Hedefi ${Math.abs(difference).toFixed(
        2,
      )} net ile geçtin!`;
    } else {
      comparisonStatus = "warning";
      comparisonText = `Hedefe ${Math.abs(difference).toFixed(2)} net kaldı`;
    }
  }

  // Skorları render et
  const renderScores = () => {
    const scores = exam.type === "TYT" ? exam.tytScores : exam.aytScores;
    if (!scores) return null;

    return Object.entries(scores).map(([subject, data]) => {
      if (!data || !data.dogru) return null;

      const net = calculateNet(data.dogru || 0, data.yanlis || 0);

      return (
        <div key={subject} className="score-item">
          <span className="score-subject">{getSubjectName(subject)}</span>
          <div className="score-details">
            <span className="score-dyw">
              D:{data.dogru} Y:{data.yanlis}
            </span>
            <span className="score-net">{net.toFixed(2)}</span>
          </div>
        </div>
      );
    });
  };

  return (
    <Card className="quick-analysis-card">
      <div className="analysis-header">
        <h3 className="analysis-title">📈 Son Deneme Analizi</h3>
        <span className="analysis-date">
          {formatDate(exam.date || exam.createdAt)}
        </span>
      </div>

      <div className="exam-info">
        <h4 className="exam-name">{exam.name}</h4>
        <div className="exam-badges">
          <span className={`exam-badge type-${exam.type.toLowerCase()}`}>
            {exam.type}
          </span>
          {exam.branch && (
            <span className="exam-badge branch">{exam.branch}</span>
          )}
        </div>
      </div>

      {/* Toplam Net */}
      <div className="total-net-box">
        <span className="total-net-label">Toplam Net</span>
        <span className="total-net-number">{exam.totalNet.toFixed(2)}</span>
      </div>

      {/* Hedef Karşılaştırması */}
      {targetNet && (
        <div className={`comparison-box ${comparisonStatus}`}>
          <p className="comparison-text">{comparisonText}</p>
          {comparisonStatus === "warning" && (
            <div className="target-progress">
              <div className="target-progress-bar">
                <div
                  className="target-progress-fill"
                  style={{
                    width: `${(exam.totalNet / targetNet) * 100}%`,
                  }}
                />
              </div>
              <span className="target-progress-text">
                {exam.totalNet.toFixed(2)} / {targetNet}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Ders Detayları */}
      <div className="scores-container">
        <h5 className="scores-title">Ders Bazlı Netler</h5>
        <div className="scores-grid">{renderScores()}</div>
      </div>
    </Card>
  );
};

export default QuickAnalysis;

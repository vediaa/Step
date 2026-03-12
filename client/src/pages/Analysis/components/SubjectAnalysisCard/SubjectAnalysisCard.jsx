// pages/Analysis/components/SubjectAnalysisCard/SubjectAnalysisCard.jsx
import { useState } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Cell,
} from "recharts";
import Card from "../../../../components/Card/Card";
import "./SubjectAnalysisCard.css";

const SubjectAnalysisCard = ({ exams, examType }) => {
  const [chartType, setChartType] = useState("radar"); // radar, bar

  if (!exams || exams.length === 0) {
    return (
      <Card className="subject-analysis-card">
        <p>Henüz veri yok</p>
      </Card>
    );
  }

  // Ders bazlı ortalama hesaplama
  const calculateSubjectAverages = () => {
    const scoreField = examType === "TYT" ? "tytScores" : "aytScores";
    const subjectSums = {};
    const subjectCounts = {};

    exams.forEach((exam) => {
      const scores = exam[scoreField];
      if (!scores) return;

      Object.entries(scores).forEach(([subject, data]) => {
        if (!data || !data.net) return;

        if (!subjectSums[subject]) {
          subjectSums[subject] = 0;
          subjectCounts[subject] = 0;
        }

        subjectSums[subject] += data.net;
        subjectCounts[subject]++;
      });
    });

    const subjectNames = {
      // TYT
      turkce: "Türkçe",
      matematik: "Matematik",
      sosyal: "Sosyal",
      fen: "Fen",
      // AYT
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

    return Object.entries(subjectSums).map(([subject, sum]) => ({
      subject: subjectNames[subject] || subject,
      avg: parseFloat((sum / subjectCounts[subject]).toFixed(2)),
      count: subjectCounts[subject],
    }));
  };

  const subjectData = calculateSubjectAverages();

  // Renkler
  const colors = [
    "#667eea",
    "#764ba2",
    "#f093fb",
    "#4facfe",
    "#43e97b",
    "#fa709a",
    "#ffa751",
    "#38f9d7",
  ];

  return (
    <Card className="subject-analysis-card">
      {/* Header */}
      <div className="subject-card-header">
        <div>
          <h3 className="subject-card-title">📚 Ders Bazlı Ortalama Netler</h3>
          <p className="subject-card-subtitle">{examType} Dersleri</p>
        </div>

        {/* Chart Type Toggle */}
        <div className="chart-type-toggle">
          <button
            className={`toggle-btn ${chartType === "radar" ? "active" : ""}`}
            onClick={() => setChartType("radar")}
          >
            🎯 Radar
          </button>
          <button
            className={`toggle-btn ${chartType === "bar" ? "active" : ""}`}
            onClick={() => setChartType("bar")}
          >
            📊 Bar
          </button>
        </div>
      </div>

      {/* Grafik */}
      <div className="subject-chart-container">
        {chartType === "radar" ? (
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={subjectData}>
              <PolarGrid stroke="#e0e0e0" />
              <PolarAngleAxis
                dataKey="subject"
                style={{ fontSize: "12px", fontWeight: 600 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, "auto"]}
                style={{ fontSize: "11px" }}
              />
              <Radar
                name="Ortalama Net"
                dataKey="avg"
                stroke="#a58392"
                fill="#a58392"
                fillOpacity={0.6}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="custom-tooltip-small">
                        <p className="tooltip-label">
                          {payload[0].payload.subject}
                        </p>
                        <p className="tooltip-value">
                          Ort: {payload[0].value} net
                        </p>
                        <p className="tooltip-count">
                          {payload[0].payload.count} deneme
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={subjectData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="subject"
                style={{ fontSize: "11px", fontWeight: 600 }}
              />
              <YAxis style={{ fontSize: "11px" }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="custom-tooltip-small">
                        <p className="tooltip-label">
                          {payload[0].payload.subject}
                        </p>
                        <p className="tooltip-value">
                          Ort: {payload[0].value} net
                        </p>
                        <p className="tooltip-count">
                          {payload[0].payload.count} deneme
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar dataKey="avg" name="Ortalama Net" radius={[8, 8, 0, 0]}>
                {subjectData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Detay Liste */}
      <div className="subject-detail-list">
        {subjectData
          .sort((a, b) => b.avg - a.avg)
          .map((item, index) => (
            <div key={index} className="subject-detail-item">
              <div className="subject-detail-name">
                <span
                  className="subject-color-dot"
                  style={{ background: colors[index % colors.length] }}
                />
                <span>{item.subject}</span>
              </div>
              <div className="subject-detail-stats">
                <span className="subject-avg">{item.avg} net</span>
                <span className="subject-count">({item.count} deneme)</span>
              </div>
            </div>
          ))}
      </div>
    </Card>
  );
};

export default SubjectAnalysisCard;

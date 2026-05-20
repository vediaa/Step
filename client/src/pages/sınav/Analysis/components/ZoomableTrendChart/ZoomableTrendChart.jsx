// pages/Analysis/components/ZoomableTrendChart/ZoomableTrendChart.jsx
import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Brush,
  Area,
  ComposedChart,
} from "recharts";
import Card from "../../../../../components/Card/Card";
import "./ZoomableTrendChart.css";

const ZoomableTrendChart = ({ exams, targetNet, examType }) => {
  const [timeRange, setTimeRange] = useState("all"); // 1m, 3m, 6m, 1y, all
  const [showBrush, setShowBrush] = useState(true);

  if (!exams || exams.length === 0) {
    return (
      <Card className="zoomable-chart-card">
        <div className="no-data">
          <p className="no-data-icon">📈</p>
          <p>Henüz veri yok</p>
        </div>
      </Card>
    );
  }

  // Zaman filtreleme
  const filteredExams = useMemo(() => {
    if (timeRange === "all") return exams;

    const now = new Date();
    const ranges = {
      "1m": 30,
      "3m": 90,
      "6m": 180,
      "1y": 365,
    };

    const daysAgo = ranges[timeRange];
    const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    return exams.filter((exam) => {
      const examDate = new Date(exam.date || exam.createdAt);
      return examDate >= cutoffDate;
    });
  }, [exams, timeRange]);

  // Grafik verisi
  const chartData = useMemo(() => {
    return filteredExams
      .slice()
      .sort(
        (a, b) =>
          new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt),
      )
      .map((exam, index) => {
        const date = new Date(exam.date || exam.createdAt);
        return {
          name: date.toLocaleDateString("tr-TR", {
            day: "2-digit",
            month: "short",
          }),
          fullDate: date.toLocaleDateString("tr-TR"),
          net: parseFloat(exam.totalNet.toFixed(2)),
          examName: exam.name,
          examId: exam._id,
          index: index + 1,
        };
      });
  }, [filteredExams]);

  // İstatistikler
  const stats = useMemo(() => {
    if (chartData.length === 0) return { avg: 0, min: 0, max: 0, trend: 0 };

    const nets = chartData.map((d) => d.net);
    const avg = nets.reduce((a, b) => a + b, 0) / nets.length;
    const min = Math.min(...nets);
    const max = Math.max(...nets);
    const trend = chartData.length > 1 ? nets[nets.length - 1] - nets[0] : 0;

    return {
      avg: avg.toFixed(2),
      min: min.toFixed(2),
      max: max.toFixed(2),
      trend: trend.toFixed(2),
    };
  }, [chartData]);

  // Y eksen
  const yDomain = useMemo(() => {
    if (chartData.length === 0) return [0, 100];
    const nets = chartData.map((d) => d.net);
    const min = Math.min(...nets);
    const max = Math.max(...nets);
    return [Math.max(0, Math.floor(min - 5)), Math.ceil(max + 5)];
  }, [chartData]);

  // Gelişmiş Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="enhanced-tooltip">
          <div className="tooltip-header">
            <p className="tooltip-exam-name">{data.examName}</p>
            <p className="tooltip-date">{data.fullDate}</p>
          </div>
          <div className="tooltip-body">
            <div className="tooltip-stat">
              <span className="tooltip-label">Net:</span>
              <span className="tooltip-value">{data.net}</span>
            </div>
            {targetNet && (
              <div className="tooltip-stat">
                <span className="tooltip-label">Hedef:</span>
                <span className="tooltip-value">{targetNet}</span>
              </div>
            )}
            {targetNet && (
              <div className="tooltip-stat">
                <span className="tooltip-label">Fark:</span>
                <span
                  className={`tooltip-value ${
                    data.net >= targetNet ? "success" : "warning"
                  }`}
                >
                  {data.net >= targetNet ? "+" : ""}
                  {(data.net - targetNet).toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="zoomable-chart-card">
      {/* Header */}
      <div className="chart-header-advanced">
        <div className="header-left">
          <h3 className="chart-title">📊 {examType} Net Gelişimi</h3>
          <p className="chart-subtitle">{filteredExams.length} deneme</p>
        </div>

        {/* Zaman Seçimi */}
        <div className="time-range-selector">
          {["1m", "3m", "6m", "1y", "all"].map((range) => (
            <button
              key={range}
              className={`range-btn ${timeRange === range ? "active" : ""}`}
              onClick={() => setTimeRange(range)}
            >
              {range === "all"
                ? "Hepsi"
                : range === "1m"
                  ? "1 Ay"
                  : range === "3m"
                    ? "3 Ay"
                    : range === "6m"
                      ? "6 Ay"
                      : "1 Yıl"}
            </button>
          ))}
        </div>
      </div>

      {/* Mini İstatistikler */}
      <div className="chart-mini-stats">
        <div className="mini-stat">
          <span className="mini-stat-label">Ortalama</span>
          <span className="mini-stat-value">{stats.avg}</span>
        </div>
        <div className="mini-stat">
          <span className="mini-stat-label">Min</span>
          <span className="mini-stat-value">{stats.min}</span>
        </div>
        <div className="mini-stat">
          <span className="mini-stat-label">Max</span>
          <span className="mini-stat-value success">{stats.max}</span>
        </div>
        <div className="mini-stat">
          <span className="mini-stat-label">Trend</span>
          <span
            className={`mini-stat-value ${
              parseFloat(stats.trend) >= 0 ? "success" : "warning"
            }`}
          >
            {parseFloat(stats.trend) >= 0 ? "+" : ""}
            {stats.trend}
          </span>
        </div>
      </div>

      {/* Grafik */}
      <div className="chart-container-advanced">
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
          >
            <defs>
              <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a58392" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#a58392" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="name"
              stroke="#9e9e9e"
              style={{ fontSize: "12px", fontWeight: 500 }}
            />
            <YAxis
              domain={yDomain}
              stroke="#9e9e9e"
              style={{ fontSize: "12px", fontWeight: 500 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: "13px", fontWeight: 600 }} />

            {/* Hedef çizgisi */}
            {targetNet && (
              <ReferenceLine
                y={targetNet}
                stroke="#ff9800"
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{
                  value: `Hedef: ${targetNet}`,
                  position: "right",
                  fill: "#ff9800",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              />
            )}

            {/* Alan (Dolgu) */}
            <Area
              type="monotone"
              dataKey="net"
              fill="url(#colorNet)"
              stroke="none"
            />

            {/* Çizgi */}
            <Line
              type="monotone"
              dataKey="net"
              stroke="#a58392"
              strokeWidth={3}
              dot={{
                fill: "#fff",
                stroke: "#a58392",
                strokeWidth: 2,
                r: 6,
                cursor: "pointer",
              }}
              activeDot={{
                fill: "#7b1fa2",
                stroke: "#fff",
                strokeWidth: 3,
                r: 8,
                cursor: "pointer",
              }}
              name="Net"
            />

            {/* Brush (Kaydırma) */}
            {showBrush && chartData.length > 10 && (
              <Brush
                dataKey="name"
                height={30}
                stroke="#a58392"
                fill="#f9f9f9"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Brush Toggle */}
      {chartData.length > 10 && (
        <button
          className="brush-toggle"
          onClick={() => setShowBrush(!showBrush)}
        >
          {showBrush ? "Kaydırıcıyı Gizle" : "Kaydırıcıyı Göster"}
        </button>
      )}
    </Card>
  );
};

export default ZoomableTrendChart;

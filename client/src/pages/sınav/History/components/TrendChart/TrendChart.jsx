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
} from "recharts";
import Card from "../../../../../components/Card/Card";
import "./TrendChart.css";

const TrendChart = ({ exams, targetNet, examType }) => {
  if (!exams || exams.length === 0) {
    return (
      <Card className="trend-chart-card">
        <div className="no-data-container">
          <p className="no-data-icon">📈</p>
          <p className="no-data-text">Henüz grafik için yeterli veri yok</p>
          <p className="no-data-hint">En az 2 deneme gerekli</p>
        </div>
      </Card>
    );
  }

  // Verileri hazırla (En eskiden en yeniye)
  const chartData = exams
    .slice()
    .reverse()
    .map((exam, index) => {
      const date = new Date(exam.date || exam.createdAt);
      const formattedDate = date.toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "short",
      });

      return {
        name: formattedDate,
        net: parseFloat(exam.totalNet.toFixed(2)),
        examName: exam.name,
        index: index + 1,
      };
    });

  // Min ve Max değerler
  const allNets = chartData.map((d) => d.net);
  const minNet = Math.min(...allNets);
  const maxNet = Math.max(...allNets);
  const avgNet = (allNets.reduce((a, b) => a + b, 0) / allNets.length).toFixed(
    2,
  );

  // Y eksen domain (biraz margin ekle)
  const yMin = Math.max(0, Math.floor(minNet - 5));
  const yMax = Math.ceil(maxNet + 5);

  // Trend hesaplama (İlk ve son deneme)
  const firstNet = chartData[0].net;
  const lastNet = chartData[chartData.length - 1].net;
  const trendChange = (lastNet - firstNet).toFixed(2);
  const trendPercentage =
    firstNet > 0 ? (((lastNet - firstNet) / firstNet) * 100).toFixed(1) : 0;

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-title">{payload[0].payload.examName}</p>
          <p className="tooltip-date">{payload[0].payload.name}</p>
          <p className="tooltip-net">Net: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="trend-chart-card">
      <div className="chart-header">
        <h3 className="chart-title">📊 {examType} Gelişim Grafiği</h3>
        <div className="chart-stats">
          <div className="stat-item">
            <span className="stat-label">Ortalama</span>
            <span className="stat-value">{avgNet}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">En İyi</span>
            <span className="stat-value success">{maxNet.toFixed(2)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Değişim</span>
            <span
              className={`stat-value ${
                trendChange >= 0 ? "success" : "warning"
              }`}
            >
              {trendChange >= 0 ? "+" : ""}
              {trendChange} ({trendPercentage >= 0 ? "+" : ""}
              {trendPercentage}%)
            </span>
          </div>
        </div>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="name"
              stroke="#9e9e9e"
              style={{ fontSize: "12px", fontWeight: 500 }}
            />
            <YAxis
              domain={[yMin, yMax]}
              stroke="#9e9e9e"
              style={{ fontSize: "12px", fontWeight: 500 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: "13px", fontWeight: 600 }}
              iconType="line"
            />

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

            {/* Ana çizgi */}
            <Line
              type="monotone"
              dataKey="net"
              stroke="#a58392"
              strokeWidth={3}
              dot={{
                fill: "#fff",
                stroke: "#a58392",
                strokeWidth: 2,
                r: 5,
              }}
              activeDot={{
                fill: "#7b1fa2",
                stroke: "#fff",
                strokeWidth: 2,
                r: 7,
              }}
              name="Net"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Trend Açıklama */}
      <div className="chart-footer">
        {trendChange >= 0 ? (
          <p className="trend-message success">
            ✨ Harika! İlk denemeye göre <strong>{trendChange} net</strong>{" "}
            ilerleme gösterdin!
          </p>
        ) : (
          <p className="trend-message warning">
            📉 Son denemende bir düşüş var. İlk denemeye göre{" "}
            <strong>{Math.abs(trendChange)} net</strong> geride kaldın. Tekrar
            odaklan!
          </p>
        )}
      </div>
    </Card>
  );
};

export default TrendChart;

// pages/Analysis/components/OverviewStats/OverviewStats.jsx
import "./OverviewStats.css";

const OverviewStats = ({ stats, targets }) => {
  const calculateProgress = (current, target) => {
    if (!target || target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const cards = [
    {
      id: "total",
      title: "Toplam Deneme",
      value: stats?.totalExams || 0,
      icon: "📚",
      color: "#667eea",
    },
    {
      id: "average",
      title: "Ortalama Net",
      value: stats?.averageNet?.toFixed(2) || "0.00",
      icon: "📊",
      color: "#f093fb",
      subtext: "Tüm denemeler",
    },
    {
      id: "best",
      title: "En İyi Net",
      value: stats?.bestNet?.toFixed(2) || "0.00",
      icon: "🏆",
      color: "#4facfe",
      subtext: "Rekorun!",
    },
    {
      id: "improvement",
      title: "Gelişim",
      value: stats?.improvement?.totalChange
        ? `${stats.improvement.totalChange >= 0 ? "+" : ""}${stats.improvement.totalChange.toFixed(2)}`
        : "+0.00",
      icon: stats?.improvement?.totalChange >= 0 ? "📈" : "📉",
      color: stats?.improvement?.totalChange >= 0 ? "#43e97b" : "#fa709a",
      subtext: "İlk 5 vs Son 5",
    },
    {
      id: "target-reached",
      title: "Hedef Başarı",
      value: `${stats?.targetReachedPercentage || 0}%`,
      icon: "🎯",
      color: "#ffa751",
      subtext: `${stats?.targetReachedCount || 0} / ${(stats?.targetReachedCount || 0) + (stats?.targetMissedCount || 0)} deneme`,
    },
    {
      id: "tyt-progress",
      title: "TYT Hedef",
      value: stats?.averageTytNet?.toFixed(2) || "0.00",
      icon: "📝",
      color: "#38f9d7",
      progress: targets?.tytNet
        ? calculateProgress(stats?.averageTytNet, targets.tytNet)
        : 0,
      target: targets?.tytNet || null,
    },
    {
      id: "ayt-progress",
      title: "AYT Hedef",
      value: stats?.averageAytNet?.toFixed(2) || "0.00",
      icon: "📐",
      color: "#4facfe",
      progress: targets?.aytNet
        ? calculateProgress(stats?.averageAytNet, targets.aytNet)
        : 0,
      target: targets?.aytNet || null,
    },
  ];

  return (
    <div className="overview-stats">
      {cards.map((card) => (
        <div
          key={card.id}
          className="stat-card"
          style={{ "--card-color": card.color }}
        >
          <div className="stat-icon">{card.icon}</div>
          <div className="stat-content">
            <p className="stat-title">{card.title}</p>
            <h3 className="stat-value">{card.value}</h3>
            {card.subtext && <p className="stat-subtext">{card.subtext}</p>}
            {card.target && <p className="stat-target">Hedef: {card.target}</p>}
          </div>
          {card.progress !== undefined && (
            <div className="stat-progress">
              <div
                className="stat-progress-bar"
                style={{ width: `${card.progress}%` }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default OverviewStats;

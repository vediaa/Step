import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiInbox,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiArrowRight,
  FiUser,
} from "react-icons/fi";
import Card from "../../components/Card/Card";
import { useAuth } from "../../context/AuthContext";
import "./OgretmenDashboard.scss";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const authFetch = (url) => {
  const token = localStorage.getItem("token");
  return fetch(url, { headers: { Authorization: `Bearer ${token}` } });
};

const formatDate = (d) =>
  new Date(d).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

const OgretmenDashboard = () => {
  const { user } = useAuth();
  const [sorular, setSorular] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await authFetch(`${API_URL}/questions_db/teacher-inbox`);
        const data = await res.json();
        if (data.success) setSorular(data.data || []);
      } catch {
        setSorular([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // İstatistikler
  const bekleyen = sorular.filter((s) => s.status === "pending").length;
  const cevaplanan = sorular.filter((s) => s.status === "answered").length;
  const toplam = sorular.length;

  // Son 5 bekleyen soru
  const sonBekleyenler = sorular
    .filter((s) => s.status === "pending")
    .slice(0, 5);

  return (
    <div className="ogr-dash">
      {/* ── Başlık ── */}
      <div className="ogr-dash-header">
        <div>
          <h1 className="ogr-dash-title">
            Merhaba{user?.ad ? `, ${user.ad}` : ""} 👋
          </h1>
          <p className="ogr-dash-sub">Bugün {bekleyen} soru seni bekliyor.</p>
        </div>
      </div>

      {/* ── İstatistik Kartları ── */}
      <div className="ogr-stat-grid">
        <div className="ogr-stat-card purple">
          <div className="ogr-stat-icon">
            <FiInbox size={22} />
          </div>
          <div>
            <p className="ogr-stat-val">{toplam}</p>
            <p className="ogr-stat-lbl">Toplam Soru</p>
          </div>
        </div>

        <div className="ogr-stat-card yellow">
          <div className="ogr-stat-icon">
            <FiClock size={22} />
          </div>
          <div>
            <p className="ogr-stat-val">{bekleyen}</p>
            <p className="ogr-stat-lbl">Bekleyen</p>
          </div>
        </div>

        <div className="ogr-stat-card green">
          <div className="ogr-stat-icon">
            <FiCheckCircle size={22} />
          </div>
          <div>
            <p className="ogr-stat-val">{cevaplanan}</p>
            <p className="ogr-stat-lbl">Cevaplanan</p>
          </div>
        </div>
      </div>

      {/* ── Son Bekleyen Sorular ── */}
      <div className="ogr-section">
        <div className="ogr-section-head">
          <h2 className="ogr-section-title">Son Bekleyen Sorular</h2>
          <Link to="/ogretmen-panel" className="ogr-see-all">
            Tümünü Gör <FiArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="ogr-loading">
            <div className="ogr-spinner" />
          </div>
        ) : sonBekleyenler.length === 0 ? (
          <Card className="ogr-empty-card">
            <FiCheckCircle size={32} className="ogr-empty-icon" />
            <p>Bekleyen soru yok! 🎉</p>
          </Card>
        ) : (
          <div className="ogr-soru-list">
            {sonBekleyenler.map((soru) => (
              <Link
                key={soru._id}
                to="/ogretmen-panel"
                className="ogr-soru-row"
              >
                {/* Küçük görsel */}
                <div className="ogr-soru-thumb">
                  {soru.imageUrl ? (
                    <img
                      src={`data:image/jpeg;base64,${soru.imageUrl}`}
                      alt=""
                    />
                  ) : (
                    <FiInbox size={18} />
                  )}
                </div>

                <div className="ogr-soru-body">
                  <span className="ogr-soru-ders">{soru.ders}</span>
                  <p className="ogr-soru-text">
                    {soru.extractedText
                      ? soru.extractedText.slice(0, 70) + "..."
                      : "Görsel soru"}
                  </p>
                  <div className="ogr-soru-meta">
                    <FiUser size={11} />
                    <span>{soru.studentName || "Öğrenci"}</span>
                    <span className="ogr-soru-tarih">
                      {formatDate(soru.createdAt)}
                    </span>
                  </div>
                </div>

                <FiArrowRight size={16} className="ogr-soru-arrow" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OgretmenDashboard;

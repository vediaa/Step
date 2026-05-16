import { useState, useEffect, useRef } from "react";
import {
  FiInbox, FiCheckCircle, FiClock, FiUser, FiX,
  FiSend, FiImage, FiFilter, FiCamera, FiAlertTriangle,
  FiMaximize2, FiRefreshCw,
} from "react-icons/fi";
import "./OgretmenPanel.scss";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const formatDate = (d) =>
  new Date(d).toLocaleString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

const authFetch = (url, options = {}) => {
  const token = localStorage.getItem("token");
  return fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...options.headers },
  });
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = {
    pending:  { label: "Bekliyor",  cls: "pending",  icon: <FiClock size={12} /> },
    answered: { label: "Cevaplandı",cls: "answered", icon: <FiCheckCircle size={12} /> },
    verified: { label: "Doğrulandı",cls: "verified", icon: <FiCheckCircle size={12} /> },
    disputed: { label: "İtiraz Var",cls: "disputed", icon: <FiAlertTriangle size={12} /> },
  };
  const c = cfg[status] || cfg.pending;
  return <span className={`op-status-badge ${c.cls}`}>{c.icon} {c.label}</span>;
};

// ─── Soru Satırı ──────────────────────────────────────────────────────────────
const SoruRow = ({ soru, onClick }) => (
  <div className={`op-row ${soru.status === "disputed" ? "disputed" : ""}`} onClick={() => onClick(soru)}>
    <div className="op-row-thumb">
      {soru.imageUrl
        ? <img src={`data:image/jpeg;base64,${soru.imageUrl}`} alt="" />
        : <div className="op-row-no-img"><FiImage size={20} /></div>
      }
    </div>
    <div className="op-row-body">
      <div className="op-row-meta">
        <span className="op-row-ders">{soru.ders}</span>
        {soru.isDuplicate && <span className="op-row-dup">Tekrar</span>}
        {soru.status === "disputed" && soru.feedback?.note && (
          <span className="op-row-note">"{soru.feedback.note}"</span>
        )}
      </div>
      <div className="op-row-foot">
        <FiUser size={12} />
        <span>{soru.studentName || "Öğrenci"}</span>
        <span className="op-row-tarih">{formatDate(soru.createdAt)}</span>
      </div>
    </div>
    <StatusBadge status={soru.status} />
  </div>
);

// ─── Görsel Büyütme Modalı ────────────────────────────────────────────────────
const BuyukGorselModal = ({ src, onClose }) => (
  <div className="op-buyuk-overlay" onClick={onClose}>
    <button className="op-buyuk-close" onClick={onClose}><FiX size={24} /></button>
    <img
      src={src}
      alt="Büyük görsel"
      className="op-buyuk-img"
      onClick={(e) => e.stopPropagation()}
    />
  </div>
);

// ─── ANA BİLEŞEN ──────────────────────────────────────────────────────────────
const OgretmenPanel = () => {
  const [sorular,   setSorular]   = useState([]);
  const [disputed,  setDisputed]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [aktifTab,  setAktifTab]  = useState("bekleyen");
  const [dersFilter,setDersFilter]= useState("Tümü");
  const [secilenSoru, setSecilenSoru] = useState(null);
  const [buyukGorsel, setBuyukGorsel] = useState(null); // URL string

  const [cevapMetni,     setCevapMetni]     = useState("");
  const [cevapFoto,      setCevapFoto]      = useState(null);
  const [cevapFotoPreview, setCevapFotoPreview] = useState(null);
  const [gonderiyor,     setGonderiyor]     = useState(false);

  const fileInputRef   = useRef(null);
  const cameraInputRef = useRef(null);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [inboxRes, disputedRes] = await Promise.all([
        authFetch(`${API_URL}/questions_db/teacher-inbox`),
        authFetch(`${API_URL}/questions_db/disputed`),
      ]);
      const [inboxData, disputedData] = await Promise.all([inboxRes.json(), disputedRes.json()]);
      if (inboxData.success)    setSorular(inboxData.data || []);
      if (disputedData.success) setDisputed(disputedData.data || []);
    } catch { setSorular([]); setDisputed([]); }
    finally { setLoading(false); }
  };

  // ─── Fotoğraf seç ────────────────────────────────────────────────────────
  const cevapFotoSec = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setCevapFotoPreview(e.target.result);
      setCevapFoto(e.target.result.split(",")[1]);
    };
    reader.readAsDataURL(file);
  };

  const fotoKaldir = () => {
    setCevapFoto(null); setCevapFotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  // ─── Cevap gönder ────────────────────────────────────────────────────────
  const cevapGonder = async () => {
    if (!cevapMetni.trim() && !cevapFoto) return;
    setGonderiyor(true);
    try {
      const res = await authFetch(`${API_URL}/questions_db/${secilenSoru._id}/answer`, {
        method: "PUT",
        body: JSON.stringify({ answerText: cevapMetni.trim(), answerImageBase64: cevapFoto || "" }),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message);

      // Local state güncelle
      const update = (list) => list.map((s) =>
        s._id === secilenSoru._id
          ? { ...s, status: "answered", answer: { text: cevapMetni.trim(), imageUrl: cevapFoto || "", answeredAt: new Date() }, feedback: { type: null, note: "", givenAt: null } }
          : s
      );
      setSorular(update);
      setDisputed((prev) => prev.filter((s) => s._id !== secilenSoru._id));

      setCevapMetni(""); fotoKaldir(); setSecilenSoru(null);
    } catch (err) {
      alert("❌ " + (err.message || "Cevap gönderilemedi"));
    } finally {
      setGonderiyor(false);
    }
  };

  const panelKapat = () => { setSecilenSoru(null); setCevapMetni(""); fotoKaldir(); };

  // ─── Filtreleme ──────────────────────────────────────────────────────────
  const tabSorular = {
    bekleyen:   sorular.filter((s) => s.status === "pending"),
    cevaplanan: sorular.filter((s) => ["answered", "verified"].includes(s.status)),
    itiraz:     disputed,
  };

  const filtreliSorular = (tabSorular[aktifTab] || []).filter(
    (s) => dersFilter === "Tümü" || s.ders === dersFilter
  );

  const dersler = ["Tümü", ...new Set(sorular.map((s) => s.ders).filter(Boolean))];

  const stats = [
    { label: "Bekleyen",   value: tabSorular.bekleyen.length,   color: "yellow", icon: <FiClock size={20} /> },
    { label: "Cevaplanan", value: tabSorular.cevaplanan.length, color: "green",  icon: <FiCheckCircle size={20} /> },
    { label: "İtiraz",     value: disputed.length,              color: "red",    icon: <FiAlertTriangle size={20} /> },
  ];

  if (loading) return (
    <div className="op-container">
      <div className="op-loading"><div className="op-spinner" /><p>Yükleniyor...</p></div>
    </div>
  );

  return (
    <div className="op-container">
      <div className="op-content">

        {/* Header */}
        <div className="op-header">
          <div>
            <h1 className="op-title">Gelen Sorular</h1>
            <p className="op-subtitle">Öğrencilerden gelen sorular</p>
          </div>
          <button className="op-refresh-btn" onClick={loadAll}>
            <FiRefreshCw size={14} /> Yenile
          </button>
        </div>

        {/* İstatistikler */}
        <div className="op-stats">
          {stats.map((s) => (
            <div key={s.label} className={`op-stat-card ${s.color}`}>
              <div className="op-stat-icon">{s.icon}</div>
              <div>
                <p className="op-stat-value">{s.value}</p>
                <p className="op-stat-label">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filtreler */}
        <div className="op-filters">
          <div className="op-tabs">
            {[
              { key: "bekleyen",   label: "Bekleyenler",  badge: tabSorular.bekleyen.length },
              { key: "cevaplanan", label: "Cevaplananlar",badge: 0 },
              { key: "itiraz",     label: "İtirazlar",    badge: disputed.length },
            ].map((t) => (
              <button
                key={t.key}
                className={`op-tab ${aktifTab === t.key ? "active" : ""} ${t.key === "itiraz" && disputed.length > 0 ? "has-alert" : ""}`}
                onClick={() => setAktifTab(t.key)}
              >
                {t.key === "itiraz" && <FiAlertTriangle size={13} />}
                {t.label}
                {t.badge > 0 && <span className="op-tab-badge">{t.badge}</span>}
              </button>
            ))}
          </div>

          <div className="op-ders-filter">
            <FiFilter size={13} />
            <select value={dersFilter} onChange={(e) => setDersFilter(e.target.value)} className="op-ders-select">
              {dersler.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {/* Liste */}
        <div className="op-liste">
          {filtreliSorular.length === 0 ? (
            <div className="op-empty">
              <FiInbox size={44} className="op-empty-icon" />
              <p className="op-empty-title">
                {aktifTab === "bekleyen" ? "Bekleyen soru yok 🎉"
                  : aktifTab === "itiraz" ? "İtiraz edilen soru yok 👍"
                  : "Cevaplanan soru yok"}
              </p>
            </div>
          ) : (
            filtreliSorular.map((soru) => (
              <SoruRow key={soru._id} soru={soru} onClick={setSecilenSoru} />
            ))
          )}
        </div>
      </div>

      {/* Hidden inputs */}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => { cevapFotoSec(e.target.files[0]); e.target.value = ""; }} style={{ display: "none" }} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={(e) => { cevapFotoSec(e.target.files[0]); e.target.value = ""; }} style={{ display: "none" }} />

      {/* Büyük Görsel Modal */}
      {buyukGorsel && <BuyukGorselModal src={buyukGorsel} onClose={() => setBuyukGorsel(null)} />}

      {/* ── Detay / Cevap Paneli ─────────────────────────────────────────── */}
      {secilenSoru && (
        <div className="op-modal-overlay" onClick={panelKapat}>
          <div className="op-detay-panel" onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="op-detay-head">
              <div>
                <span className="op-detay-ders">{secilenSoru.ders}</span>
                <span className="op-detay-tarih">{formatDate(secilenSoru.createdAt)}</span>
              </div>
              <button className="op-modal-close" onClick={panelKapat}><FiX size={20} /></button>
            </div>

            {/* Öğrenci + durum */}
            <div className="op-detay-student">
              <FiUser size={14} />
              <span>{secilenSoru.studentName || "Öğrenci"}</span>
              <StatusBadge status={secilenSoru.status} />
            </div>

            {/* İtiraz notu (disputed ise göster) */}
            {secilenSoru.status === "disputed" && secilenSoru.feedback?.note && (
              <div className="op-itiraz-banner">
                <FiAlertTriangle size={15} />
                <div>
                  <strong>Öğrenci itiraz etti:</strong>
                  <p>"{secilenSoru.feedback.note}"</p>
                </div>
              </div>
            )}

            {/* Soru görseli — büyütme butonu ile */}
            {secilenSoru.imageUrl && (
              <div className="op-detay-img-wrap">
                <img
                  src={`data:image/jpeg;base64,${secilenSoru.imageUrl}`}
                  alt="Soru"
                  className="op-detay-img"
                />
                <button
                  className="op-buyut-btn"
                  onClick={() => setBuyukGorsel(`data:image/jpeg;base64,${secilenSoru.imageUrl}`)}
                >
                  <FiMaximize2 size={16} /> Büyüt
                </button>
              </div>
            )}

            {/* Cevap verilmişse göster */}
            {["answered", "verified", "disputed"].includes(secilenSoru.status) ? (
              <div className="op-detay-answered">
                <div className="op-detay-answered-head">
                  <FiCheckCircle size={15} /> Verilen Cevap
                </div>
                {secilenSoru.answer?.text && <p>{secilenSoru.answer.text}</p>}
                {secilenSoru.answer?.imageUrl && (
                  <div className="op-cevap-gorsel-wrap">
                    <img
                      src={`data:image/jpeg;base64,${secilenSoru.answer.imageUrl}`}
                      alt="Cevap"
                      className="op-detay-answer-img"
                    />
                    <button
                      className="op-buyut-btn"
                      onClick={() => setBuyukGorsel(`data:image/jpeg;base64,${secilenSoru.answer.imageUrl}`)}
                    >
                      <FiMaximize2 size={16} /> Büyüt
                    </button>
                  </div>
                )}
                {secilenSoru.answer?.answeredAt && (
                  <span className="op-detay-answered-date">{formatDate(secilenSoru.answer.answeredAt)}</span>
                )}

                {/* Disputed ise tekrar çözüm alanı aç */}
                {secilenSoru.status === "disputed" && (
                  <button
                    className="op-yeniden-btn"
                    onClick={() => setSecilenSoru({ ...secilenSoru, _forceEdit: true })}
                  >
                    <FiRefreshCw size={14} /> Tekrar Çöz
                  </button>
                )}
              </div>
            ) : null}

            {/* Cevap yazma alanı: pending veya forceEdit */}
            {(secilenSoru.status === "pending" || secilenSoru._forceEdit) && (
              <div className="op-cevap-area">
                <label className="op-cevap-label">
                  {secilenSoru._forceEdit ? "Düzeltilmiş Cevabı Yaz" : "Cevabını Yaz"}
                </label>

                <textarea
                  className="op-cevap-input"
                  placeholder="Çözüm adımlarını açıkla... (opsiyonel)"
                  value={cevapMetni}
                  onChange={(e) => setCevapMetni(e.target.value)}
                  rows={4}
                />

                {cevapFotoPreview && (
                  <div className="op-foto-preview-wrap">
                    <img src={cevapFotoPreview} alt="Cevap görseli" className="op-foto-preview" />
                    <button className="op-foto-kaldir" onClick={fotoKaldir}><FiX size={16} /></button>
                  </div>
                )}

                {!cevapFotoPreview && (
                  <div className="op-foto-btns">
                    <button className="op-foto-btn" onClick={() => cameraInputRef.current?.click()}>
                      <FiCamera size={16} /> Kamera
                    </button>
                    <button className="op-foto-btn" onClick={() => fileInputRef.current?.click()}>
                      <FiImage size={16} /> Fotoğraf Ekle
                    </button>
                  </div>
                )}

                <button
                  className="op-cevap-btn"
                  onClick={cevapGonder}
                  disabled={gonderiyor || (!cevapMetni.trim() && !cevapFoto)}
                >
                  {gonderiyor
                    ? <><div className="op-spinner-sm" /> Gönderiliyor...</>
                    : <><FiSend size={15} /> Cevabı Gönder</>
                  }
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OgretmenPanel;
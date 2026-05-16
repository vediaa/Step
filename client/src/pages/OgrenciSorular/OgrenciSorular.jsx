/* import { useState, useEffect, useRef } from "react";
import Card from "../../components/Card/Card";
import {
  FiCamera,
  FiImage,
  FiFolder,
  FiX,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiSend,
  FiBook,
} from "react-icons/fi";
import "./OgrenciSorular.scss";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// ─── Yardımcı: Tarih formatı ──────────────────────────────────────────────────
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ─── Durum Badge bileşeni ─────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const config = {
    pending: { label: "Bekliyor", icon: <FiClock size={12} />, cls: "pending" },
    answered: {
      label: "Cevaplandı",
      icon: <FiCheckCircle size={12} />,
      cls: "answered",
    },
    duplicate_answered: {
      label: "Cevaplandı",
      icon: <FiCheckCircle size={12} />,
      cls: "answered",
    },
    duplicate_pending: {
      label: "Kuyrukta",
      icon: <FiAlertCircle size={12} />,
      cls: "queue",
    },
  };
  const c = config[status] || config.pending;
  return (
    <span className={`status-badge ${c.cls}`}>
      {c.icon} {c.label}
    </span>
  );
};

// ─── Ana Bileşen ──────────────────────────────────────────────────────────────
const OgrenciSorular = () => {
  const [sorular, setSorular] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  // Modal state'leri
  const [secimModal, setSecimModal] = useState(false);
  const [soruDetayModal, setSoruDetayModal] = useState(null); // seçili soru
  const [resultModal, setResultModal] = useState(null); // API sonucu

  const [aktifTab, setAktifTab] = useState("hepsi");
  const [dersFilter, setDersFilter] = useState("Genel");

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  useEffect(() => {
    loadSorular();
  }, []);

  // ─── Soruları API'den yükle ────────────────────────────────────────────────
  const loadSorular = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/questions_db/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();
      if (result.success) {
        setSorular(result.data || []);
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      // Endpoint henüz yoksa boş liste göster, hata gösterme
      setSorular([]);
    } finally {
      setLoading(false);
    }
  };

  // ─── Görsel sıkıştırma ────────────────────────────────────────────────────
  const resizeImage = (file, maxWidth = 1200) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let w = img.width;
          let h = img.height;
          if (w > maxWidth) {
            h = (h * maxWidth) / w;
            w = maxWidth;
          }
          canvas.width = w;
          canvas.height = h;
          canvas.getContext("2d").drawImage(img, 0, 0, w, h);
          canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.85);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  // ─── Fotoğraf gönder ──────────────────────────────────────────────────────
  const soruGonder = async (file) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Dosya 10MB'dan büyük olamaz!");
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("Lütfen bir görsel seçin.");
      return;
    }

    try {
      setUploading(true);
      setSecimModal(false);

      const blob = await resizeImage(file);
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("image", blob, "soru.jpg");
      formData.append("ders", dersFilter);

      const response = await fetch(`${API_URL}/questions_db/ask`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await response.json();

      if (!result.success) throw new Error(result.message);

      // Sonucu göster
      setResultModal(result);

      // Listeyi güncelle
      await loadSorular();
    } catch (err) {
      alert("❌ " + (err.message || "Bir hata oluştu"));
    } finally {
      setUploading(false);
    }
  };

  const dosyadanSec = (e) => {
    soruGonder(e.target.files[0]);
    e.target.value = "";
  };
  const kameradanCek = (e) => {
    soruGonder(e.target.files[0]);
    e.target.value = "";
  };

  // ─── Filtreleme ───────────────────────────────────────────────────────────
  const filtreliSorular = sorular.filter((s) => {
    if (aktifTab === "bekleyen") return s.status === "pending";
    if (aktifTab === "cevaplanan") return s.status === "answered";
    return true;
  });

  const bekleyenSayi = sorular.filter((s) => s.status === "pending").length;
  const cevaplananiSayi = sorular.filter((s) => s.status === "answered").length;

  const DERSLER = [
    "Genel",
    "Matematik",
    "Geometri",
    "Fizik",
    "Kimya",
    "Biyoloji",
    "Türkçe",
    "Tarih",
  ];

  // ─── Render ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="os-container">
        <div className="os-loading">
          <div className="os-spinner" />
          <p>Sorular yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="os-container">
      <div className="os-content">
        {/* ── Header ──────────────────────────────────────────────── 
        <div className="os-header">
          <div className="os-header-left">
            <h1 className="os-title">Sorularım</h1>
            <p className="os-subtitle">
              {sorular.length} soru · {cevaplananiSayi} cevaplandı
            </p>
          </div>
          <button
            className="os-yeni-btn"
            onClick={() => setSecimModal(true)}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <div className="btn-spinner" /> Gönderiliyor...
              </>
            ) : (
              <>
                <FiSend size={18} /> Soru Sor
              </>
            )}
          </button>
        </div>

        {/* ── Ders Filtresi ────────────────────────────────────────── 
        <div className="os-ders-scroll">
          {DERSLER.map((d) => (
            <button
              key={d}
              className={`os-ders-chip ${dersFilter === d ? "active" : ""}`}
              onClick={() => setDersFilter(d)}
            >
              {d}
            </button>
          ))}
        </div>

        {/* ── Tab Bar ──────────────────────────────────────────────── 
        <div className="os-tabs">
          {[
            { key: "hepsi", label: "Tümü", count: sorular.length },
            { key: "bekleyen", label: "Bekleyen", count: bekleyenSayi },
            { key: "cevaplanan", label: "Cevaplanan", count: cevaplananiSayi },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`os-tab ${aktifTab === tab.key ? "active" : ""}`}
              onClick={() => setAktifTab(tab.key)}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="os-tab-badge">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── Soru Grid ────────────────────────────────────────────── 
        {filtreliSorular.length === 0 ? (
          <div className="os-empty">
            <FiBook size={48} className="os-empty-icon" />
            <p className="os-empty-title">
              {aktifTab === "bekleyen"
                ? "Bekleyen soru yok"
                : aktifTab === "cevaplanan"
                  ? "Henüz cevaplanan soru yok"
                  : "Henüz soru sormadın"}
            </p>
            <p className="os-empty-sub">
              Sağ üstteki butona tıklayarak soru sorabilirsin.
            </p>
          </div>
        ) : (
          <div className="os-grid">
            {filtreliSorular.map((soru) => (
              <div
                key={soru._id}
                className="os-card"
                onClick={() => setSoruDetayModal(soru)}
              >
                {/* Görsel 
                <div className="os-card-img-wrap">
                  {soru.imageUrl ? (
                    <img
                      src={`data:image/jpeg;base64,${soru.imageUrl}`}
                      alt="Soru görseli"
                      className="os-card-img"
                    />
                  ) : (
                    <div className="os-card-no-img">
                      <FiImage size={36} />
                    </div>
                  )}
                  <StatusBadge status={soru.status} />
                </div>

                {/* Alt bilgi *
                <div className="os-card-footer">
                  <span className="os-card-ders">{soru.ders}</span>
                  <span className="os-card-tarih">
                    {formatDate(soru.createdAt)}
                  </span>
                </div>

                {/* Cevap varsa göster *
                {soru.status === "answered" && soru.answer?.text && (
                  <div className="os-card-answer-preview">
                    <FiCheckCircle size={12} />
                    <span>{soru.answer.text.slice(0, 60)}...</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hidden inputs *
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={dosyadanSec}
        style={{ display: "none" }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={kameradanCek}
        style={{ display: "none" }}
      />

      {/* ── Fotoğraf Seçim Modalı ─────────────────────────────────── 
      {secimModal && (
        <div className="os-modal-overlay" onClick={() => setSecimModal(false)}>
          <div className="os-secim-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="os-modal-close"
              onClick={() => setSecimModal(false)}
            >
              <FiX size={20} />
            </button>
            <h2 className="os-modal-title">Soru Nasıl Eklensin?</h2>
            <p className="os-modal-sub">
              Derse göre: <strong>{dersFilter}</strong>
            </p>

            <div className="os-secim-grid">
              <button
                className="os-secim-btn camera"
                onClick={() => cameraInputRef.current?.click()}
              >
                <FiCamera size={36} />
                <span>Kamera</span>
                <p>Fotoğraf çek</p>
              </button>
              <button
                className="os-secim-btn file"
                onClick={() => fileInputRef.current?.click()}
              >
                <FiFolder size={36} />
                <span>Galeri</span>
                <p>Dosyadan seç</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Soru Gönderim Sonuç Modalı ───────────────────────────── *
      {resultModal && (
        <div className="os-modal-overlay" onClick={() => setResultModal(null)}>
          <div className="os-result-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="os-modal-close"
              onClick={() => setResultModal(null)}
            >
              <FiX size={20} />
            </button>

            {resultModal.status === "sent_to_teacher" && (
              <div className="os-result sent">
                <div className="os-result-icon sent">
                  <FiSend size={32} />
                </div>
                <h2>Soru Öğretmene İletildi!</h2>
                <p>Cevaplandığında sana bildirim gelecek.</p>
              </div>
            )}

            {resultModal.status === "duplicate_pending" && (
              <div className="os-result queue">
                <div className="os-result-icon queue">
                  <FiClock size={32} />
                </div>
                <h2>Bu Soru Zaten Kuyrukta</h2>
                <p>
                  Öğretmen daha önce sorulan aynı soruya bakıyor. Cevap gelince
                  seni de haberdar edeceğiz.
                </p>
              </div>
            )}

            {resultModal.status === "duplicate_answered" && (
              <div className="os-result answered">
                <div className="os-result-icon answered">
                  <FiCheckCircle size={32} />
                </div>
                <h2>Bu Soru Daha Önce Çözüldü!</h2>
                <div className="os-result-answer">
                  <p className="os-result-answer-label">Cevap:</p>
                  <p>{resultModal.answer?.text}</p>
                </div>
              </div>
            )}

            <button
              className="os-result-close-btn"
              onClick={() => setResultModal(null)}
            >
              Tamam
            </button>
          </div>
        </div>
      )}

      {/* ── Soru Detay Modalı ─────────────────────────────────────── *
      {soruDetayModal && (
        <div
          className="os-modal-overlay"
          onClick={() => setSoruDetayModal(null)}
        >
          <div className="os-detay-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="os-modal-close"
              onClick={() => setSoruDetayModal(null)}
            >
              <FiX size={20} />
            </button>

            <div className="os-detay-header">
              <StatusBadge status={soruDetayModal.status} />
              <span className="os-detay-ders">{soruDetayModal.ders}</span>
              <span className="os-detay-tarih">
                {formatDate(soruDetayModal.createdAt)}
              </span>
            </div>

            {soruDetayModal.imageUrl && (
              <img
                src={`data:image/jpeg;base64,${soruDetayModal.imageUrl}`}
                alt="Soru"
                className="os-detay-img"
              />
            )}

            {soruDetayModal.extractedText && (
              <div className="os-detay-text">
                <p className="os-detay-text-label">Okunan metin:</p>
                <p>{soruDetayModal.extractedText}</p>
              </div>
            )}

            {soruDetayModal.status === "answered" &&
              soruDetayModal.answer?.text && (
                <div className="os-detay-answer">
                  <div className="os-detay-answer-header">
                    <FiCheckCircle size={16} /> Öğretmen Cevabı
                  </div>
                  <p>{soruDetayModal.answer.text}</p>
                  {soruDetayModal.answer.imageUrl && (
                    <img
                      src={soruDetayModal.answer.imageUrl}
                      alt="Cevap görseli"
                      className="os-detay-answer-img"
                    />
                  )}
                </div>
              )}

            {soruDetayModal.status === "pending" && (
              <div className="os-detay-pending">
                <FiClock size={16} /> Öğretmen cevabı bekleniyor...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OgrenciSorular;
 */
import { useState, useEffect, useRef } from "react";
import {
  FiCamera,
  FiFolder,
  FiX,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiSend,
  FiBook,
  FiImage,
  FiUser,
  FiChevronRight,
  FiArrowLeft,
  FiThumbsUp,
  FiThumbsDown,
} from "react-icons/fi";
import "./OgrenciSorular.scss";
/* import "./feedback.scss";
 */
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const DERSLER = [
  "Matematik",
  "Geometri",
  "Fizik",
  "Kimya",
  "Biyoloji",
  "Türkçe",
  "Edebiyat",
  "Tarih",
  "Coğrafya",
  "Felsefe",
  "İngilizce",
];

const formatDate = (d) =>
  new Date(d).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = {
    pending: { label: "Bekliyor", icon: <FiClock size={11} />, cls: "pending" },
    answered: {
      label: "Cevaplandı",
      icon: <FiCheckCircle size={11} />,
      cls: "answered",
    },
    verified: {
      label: "Doğrulandı",
      icon: <FiCheckCircle size={11} />,
      cls: "answered",
    },
    disputed: {
      label: "İtirazda",
      icon: <FiAlertCircle size={11} />,
      cls: "queue",
    },
    duplicate_pending: {
      label: "Kuyrukta",
      icon: <FiAlertCircle size={11} />,
      cls: "queue",
    },
    duplicate_answered: {
      label: "Cevaplandı",
      icon: <FiCheckCircle size={11} />,
      cls: "answered",
    },
  };
  const c = cfg[status] || cfg.pending;
  return (
    <span className={`os-badge ${c.cls}`}>
      {c.icon} {c.label}
    </span>
  );
};

// ─── Feedback Bölümü (Detay Modal içinde kullanılır) ─────────────────────────
const FeedbackBolumu = ({ soru, onFeedback }) => {
  const [sending, setSending] = useState(false);
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);

  if (soru.status === "verified") {
    return (
      <div className="os-feedback-done correct">
        <FiCheckCircle size={15} /> Sen bu cevabı doğruladın
      </div>
    );
  }
  if (soru.status === "disputed") {
    return (
      <div className="os-feedback-done disputed">
        <FiAlertCircle size={15} /> Hatalı bildirdin — öğretmen inceliyor
      </div>
    );
  }
  if (soru.status !== "answered") return null;

  const sendFeedback = async (type) => {
    setSending(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/questions_db/${soru._id}/feedback`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type, note: note.trim() }),
      });
      const data = await res.json();
      if (data.success) onFeedback(soru._id, type, note.trim());
      else alert(data.message || "Geri bildirim gönderilemedi.");
    } catch {
      alert("Bağlantı hatası.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="os-feedback-area">
      <p className="os-feedback-label">Bu çözüm doğru mu?</p>
      {!showNote ? (
        <div className="os-feedback-btns">
          <button
            className="os-feedback-btn correct"
            disabled={sending}
            onClick={() => sendFeedback("correct")}
          >
            <FiThumbsUp size={16} /> Evet, doğru
          </button>
          <button
            className="os-feedback-btn wrong"
            disabled={sending}
            onClick={() => setShowNote(true)}
          >
            <FiThumbsDown size={16} /> Hayır, hatalı
          </button>
        </div>
      ) : (
        <div className="os-feedback-note-area">
          <textarea
            className="os-feedback-note-input"
            placeholder="Neyin yanlış olduğunu belirt (opsiyonel)..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
          />
          <div className="os-feedback-note-btns">
            <button
              className="os-feedback-btn wrong"
              disabled={sending}
              onClick={() => sendFeedback("wrong")}
            >
              {sending ? (
                "Gönderiliyor..."
              ) : (
                <>
                  <FiThumbsDown size={14} /> Hatalı Olarak Bildir
                </>
              )}
            </button>
            <button
              className="os-feedback-btn cancel"
              onClick={() => {
                setShowNote(false);
                setNote("");
              }}
            >
              İptal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Adım 1: Ders Seç ────────────────────────────────────────────────────────
const DersSecModal = ({ onSelect, onClose }) => (
  <div className="os-modal-overlay" onClick={onClose}>
    <div className="os-flow-modal" onClick={(e) => e.stopPropagation()}>
      <button className="os-modal-close" onClick={onClose}>
        <FiX size={20} />
      </button>
      <h2 className="os-modal-title">Hangi Dersten Soru Soruyorsun?</h2>
      <div className="os-ders-grid">
        {DERSLER.map((d) => (
          <button key={d} className="os-ders-item" onClick={() => onSelect(d)}>
            <FiBook size={20} />
            <span>{d}</span>
            <FiChevronRight size={14} className="os-ders-arrow" />
          </button>
        ))}
      </div>
    </div>
  </div>
);

// ─── Adım 2: Öğretmen Seç ────────────────────────────────────────────────────
const OgretmenSecModal = ({
  ders,
  teachers,
  loading,
  onSelect,
  onBack,
  onClose,
}) => (
  <div className="os-modal-overlay" onClick={onClose}>
    <div className="os-flow-modal" onClick={(e) => e.stopPropagation()}>
      <div className="os-modal-header">
        <button className="os-back-btn" onClick={onBack}>
          <FiArrowLeft size={18} />
        </button>
        <h2 className="os-modal-title">{ders} Öğretmeni Seç</h2>
        <button className="os-modal-close" onClick={onClose}>
          <FiX size={20} />
        </button>
      </div>
      {loading ? (
        <div className="os-teacher-loading">
          <div className="os-spinner" />
          <p>Öğretmenler yükleniyor...</p>
        </div>
      ) : teachers.length === 0 ? (
        <div className="os-teacher-empty">
          <FiUser size={40} />
          <p>Bu derse atanmış öğretmen bulunamadı.</p>
        </div>
      ) : (
        <div className="os-teacher-list">
          {teachers.map((t) => (
            <button
              key={t._id}
              className="os-teacher-item"
              onClick={() => onSelect(t)}
            >
              <div className="os-teacher-avatar">
                {t.name.charAt(0).toUpperCase()}
              </div>
              <div className="os-teacher-info">
                <span className="os-teacher-name">{t.name}</span>
                <span className="os-teacher-dersler">
                  {t.dersler?.join(", ")}
                </span>
                {t.biyografi && (
                  <span className="os-teacher-bio">{t.biyografi}</span>
                )}
              </div>
              <FiChevronRight size={16} className="os-ders-arrow" />
            </button>
          ))}
        </div>
      )}
    </div>
  </div>
);

// ─── Adım 3: Fotoğraf Seç ────────────────────────────────────────────────────
const FotoSecModal = ({
  ders,
  teacher,
  onCamera,
  onFile,
  onBack,
  onClose,
  uploading,
}) => (
  <div className="os-modal-overlay" onClick={onClose}>
    <div className="os-flow-modal" onClick={(e) => e.stopPropagation()}>
      <div className="os-modal-header">
        <button className="os-back-btn" onClick={onBack}>
          <FiArrowLeft size={18} />
        </button>
        <h2 className="os-modal-title">Soruyu Nasıl Ekleyeceksin?</h2>
        <button className="os-modal-close" onClick={onClose}>
          <FiX size={20} />
        </button>
      </div>
      <div className="os-flow-summary">
        <span className="os-summary-chip ders">{ders}</span>
        <FiChevronRight size={13} />
        <div className="os-summary-teacher">
          <div className="os-summary-avatar">{teacher.name.charAt(0)}</div>
          <span>{teacher.name}</span>
        </div>
      </div>
      <div className="os-secim-grid">
        <button
          className="os-secim-btn camera"
          onClick={onCamera}
          disabled={uploading}
        >
          <FiCamera size={36} />
          <span>Kamera</span>
          <p>Fotoğraf çek</p>
        </button>
        <button
          className="os-secim-btn file"
          onClick={onFile}
          disabled={uploading}
        >
          <FiFolder size={36} />
          <span>Galeri</span>
          <p>Dosyadan seç</p>
        </button>
      </div>
      {uploading && (
        <div className="os-uploading-bar">
          <div className="os-spinner" />
          <span>Soru gönderiliyor, lütfen bekle...</span>
        </div>
      )}
    </div>
  </div>
);

// ─── Sonuç Modalı ─────────────────────────────────────────────────────────────
const ResultModal = ({ result, onClose }) => {
  const cfg = {
    sent_to_teacher: {
      icon: <FiSend size={32} />,
      cls: "sent",
      title: "Soru Öğretmene İletildi!",
      sub: "Cevaplandığında bildirim alacaksın.",
    },
    duplicate_pending: {
      icon: <FiClock size={32} />,
      cls: "queue",
      title: "Bu Soru Kuyrukta!",
      sub: "Öğretmen aynı soruya bakıyor.",
    },
    duplicate_answered: {
      icon: <FiCheckCircle size={32} />,
      cls: "answered",
      title: "Bu Soru Daha Önce Çözüldü!",
      sub: "",
    },
  };
  const c = cfg[result.status] || cfg.sent_to_teacher;
  return (
    <div className="os-modal-overlay" onClick={onClose}>
      <div className="os-result-modal" onClick={(e) => e.stopPropagation()}>
        <button className="os-modal-close" onClick={onClose}>
          <FiX size={20} />
        </button>
        <div className={`os-result-icon ${c.cls}`}>{c.icon}</div>
        <h2>{c.title}</h2>
        {c.sub && <p>{c.sub}</p>}
        {result.status === "duplicate_answered" && result.answer && (
          <div className="os-result-answer">
            <p className="os-result-answer-label">Cevap</p>
            {result.answer.text && <p>{result.answer.text}</p>}
            {result.answer.imageUrl && (
              <img
                src={`data:image/jpeg;base64,${result.answer.imageUrl}`}
                alt="Cevap görseli"
                className="os-result-answer-img"
              />
            )}
          </div>
        )}
        <button className="os-result-btn" onClick={onClose}>
          Tamam
        </button>
      </div>
    </div>
  );
};

// ─── Detay Modalı (feedback butonları dahil) ──────────────────────────────────
const DetayModal = ({ soru, onClose, onFeedback }) => (
  <div className="os-modal-overlay" onClick={onClose}>
    <div className="os-detay-modal" onClick={(e) => e.stopPropagation()}>
      <button className="os-modal-close" onClick={onClose}>
        <FiX size={20} />
      </button>

      <div className="os-detay-header">
        <StatusBadge status={soru.status} />
        <span className="os-detay-ders">{soru.ders}</span>
        <span className="os-detay-tarih">{formatDate(soru.createdAt)}</span>
      </div>

      {/* Soru görseli — OCR metni gösterilmiyor */}
      {soru.imageUrl && (
        <img
          src={`data:image/jpeg;base64,${soru.imageUrl}`}
          alt="Soru"
          className="os-detay-img"
        />
      )}

      {/* Cevap varsa göster */}
      {["answered", "verified", "disputed"].includes(soru.status) ? (
        <>
          <div className="os-detay-answer">
            <div className="os-detay-answer-head">
              <FiCheckCircle size={15} /> Öğretmen Cevabı
            </div>
            {soru.answer?.text && <p>{soru.answer.text}</p>}
            {soru.answer?.imageUrl && (
              <img
                src={`data:image/jpeg;base64,${soru.answer.imageUrl}`}
                alt="Cevap"
                className="os-detay-answer-img"
              />
            )}
            {soru.answer?.answeredAt && (
              <span className="os-detay-answer-date">
                {formatDate(soru.answer.answeredAt)}
              </span>
            )}
          </div>

          {/* DOĞRULAMA BUTONLARI */}
          <FeedbackBolumu soru={soru} onFeedback={onFeedback} />
        </>
      ) : (
        <div className="os-detay-pending">
          <FiClock size={15} /> Öğretmen cevabı bekleniyor...
        </div>
      )}
    </div>
  </div>
);

// ─── ANA BİLEŞEN ──────────────────────────────────────────────────────────────
const OgrenciSorular = () => {
  const [sorular, setSorular] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [aktifTab, setAktifTab] = useState("hepsi");
  const [flowAdim, setFlowAdim] = useState(null);
  const [secilenDers, setSecilenDers] = useState(null);
  const [secilenOgretmen, setSecilenOgretmen] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [resultModal, setResultModal] = useState(null);
  const [detayModal, setDetayModal] = useState(null);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  useEffect(() => {
    loadSorular();
  }, []);

  const loadSorular = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/questions_db/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setSorular(data.data || []);
    } catch {
      setSorular([]);
    } finally {
      setLoading(false);
    }
  };

  // ─── Feedback handler — component içinde ──────────────────────────────────
  const handleFeedback = (soruId, type) => {
    const yeniStatus = type === "correct" ? "verified" : "disputed";
    setSorular((prev) =>
      prev.map((s) => (s._id === soruId ? { ...s, status: yeniStatus } : s)),
    );
    // Detay modalındaki soruyu da güncelle
    setDetayModal((prev) =>
      prev && prev._id === soruId ? { ...prev, status: yeniStatus } : prev,
    );
  };

  const handleDersSelect = async (ders) => {
    setSecilenDers(ders);
    setFlowAdim("ogretmen");
    setTeacherLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_URL}/questions_db/teachers?ders=${encodeURIComponent(ders)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      setTeachers(data.success ? data.data : []);
    } catch {
      setTeachers([]);
    } finally {
      setTeacherLoading(false);
    }
  };

  const handleOgretmenSelect = (t) => {
    setSecilenOgretmen(t);
    setFlowAdim("foto");
  };

  const closeFlow = () => {
    setFlowAdim(null);
    setSecilenDers(null);
    setSecilenOgretmen(null);
    setTeachers([]);
  };

  const resizeImage = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const MAX = 1200;
          let w = img.width,
            h = img.height;
          if (w > MAX) {
            h = (h * MAX) / w;
            w = MAX;
          }
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          canvas.getContext("2d").drawImage(img, 0, 0, w, h);
          canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.85);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });

  const soruGonder = async (file) => {
    if (!file || !secilenDers || !secilenOgretmen) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("Dosya 10MB'dan büyük olamaz!");
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("Lütfen bir görsel seçin.");
      return;
    }

    try {
      setUploading(true);
      const blob = await resizeImage(file);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("image", blob, "soru.jpg");
      formData.append("ders", secilenDers);
      formData.append("teacherId", secilenOgretmen._id);

      const res = await fetch(`${API_URL}/questions_db/ask`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message);

      closeFlow();
      setResultModal(result);
      await loadSorular();
    } catch (err) {
      alert("❌ " + (err.message || "Bir hata oluştu"));
    } finally {
      setUploading(false);
    }
  };

  const dosyadanSec = (e) => {
    soruGonder(e.target.files[0]);
    e.target.value = "";
  };
  const kameradanCek = (e) => {
    soruGonder(e.target.files[0]);
    e.target.value = "";
  };

  // Tab filtreleme — verified ve disputed de "cevaplanan" sayılır
  const filtreliSorular = sorular.filter((s) => {
    if (aktifTab === "bekleyen") return s.status === "pending";
    if (aktifTab === "cevaplanan")
      return ["answered", "verified", "disputed"].includes(s.status);
    return true;
  });

  const cevaplananSayi = sorular.filter((s) =>
    ["answered", "verified", "disputed"].includes(s.status),
  ).length;

  if (loading)
    return (
      <div className="os-container">
        <div className="os-loading">
          <div className="os-spinner" />
          <p>Yükleniyor...</p>
        </div>
      </div>
    );

  return (
    <div className="os-container">
      <div className="os-content">
        {/* Header */}
        <div className="os-header">
          <div>
            <h1 className="os-title">Sorularım</h1>
            <p className="os-subtitle">
              {sorular.length} soru · {cevaplananSayi} cevaplandı
            </p>
          </div>
          <button
            className="os-yeni-btn"
            onClick={() => setFlowAdim("ders")}
            disabled={uploading}
          >
            <FiSend size={16} /> Soru Sor
          </button>
        </div>

        {/* Tabs */}
        <div className="os-tabs">
          {[
            { key: "hepsi", label: "Tümü", count: sorular.length },
            {
              key: "bekleyen",
              label: "Bekleyen",
              count: sorular.filter((s) => s.status === "pending").length,
            },
            { key: "cevaplanan", label: "Cevaplanan", count: cevaplananSayi },
          ].map((t) => (
            <button
              key={t.key}
              className={`os-tab ${aktifTab === t.key ? "active" : ""}`}
              onClick={() => setAktifTab(t.key)}
            >
              {t.label}
              {t.count > 0 && <span className="os-tab-badge">{t.count}</span>}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtreliSorular.length === 0 ? (
          <div className="os-empty">
            <FiBook size={48} className="os-empty-icon" />
            <p className="os-empty-title">Henüz soru yok</p>
            <p className="os-empty-sub">
              Sağ üstteki butona tıklayarak soru sorabilirsin.
            </p>
          </div>
        ) : (
          <div className="os-grid">
            {filtreliSorular.map((soru) => (
              <div
                key={soru._id}
                className="os-card"
                onClick={() => setDetayModal(soru)}
              >
                <div className="os-card-img-wrap">
                  {soru.imageUrl ? (
                    <img
                      src={`data:image/jpeg;base64,${soru.imageUrl}`}
                      alt=""
                      className="os-card-img"
                    />
                  ) : (
                    <div className="os-card-no-img">
                      <FiImage size={32} />
                    </div>
                  )}
                  <StatusBadge status={soru.status} />
                </div>
                <div className="os-card-footer">
                  <span className="os-card-ders">{soru.ders}</span>
                  <span className="os-card-tarih">
                    {formatDate(soru.createdAt)}
                  </span>
                </div>
                {["answered", "verified", "disputed"].includes(soru.status) &&
                  (soru.answer?.text || soru.answer?.imageUrl) && (
                    <div className="os-card-answer-preview">
                      <FiCheckCircle size={11} />
                      <span>
                        {soru.answer.text?.slice(0, 55) ||
                          "Çözüm fotoğrafı mevcut"}
                        ...
                      </span>
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hidden inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={dosyadanSec}
        style={{ display: "none" }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={kameradanCek}
        style={{ display: "none" }}
      />

      {/* Flow Modals */}
      {flowAdim === "ders" && (
        <DersSecModal onSelect={handleDersSelect} onClose={closeFlow} />
      )}
      {flowAdim === "ogretmen" && (
        <OgretmenSecModal
          ders={secilenDers}
          teachers={teachers}
          loading={teacherLoading}
          onSelect={handleOgretmenSelect}
          onBack={() => setFlowAdim("ders")}
          onClose={closeFlow}
        />
      )}
      {flowAdim === "foto" && (
        <FotoSecModal
          ders={secilenDers}
          teacher={secilenOgretmen}
          onCamera={() => cameraInputRef.current?.click()}
          onFile={() => fileInputRef.current?.click()}
          onBack={() => setFlowAdim("ogretmen")}
          onClose={closeFlow}
          uploading={uploading}
        />
      )}

      {resultModal && (
        <ResultModal
          result={resultModal}
          onClose={() => setResultModal(null)}
        />
      )}

      {detayModal && (
        <DetayModal
          soru={detayModal}
          onClose={() => setDetayModal(null)}
          onFeedback={handleFeedback}
        />
      )}
    </div>
  );
};

export default OgrenciSorular;

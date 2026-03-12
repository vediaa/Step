/* import { useState, useEffect, useRef } from "react";
import Card from "../../components/Card/Card";
import { FiCamera, FiImage, FiEye, FiCheckCircle, FiX } from "react-icons/fi";
import "./Questions.css";

const API_URL = "http://localhost:5001/api"; //process.env.REACT_APP_API_URL ||

const SoruYonetimi = () => {
  const [sorular, setSorular] = useState([]);
  const [modalGorunur, setModalGorunur] = useState(false);
  const [mevcutSoru, setMevcutSoru] = useState(null);
  const [aktifKategori, setAktifKategori] = useState("cozulmemis");
  const [buyukSoruGorunur, setBuyukSoruGorunur] = useState(false);
  const [seciliSoru, setSeciliSoru] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadSorular();
  }, []);

  // API'den soruları yükle
  const loadSorular = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Lütfen giriş yapın");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/questions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (result.success) {
        setSorular(result.data);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Sorular yüklenirken hata:", error);
      setError(error.message || "Sorular yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  // Resim yükleme ve resize
  const resizeImage = (file, maxWidth = 1200) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.85));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Fotoğraf seç ve yükle
  const fotoSec = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Dosya boyutu 5MB'dan küçük olmalıdır!");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Lütfen bir resim dosyası seçin!");
      return;
    }

    try {
      setUploading(true);
      const base64Image = await resizeImage(file);
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/questions/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          foto: base64Image,
          text: `Fotoğraflı Soru (${new Date().toLocaleString("tr-TR")})`,
          kategori: "Genel",
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSorular([result.data, ...sorular]);
        alert("✅ Soru başarıyla eklendi!");
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Fotoğraf yükleme hatası:", error);
      alert("❌ " + (error.message || "Fotoğraf yüklenirken bir hata oluştu"));
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  // Soruyu kategorize et
  const soruKategorizeEt = async (cozuldu, zorluk) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/questions/${mevcutSoru._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cozuldu, zorluk }),
      });

      const result = await response.json();

      if (result.success) {
        setSorular((prev) =>
          prev.map((s) => (s._id === mevcutSoru._id ? result.data : s))
        );
        setModalGorunur(false);
        setAktifKategori(cozuldu ? zorluk : "cozulmemis");
        alert("✅ Soru durumu güncellendi!");
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Kategorize etme hatası:", error);
      alert("❌ " + (error.message || "Bir hata oluştu"));
    }
  };

  // Soru sil
  const soruSil = async (id) => {
    if (!window.confirm("Bu soruyu silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/questions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();

      if (result.success) {
        setSorular((prev) => prev.filter((soru) => soru._id !== id));
        alert("✅ Soru başarıyla silindi");
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Silme hatası:", error);
      alert("❌ " + (error.message || "Soru silinirken bir hata oluştu"));
    }
  };

  // Kategorilere göre filtreleme
  const filtreliSorular = sorular.filter((soru) => {
    if (aktifKategori === "cozulmemis") return !soru.cozuldu;
    if (aktifKategori === "kolay") return soru.zorluk === "kolay";
    if (aktifKategori === "orta") return soru.zorluk === "orta";
    if (aktifKategori === "zor") return soru.zorluk === "zor";
    return true;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("tr-TR");
  };

  if (loading) {
    return (
      <div className="soru-yonetimi-container">
        <p className="loading-text">Sorular yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="soru-yonetimi-container">
        <p className="loading-text" style={{ color: "var(--dark-red)" }}>
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="soru-yonetimi-container">
      <div className="soru-yonetimi-content">
        
        <div className="header">
          <h1 className="page-title">Sorularım</h1>
          <button
            className="foto-ekle-button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <FiCamera className="button-icon" />
            <span>{uploading ? "Yükleniyor..." : "Yeni Soru Ekle"}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={fotoSec}
            style={{ display: "none" }}
          />
        </div>

        {/* Google Photos Tarzı Grid }
        <div className="sorular-grid">
          {filtreliSorular.length === 0 ? (
            <div className="bos-liste-wrapper">
              <Card className="bos-liste-card">
                <div className="bos-liste-container">
                  <FiImage className="bos_liste_icon" size={50} />
                  <p className="bos-liste-text">
                    {aktifKategori === "cozulmemis"
                      ? "Henüz çözülmemiş soru yok"
                      : "Bu kategoride soru bulunamadı"}
                  </p>
                </div>
              </Card>
            </div>
          ) : (
            filtreliSorular.map((soru) => (
              <div key={soru._id} className="grid-item">
                {/* Fotoğraf Container }
                <div
                  className="grid-foto-container"
                  onClick={() => {
                    setSeciliSoru(soru);
                    setBuyukSoruGorunur(true);
                  }}
                >
                  {soru.foto ? (
                    <img
                      src={soru.foto}
                      alt="Soru"
                      className="grid-foto"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="no-image-placeholder">
                      <FiImage size={40} />
                    </div>
                  )}

                  {/* Hover Overlay }
                  <div className="grid-overlay">
                    <p className="grid-overlay-text">{soru.text}</p>
                  </div>

                  {/* Durum Badge }
                  {soru.cozuldu && (
                    <div className={`status-badge ${soru.zorluk}`}>
                      <FiCheckCircle size={14} />
                      <span>{soru.zorluk}</span>
                    </div>
                  )}
                </div>

                {/* Alt Bilgiler ve Aksiyonlar }
                <div className="grid-info">
                  <p className="grid-tarih">
                    {formatDate(soru.createdAt || soru.tarih)}
                  </p>
                  <div className="grid-actions">
                    <button
                      className="grid-action-btn edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMevcutSoru(soru);
                        setModalGorunur(true);
                      }}
                      title="Düzenle"
                    >
                      ✏️
                    </button>
                    <button
                      className="grid-action-btn delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        soruSil(soru._id);
                      }}
                      title="Sil"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Alt Navigasyon }
        <div className="tab-bar">
          <button
            className={`tab-item ${
              aktifKategori === "cozulmemis" ? "active" : ""
            }`}
            onClick={() => setAktifKategori("cozulmemis")}
          >
            <FiEye className="tab-icon" />
            <span className="tab-text">Çözülmemiş</span>
            <span className="badge">
              {sorular.filter((s) => !s.cozuldu).length}
            </span>
          </button>

          <button
            className={`tab-item ${aktifKategori === "kolay" ? "active" : ""}`}
            onClick={() => setAktifKategori("kolay")}
          >
            <FiCheckCircle className="tab-icon kolay" />
            <span className="tab-text">Kolay</span>
          </button>

          <button
            className={`tab-item ${aktifKategori === "orta" ? "active" : ""}`}
            onClick={() => setAktifKategori("orta")}
          >
            <FiCheckCircle className="tab-icon orta" />
            <span className="tab-text">Orta</span>
          </button>

          <button
            className={`tab-item ${aktifKategori === "zor" ? "active" : ""}`}
            onClick={() => setAktifKategori("zor")}
          >
            <FiCheckCircle className="tab-icon zor" />
            <span className="tab-text">Zor</span>
          </button>
        </div>
      </div>

      {/* Kategorize Etme Modal }
      {modalGorunur && (
        <div className="modal-overlay" onClick={() => setModalGorunur(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Soru Durumunu Güncelle</h2>

            {mevcutSoru?.foto && (
              <img src={mevcutSoru.foto} alt="Soru" className="modal-foto" />
            )}

            <p className="modal-soru-text">{mevcutSoru?.text}</p>

            <div className="modal-buttons">
              <button
                className="modal-button kolay"
                onClick={() => soruKategorizeEt(true, "kolay")}
              >
                <span>✓</span>
                <span>Kolay - Çözüldü</span>
              </button>

              <button
                className="modal-button orta"
                onClick={() => soruKategorizeEt(true, "orta")}
              >
                <span>✓</span>
                <span>Orta - Çözüldü</span>
              </button>

              <button
                className="modal-button zor"
                onClick={() => soruKategorizeEt(true, "zor")}
              >
                <span>✓</span>
                <span>Zor - Çözüldü</span>
              </button>

              <button
                className="modal-button cozulmedi"
                onClick={() => soruKategorizeEt(false, null)}
              >
                <span>✕</span>
                <span>Çözülmedi</span>
              </button>
            </div>

            <button
              className="iptal-button"
              onClick={() => setModalGorunur(false)}
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Büyük Soru Görüntüleme Modal }
      {buyukSoruGorunur && (
        <div
          className="buyuk-modal-overlay"
          onClick={() => setBuyukSoruGorunur(false)}
        >
          <div
            className="buyuk-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            {seciliSoru?.foto && (
              <img src={seciliSoru.foto} alt="Soru" className="buyuk-foto" />
            )}
            <p className="buyuk-soru-text">{seciliSoru?.text}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SoruYonetimi;
 */

import { useState, useEffect, useRef } from "react";
import Card from "../../components/Card/Card";
import {
  FiCamera,
  FiImage,
  FiEye,
  FiCheckCircle,
  FiX,
  FiFolder,
} from "react-icons/fi";
import "./Questions.scss";

const API_URL = "http://localhost:5001/api"; //process.env.REACT_APP_API_URL ||

const SoruYonetimi = () => {
  const [sorular, setSorular] = useState([]);
  const [modalGorunur, setModalGorunur] = useState(false);
  const [mevcutSoru, setMevcutSoru] = useState(null);
  const [aktifKategori, setAktifKategori] = useState("cozulmemis");
  const [buyukSoruGorunur, setBuyukSoruGorunur] = useState(false);
  const [seciliSoru, setSeciliSoru] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [secimModalGorunur, setSecimModalGorunur] = useState(false);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  useEffect(() => {
    loadSorular();
  }, []);

  // API'den soruları yükle
  const loadSorular = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Lütfen giriş yapın");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/questions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (result.success) {
        setSorular(result.data);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Sorular yüklenirken hata:", error);
      setError(error.message || "Sorular yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  // Resim yükleme ve resize
  const resizeImage = (file, maxWidth = 1200) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.85));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Fotoğraf işleme fonksiyonu (hem dosya hem kamera için)
  const fotoIsle = async (file) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Dosya boyutu 5MB'dan küçük olmalıdır!");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Lütfen bir resim dosyası seçin!");
      return;
    }

    try {
      setUploading(true);
      const base64Image = await resizeImage(file);
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/questions/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          foto: base64Image,
          text: `Fotoğraflı Soru (${new Date().toLocaleString("tr-TR")})`,
          kategori: "Genel",
        }),
      });

      const result = await response.json();

      if (result.success) {
        // DÜZELTME: Önceki state'i koruyarak yeni soruyu ekliyoruz
        setSorular((prevSorular) => [result.data, ...prevSorular]);
        alert("✅ Soru başarıyla eklendi!");
        setSecimModalGorunur(false);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Fotoğraf yükleme hatası:", error);
      alert("❌ " + (error.message || "Fotoğraf yüklenirken bir hata oluştu"));
    } finally {
      setUploading(false);
    }
  };

  // Dosya seçimi
  const dosyadanSec = (event) => {
    const file = event.target.files[0];
    if (file) {
      fotoIsle(file);
    }
    // Input'u temizle
    event.target.value = "";
  };

  // Kamera ile çekim
  const kameradanCek = (event) => {
    const file = event.target.files[0];
    if (file) {
      fotoIsle(file);
    }
    // Input'u temizle
    event.target.value = "";
  };

  // Soruyu kategorize et
  const soruKategorizeEt = async (cozuldu, zorluk) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/questions/${mevcutSoru._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cozuldu, zorluk }),
      });

      const result = await response.json();

      if (result.success) {
        setSorular((prev) =>
          prev.map((s) => (s._id === mevcutSoru._id ? result.data : s)),
        );
        setModalGorunur(false);
        setAktifKategori(cozuldu ? zorluk : "cozulmemis");
        alert("✅ Soru durumu güncellendi!");
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Kategorize etme hatası:", error);
      alert("❌ " + (error.message || "Bir hata oluştu"));
    }
  };

  // Soru sil
  const soruSil = async (id) => {
    if (!window.confirm("Bu soruyu silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/questions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();

      if (result.success) {
        setSorular((prev) => prev.filter((soru) => soru._id !== id));
        alert("✅ Soru başarıyla silindi");
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Silme hatası:", error);
      alert("❌ " + (error.message || "Soru silinirken bir hata oluştu"));
    }
  };

  // Kategorilere göre filtreleme
  const filtreliSorular = sorular.filter((soru) => {
    if (aktifKategori === "cozulmemis") return !soru.cozuldu;
    if (aktifKategori === "kolay") return soru.zorluk === "kolay";
    if (aktifKategori === "orta") return soru.zorluk === "orta";
    if (aktifKategori === "zor") return soru.zorluk === "zor";
    return true;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("tr-TR");
  };

  if (loading) {
    return (
      <div className="soru-yonetimi-container">
        <p className="loading-text">Sorular yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="soru-yonetimi-container">
        <p className="loading-text" style={{ color: "var(--dark-red)" }}>
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="soru-yonetimi-container">
      <div className="soru-yonetimi-content">
        {/* Header */}
        <div className="header">
          <h1 className="page-title">Sorularım</h1>
          <button
            className="foto-ekle-button"
            onClick={() => setSecimModalGorunur(true)}
            disabled={uploading}
          >
            <FiCamera className="button-icon" />
            <span>{uploading ? "Yükleniyor..." : "Yeni Soru Ekle"}</span>
          </button>

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
        </div>

        {/* Google Photos Tarzı Grid */}
        <div className="sorular-grid">
          {filtreliSorular.length === 0 ? (
            <div className="bos-liste-wrapper">
              <Card className="bos-liste-card">
                <div className="bos-liste-container">
                  <FiImage className="bos_liste_icon" size={50} />
                  <p className="bos-liste-text">
                    {aktifKategori === "cozulmemis"
                      ? "Henüz çözülmemiş soru yok"
                      : "Bu kategoride soru bulunamadı"}
                  </p>
                </div>
              </Card>
            </div>
          ) : (
            filtreliSorular.map((soru) => (
              <div key={soru._id} className="grid-item">
                {/* Fotoğraf Container */}
                <div
                  className="grid-foto-container"
                  onClick={() => {
                    setSeciliSoru(soru);
                    setBuyukSoruGorunur(true);
                  }}
                >
                  {soru.foto ? (
                    <img
                      src={soru.foto}
                      alt="Soru"
                      className="grid-foto"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="no-image-placeholder">
                      <FiImage size={40} />
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="grid-overlay">
                    <p className="grid-overlay-text">{soru.text}</p>
                  </div>

                  {/* Durum Badge */}
                  {soru.cozuldu && (
                    <div className={`status-badge ${soru.zorluk}`}>
                      <FiCheckCircle size={14} />
                      <span>{soru.zorluk}</span>
                    </div>
                  )}
                </div>

                {/* Alt Bilgiler ve Aksiyonlar */}
                <div className="grid-info">
                  <p className="grid-tarih">
                    {formatDate(soru.createdAt || soru.tarih)}
                  </p>
                  <div className="grid-actions">
                    <button
                      className="grid-action-btn edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMevcutSoru(soru);
                        setModalGorunur(true);
                      }}
                      title="Düzenle"
                    >
                      ✏️
                    </button>
                    <button
                      className="grid-action-btn delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        soruSil(soru._id);
                      }}
                      title="Sil"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Alt Navigasyon */}
        <div className="tab-bar">
          <button
            className={`tab-item ${
              aktifKategori === "cozulmemis" ? "active" : ""
            }`}
            onClick={() => setAktifKategori("cozulmemis")}
          >
            <FiEye className="tab-icon" />
            <span className="tab-text">Çözülmemiş</span>
            <span className="badge">
              {sorular.filter((s) => !s.cozuldu).length}
            </span>
          </button>

          <button
            className={`tab-item ${aktifKategori === "kolay" ? "active" : ""}`}
            onClick={() => setAktifKategori("kolay")}
          >
            <FiCheckCircle className="tab-icon kolay" />
            <span className="tab-text">Kolay</span>
          </button>

          <button
            className={`tab-item ${aktifKategori === "orta" ? "active" : ""}`}
            onClick={() => setAktifKategori("orta")}
          >
            <FiCheckCircle className="tab-icon orta" />
            <span className="tab-text">Orta</span>
          </button>

          <button
            className={`tab-item ${aktifKategori === "zor" ? "active" : ""}`}
            onClick={() => setAktifKategori("zor")}
          >
            <FiCheckCircle className="tab-icon zor" />
            <span className="tab-text">Zor</span>
          </button>
        </div>
      </div>

      {/* Fotoğraf Seçim Modalı (Kamera vs Dosya) */}
      {secimModalGorunur && (
        <div
          className="modal-overlay"
          onClick={() => setSecimModalGorunur(false)}
        >
          <div
            className="secim-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSecimModalGorunur(false)}
            >
              <FiX size={24} />
            </button>

            <h2 className="modal-title">Fotoğraf Nasıl Eklensin?</h2>

            <div className="secim-buttons">
              <button
                className="secim-button camera"
                onClick={() => {
                  cameraInputRef.current?.click();
                }}
                disabled={uploading}
              >
                <FiCamera size={40} />
                <span>Kamera ile Çek</span>
                <p className="secim-desc">Telefonun kamerasını kullan</p>
              </button>

              <button
                className="secim-button file"
                onClick={() => {
                  fileInputRef.current?.click();
                }}
                disabled={uploading}
              >
                <FiFolder size={40} />
                <span>Dosyadan Seç</span>
                <p className="secim-desc">Galeriden veya bilgisayardan</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kategorize Etme Modal */}
      {modalGorunur && (
        <div className="modal-overlay" onClick={() => setModalGorunur(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setModalGorunur(false)}
            >
              <FiX size={24} />
            </button>

            <h2 className="modal-title">Soru Durumunu Güncelle</h2>

            {mevcutSoru?.foto && (
              <img src={mevcutSoru.foto} alt="Soru" className="modal-foto" />
            )}

            <p className="modal-soru-text">{mevcutSoru?.text}</p>

            <div className="modal-buttons">
              <button
                className="modal-button kolay"
                onClick={() => soruKategorizeEt(true, "kolay")}
              >
                <span>✓</span>
                <span>Kolay - Çözüldü</span>
              </button>

              <button
                className="modal-button orta"
                onClick={() => soruKategorizeEt(true, "orta")}
              >
                <span>✓</span>
                <span>Orta - Çözüldü</span>
              </button>

              <button
                className="modal-button zor"
                onClick={() => soruKategorizeEt(true, "zor")}
              >
                <span>✓</span>
                <span>Zor - Çözüldü</span>
              </button>

              <button
                className="modal-button cozulmedi"
                onClick={() => soruKategorizeEt(false, null)}
              >
                <span>✕</span>
                <span>Çözülmedi</span>
              </button>
            </div>

            <button
              className="iptal-button"
              onClick={() => setModalGorunur(false)}
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Büyük Soru Görüntüleme Modal */}
      {buyukSoruGorunur && (
        <div
          className="buyuk-modal-overlay"
          onClick={() => setBuyukSoruGorunur(false)}
        >
          <button
            className="modal-close buyuk"
            onClick={() => setBuyukSoruGorunur(false)}
          >
            <FiX size={28} />
          </button>
          <div
            className="buyuk-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            {seciliSoru?.foto && (
              <img src={seciliSoru.foto} alt="Soru" className="buyuk-foto" />
            )}
            <p className="buyuk-soru-text">{seciliSoru?.text}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SoruYonetimi;

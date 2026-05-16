import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiLock,
  FiBook,
  FiCheckSquare,
  FiSquare,
} from "react-icons/fi";
import Input from "../../components/Input/Input.jsx";
import Button from "../../components/Button/Button.jsx";
import Logo from "../../components/Logo/Logo.jsx";
import "./Register.css";

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

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Adım 1: rol seçimi  |  Adım 2: form doldur
  const [adim, setAdim] = useState(1);
  const [secilenRol, setSecilenRol] = useState(null); // "student" | "teacher"
  const [secilenDersler, setSecilenDersler] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Ders chip toggle
  const dersToggle = (ders) => {
    setSecilenDersler((prev) =>
      prev.includes(ders) ? prev.filter((d) => d !== ders) : [...prev, ders],
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Öğretmense en az 1 ders seçmeli
    if (secilenRol === "teacher" && secilenDersler.length === 0) {
      setError("Lütfen en az 1 ders seçin.");
      return;
    }

    setIsLoading(true);

    try {
      const body = {
        ...formData,
        role: secilenRol,
        dersler: secilenRol === "teacher" ? secilenDersler : [],
      };

      const response = await fetch(`${API_URL}/auth/kayit`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Kayıt başarısız");
      }

      // Token'ı localStorage'a kaydet (mevcut projeyle uyumlu)
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      setSuccess("Kayıt başarılı! Yönlendiriliyorsun...");
      setFormData({ name: "", email: "", password: "" });

      setTimeout(() => {
        navigate("/verify-email");
      }, 1500);
    } catch (err) {
      setError(err.message || "Bir hata oluştu!");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Adım 1: Rol Seçimi ────────────────────────────────────────────────────
  if (adim === 1) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <Logo size="medium" />
              <h1 className="auth-title">Hesap Oluştur</h1>
              <p className="auth-subtitle">Sen kimsin?</p>
            </div>

            <div className="rol-secim">
              <button
                className={`rol-kart ${secilenRol === "student" ? "aktif" : ""}`}
                onClick={() => setSecilenRol("student")}
              >
                <span className="rol-emoji">🎒</span>
                <span className="rol-baslik">Öğrenciyim</span>
                <span className="rol-aciklama">Soru sor, çözüm al</span>
              </button>

              <button
                className={`rol-kart ${secilenRol === "teacher" ? "aktif" : ""}`}
                onClick={() => setSecilenRol("teacher")}
              >
                <span className="rol-emoji">👨‍🏫</span>
                <span className="rol-baslik">Öğretmenim</span>
                <span className="rol-aciklama">Soruları çöz, yardım et</span>
              </button>
            </div>

            {/* Öğretmen ders seçimi */}
            {secilenRol === "teacher" && (
              <div className="ders-secim">
                <p className="ders-secim-baslik">
                  <FiBook size={15} /> Hangi dersleri veriyorsun?
                </p>
                <div className="ders-chips">
                  {DERSLER.map((d) => (
                    <button
                      key={d}
                      className={`ders-chip ${secilenDersler.includes(d) ? "secili" : ""}`}
                      onClick={() => dersToggle(d)}
                    >
                      {secilenDersler.includes(d) ? (
                        <FiCheckSquare size={13} />
                      ) : (
                        <FiSquare size={13} />
                      )}
                      {d}
                    </button>
                  ))}
                </div>
                {secilenDersler.length === 0 && (
                  <p className="ders-uyari">En az 1 ders seçmelisin</p>
                )}
              </div>
            )}

            <Button
              variant="yellow"
              fullWidth
              disabled={
                !secilenRol ||
                (secilenRol === "teacher" && secilenDersler.length === 0)
              }
              onClick={() => setAdim(2)}
            >
              Devam Et →
            </Button>

            <p className="auth-switch">
              Zaten hesabın var mı? <Link to="/login">Giriş Yap</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Adım 2: Bilgi Formu ───────────────────────────────────────────────────
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Logo size="medium" />
            <h1 className="auth-title">Hesap Oluştur</h1>

            {/* Özet: seçilen rol */}
            <div className="secim-ozet">
              <span className="ozet-rol">
                {secilenRol === "teacher" ? "👨‍🏫 Öğretmen" : "🎒 Öğrenci"}
              </span>
              {secilenRol === "teacher" && (
                <span className="ozet-dersler">
                  {secilenDersler.join(", ")}
                </span>
              )}
              <button className="ozet-degistir" onClick={() => setAdim(1)}>
                Değiştir
              </button>
            </div>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <Input
              type="text"
              name="name"
              placeholder="Adınız ve Soyadınız"
              value={formData.name}
              onChange={handleChange}
              icon={<FiUser />}
              required
            />

            <Input
              type="email"
              name="email"
              placeholder="E-mail adresin"
              value={formData.email}
              onChange={handleChange}
              icon={<FiMail />}
              required
            />

            <Input
              type="password"
              name="password"
              placeholder="Şifre (en az 6 karakter)"
              value={formData.password}
              onChange={handleChange}
              icon={<FiLock />}
              required
              minLength={6}
            />

            {error && <div className="auth-error">⚠️ {error}</div>}

            {success && <div className="auth-success">{success}</div>}

            <Button
              type="submit"
              variant="yellow"
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? "Kaydediliyor..." : "Kayıt Ol"}
            </Button>
          </form>

          <div className="auth-divider">
            <span>veya</span>
          </div>

          <p className="auth-switch">
            Zaten hesabın var mı? <Link to="/login">Giriş Yap</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

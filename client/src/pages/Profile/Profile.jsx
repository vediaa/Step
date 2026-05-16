import { useState, useEffect } from "react";
import {
  FiUser,
  FiMail,
  FiLock,
  FiLogOut,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import OtpInput from "../../components/OtpInput/OtpInput";
import { useAuth } from "../../context/AuthContext";
import "./Profile.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const authFetch = (url, options = {}) => {
  const token = localStorage.getItem("token");
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
};

const Profile = () => {
  const { logout, user } = useAuth();

  const [userData, setUserData] = useState({ name: "", email: "", role: "" });
  const [passwords, setPasswords] = useState({
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [otpGonderildi, setOtpGonderildi] = useState(false);
  const [mesaj, setMesaj] = useState({ text: "", type: "" }); // type: "success" | "error"
  const [sifrePanelAcik, setSifrePanelAcik] = useState(false);

  // ── Profil yükle ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (user) {
      setUserData({
        name: user.ad || "",
        email: user.email || "",
        role: user.role || "",
      });
      return;
    }
    const load = async () => {
      const res = await authFetch(`${API_URL}/user/data`);
      const data = await res.json();
      if (data.success) {
        setUserData({
          name: data.userData.ad || "",
          email: data.userData.email || "",
          role: data.userData.role || "",
        });
      }
    };
    load();
  }, [user]);

  const rolLabel = userData.role === "teacher" ? "Öğretmen" : "Öğrenci";

  const showMesaj = (text, type = "success") => {
    setMesaj({ text, type });
    setTimeout(() => setMesaj({ text: "", type: "" }), 3500);
  };

  // ── Profil güncelle ───────────────────────────────────────────────────────
  const handleUpdateProfile = async () => {
    const res = await authFetch(`${API_URL}/user/update`, {
      method: "PUT",
      body: JSON.stringify({ ad: userData.name }),
    });
    const data = await res.json();
    if (data.success) showMesaj("Profil güncellendi.");
    else showMesaj(data.message || "Güncelleme başarısız.", "error");
  };

  // ── OTP gönder ────────────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    const res = await fetch(`${API_URL}/auth/send-reset-OTP`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userData.email }),
    });
    const data = await res.json();
    if (data.success) {
      setOtpGonderildi(true);
      showMesaj("Doğrulama kodu e-postanıza gönderildi.");
    } else {
      showMesaj(data.message || "Kod gönderilemedi.", "error");
    }
  };

  // ── Şifre sıfırla ─────────────────────────────────────────────────────────
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword)
      return showMesaj("Şifreler eşleşmiyor.", "error");
    if (passwords.otp.length !== 6)
      return showMesaj("6 haneli kodu eksiksiz girin.", "error");

    const res = await fetch(`${API_URL}/auth/send-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: userData.email,
        otp: passwords.otp,
        newPassword: passwords.newPassword,
      }),
    });
    const data = await res.json();
    if (data.success) {
      showMesaj("Şifreniz değiştirildi.");
      setOtpGonderildi(false);
      setSifrePanelAcik(false);
      setPasswords({ otp: "", newPassword: "", confirmPassword: "" });
    } else {
      showMesaj(data.message || "Şifre değiştirilemedi.", "error");
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* ── Avatar + İsim Kartı ─────────────────────────────────────────── */}
        <div className="profile-hero-card">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar">
              {userData.name ? (
                userData.name.charAt(0).toUpperCase()
              ) : (
                <FiUser size={32} />
              )}
            </div>
          </div>
          <div className="profile-hero-info">
            <h1 className="profile-hero-name">{userData.name || "—"}</h1>
            <span className="profile-role-badge">{rolLabel}</span>
          </div>
          <button className="profile-logout-btn" onClick={logout}>
            <FiLogOut size={16} />
            <span>Çıkış Yap</span>
          </button>
        </div>

        {/* ── Mesaj Bandı ─────────────────────────────────────────────────── */}
        {mesaj.text && (
          <div className={`profile-mesaj ${mesaj.type}`}>
            {mesaj.type === "error" ? (
              <FiAlertCircle size={16} />
            ) : (
              <FiCheckCircle size={16} />
            )}
            {mesaj.text}
          </div>
        )}

        {/* ── Hesap Bilgileri Kartı ────────────────────────────────────────── */}
        <div className="profile-card">
          <h2 className="profile-card-title">Hesap Bilgileri</h2>

          <Input
            type="text"
            name="name"
            label="Ad Soyad"
            placeholder="Adınız ve Soyadınız"
            value={userData.name}
            onChange={(e) => setUserData({ ...userData, name: e.target.value })}
            icon={<FiUser />}
          />

          <Input
            type="email"
            name="email"
            label="E-posta"
            value={userData.email}
            readOnly
            icon={<FiMail />}
          />

          <Button variant="yellow" fullWidth onClick={handleUpdateProfile}>
            Bilgileri Kaydet
          </Button>
        </div>

        {/* ── Şifre Değiştir Kartı ─────────────────────────────────────────── */}
        <div className="profile-card">
          <button
            className="profile-section-toggle"
            onClick={() => setSifrePanelAcik(!sifrePanelAcik)}
          >
            <h2 className="profile-card-title" style={{ margin: 0 }}>
              Şifre Değiştir
            </h2>
            <span className="profile-toggle-icon">
              {sifrePanelAcik ? "▲" : "▼"}
            </span>
          </button>

          {sifrePanelAcik && (
            <div className="profile-pwd-content">
              {!otpGonderildi ? (
                <>
                  <p className="profile-pwd-hint">
                    Şifrenizi değiştirmek için önce e-posta adresinize bir
                    doğrulama kodu gönderilecek.
                  </p>
                  <Button variant="yellow" fullWidth onClick={handleSendOtp}>
                    Doğrulama Kodu Gönder
                  </Button>
                </>
              ) : (
                <form
                  onSubmit={handlePasswordReset}
                  className="profile-pwd-form"
                >
                  <p className="profile-pwd-hint">
                    E-postanıza gelen 6 haneli kodu girin:
                  </p>
                  <OtpInput
                    length={6}
                    onOtpSubmit={(code) =>
                      setPasswords({ ...passwords, otp: code })
                    }
                  />
                  <Input
                    type="password"
                    name="newPassword"
                    placeholder="Yeni Şifre (en az 6 karakter)"
                    value={passwords.newPassword}
                    onChange={(e) =>
                      setPasswords({
                        ...passwords,
                        newPassword: e.target.value,
                      })
                    }
                    icon={<FiLock />}
                  />
                  <Input
                    type="password"
                    name="confirmPassword"
                    placeholder="Yeni Şifre Tekrar"
                    value={passwords.confirmPassword}
                    onChange={(e) =>
                      setPasswords({
                        ...passwords,
                        confirmPassword: e.target.value,
                      })
                    }
                    icon={<FiLock />}
                  />
                  <div className="profile-pwd-actions">
                    <Button type="submit" variant="yellow" fullWidth>
                      Onayla
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setOtpGonderildi(false);
                        setPasswords({
                          otp: "",
                          newPassword: "",
                          confirmPassword: "",
                        });
                      }}
                    >
                      İptal
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

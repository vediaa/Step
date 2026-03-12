import { useState, useEffect } from "react";
import { FiUser, FiMail, FiLock } from "react-icons/fi";
import Card from "../../components/Card/Card";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import OtpInput from "../../components/OtpInput/OtpInput"; // DİKKAT: Kutucuk bileşenimizi ekledik!
import "./Profile.css";

const Profile = () => {
  const [userData, setUserData] = useState({ name: "", email: "" });
  const [passwords, setPasswords] = useState({
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [otpGonderildi, setOtpGonderildi] = useState(false);
  const [mesaj, setMesaj] = useState("");

  // 1. PROFİLİ GETİR
  useEffect(() => {
    const profiliGetir = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/user/data", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setUserData({ name: data.userData.ad, email: data.userData.email });
        }
      } catch (error) {
        console.error("Profil bilgileri alınamadı:", error);
      }
    };
    profiliGetir();
  }, []);

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/user/update", {
        method: "PUT", // Güncelleme işlemi olduğu için PUT veya POST olabilir
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ad: userData.name }), // Sadece değişen adı gönderiyoruz
      });
      const data = await res.json();

      if (data.success) {
        alert("Profil bilgileriniz başarıyla güncellendi!");
      } else {
        alert(data.message || "Güncelleme başarısız.");
      }
    } catch (error) {
      alert("Sunucuya bağlanılamadı.");
    }
  };

  // 3. ÇIKIŞ YAP
  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/auth/cikis", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Çıkış hatası:", error);
    }
  };

  // 4. ŞİFRE DEĞİŞTİRME İÇİN OTP GÖNDER
  const handleSendOtp = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/auth/send-reset-OTP", {
        // Backend'deki rotanla birebir aynı olmalı
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userData.email }),
      });
      const data = await res.json();

      if (data.success || data.succes) {
        // Backend'de 'succes' yazma ihtimaline karşı :)
        setOtpGonderildi(true);
        setMesaj("Mailinize 6 haneli doğrulama kodu gönderildi!");
      } else {
        setMesaj(data.message);
      }
    } catch (error) {
      setMesaj("Kod gönderilirken hata oluştu.");
    }
  };

  // 5. ŞİFREYİ GÜNCELLE
  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      return setMesaj("Yeni şifreler birbiriyle eşleşmiyor!");
    }
    if (passwords.otp.length !== 6) {
      return setMesaj("Lütfen 6 haneli kodu eksiksiz girin.");
    }

    try {
      const res = await fetch("http://localhost:5001/api/auth/send-password", {
        // Backend rotana göre düzenle
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userData.email,
          otp: passwords.otp,
          newPassword: passwords.newPassword,
        }),
      });
      const data = await res.json();

      if (data.success || data.succes) {
        setMesaj("Şifreniz başarıyla değiştirildi!");
        setOtpGonderildi(false);
        setPasswords({ otp: "", newPassword: "", confirmPassword: "" });
      } else {
        setMesaj(data.message);
      }
    } catch (error) {
      setMesaj("Şifre güncellenirken hata oluştu.");
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        {/*<h1 className="page-title">Profil</h1>*/}
      </div>

      <div className="profile-content">
        <div className="profile-avatar">
          <div className="avatar-circle">
            <FiUser />
          </div>
        </div>

        <Card className="profile-info-card">
          <h2 className="section-title">Kullanıcı Bilgileri</h2>

          <Input
            type="text"
            name="name"
            value={userData.name || ""}
            onChange={(e) => setUserData({ ...userData, name: e.target.value })}
            icon={<FiUser />}
            label="Ad Soyad"
          />

          <Input
            type="email"
            name="email"
            value={userData.email || ""}
            readOnly={true}
            icon={<FiMail />}
            label="E-posta"
          />

          <div className="profile-actions">
            {/* DİKKAT: Güncelleme fonksiyonunu buraya bağladık */}
            <Button variant="primary" onClick={handleUpdateProfile}>
              Bilgileri Güncelle
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Çıkış Yap
            </Button>
          </div>
        </Card>

        <Card className="password-card">
          <h2 className="section-title">Şifre Değiştir</h2>

          {mesaj && (
            <p
              className="form-message"
              style={{
                color: "var(--primary-color)",
                marginBottom: "15px",
                textAlign: "center",
              }}
            >
              {mesaj}
            </p>
          )}

          {!otpGonderildi ? (
            <div className="otp-request-section">
              <p
                style={{ marginBottom: "15px", color: "var(--text-secondary)" }}
              >
                Şifrenizi değiştirmek için e-posta adresinize bir doğrulama kodu
                göndermemiz gerekiyor.
              </p>
              <Button
                type="button"
                variant="primary"
                onClick={handleSendOtp}
                fullWidth
              >
                Doğrulama Kodu Gönder
              </Button>
            </div>
          ) : (
            <form onSubmit={handlePasswordReset}>
              <p
                style={{
                  color: "#6b7280",
                  fontSize: "14px",
                  marginBottom: "10px",
                }}
              >
                E-postanıza gelen kodu girin:
              </p>

              {/* DİKKAT: Düz Input yerine kendi OtpInput bileşenimizi koyduk! */}
              <OtpInput
                length={6}
                onOtpSubmit={(code) =>
                  setPasswords({ ...passwords, otp: code })
                }
              />

              <div style={{ marginTop: "20px" }}>
                <Input
                  type="password"
                  name="newPassword"
                  placeholder="Yeni Şifre (en az 6 karakter)"
                  value={passwords.newPassword}
                  onChange={handleChange}
                  icon={<FiLock />}
                />

                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="Yeni Şifre Tekrar"
                  value={passwords.confirmPassword}
                  onChange={handleChange}
                  icon={<FiLock />}
                />
              </div>

              <div
                className="password-actions"
                style={{ display: "flex", gap: "10px", marginTop: "15px" }}
              >
                <Button type="submit" variant="primary" fullWidth>
                  Onayla
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setOtpGonderildi(false)}
                >
                  İptal
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Profile;

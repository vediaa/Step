import { useState, useEffect } from "react";
import { FiUser, FiMail, FiLock, FiKey } from "react-icons/fi";
import Card from "../../components/Card/Card";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import "./Profile.css";

const Profile = () => {
  // Kullanıcı bilgileri (Normalde bunları API'den veya Context'ten çekersin)
  const [userData, setUserData] = useState({
    name: "",
    email: "",
  });

  // Sayfa açıldığı an API'den veriyi çeken yapı:
  useEffect(() => {
    const profiliGetir = async () => {
      try {
        // DİKKAT: "kullanici-bilgisi" yazan yeri kendi router dosyandaki adrese göre değiştir!
        const res = await fetch("http://localhost:5001/api/user/data", {
          method: "GET", // Router'da router.get ise GET, router.post ise POST yap
          credentials: "include", // Cookie'deki token'ı göndermek için ŞART
        });

        const data = await res.json();
        console.log("Backend'den gelen veri:", data);

        if (data.success) {
          // Backend'den gelen verileri alıp kutularımıza (state) yerleştiriyoruz
          setUserData({
            name: data.userData.ad, // Backend'deki "ad", React'teki "name" state'ine giriyor
            email: data.userData.email, // Backend'den eklediğimiz email buraya giriyor
          });
        }
      } catch (error) {
        console.error("Profil bilgileri alınamadı:", error);
      }
    };

    profiliGetir();
  }, []); // Boş dizi [] sayesinde sadece sayfa ilk açıldığında çalışır

  // Şifre sıfırlama (OTP) süreci için state'ler
  const [passwords, setPasswords] = useState({
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [otpGonderildi, setOtpGonderildi] = useState(false);
  const [mesaj, setMesaj] = useState("");

  // Input değişikliklerini yakalama
  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  // 1. ADIM: ÇIKIŞ YAP (cikisYap Controller'ına gider)
  const handleLogout = async () => {
    console.log("1. ADIM: Butona başarıyla tıklandı, fonksiyon çalışıyor!"); // <--- BUNU EKLE
    try {
      const res = await fetch("http://localhost:5001/api/auth/cikis", {
        method: "GET",
        // Cookie'lerin backend'e gitmesi için bu ayar şarttır:
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        // Çıkış başarılıysa kullanıcıyı login sayfasına yönlendir
        window.location.href = "/login";
      } else {
        alert("Çıkış yapılamadı: " + data.message);
      }
    } catch (error) {
      console.error("Çıkış hatası:", error);
    }
  };

  // 2. ADIM: OTP GÖNDER (sendResetOtp Controller'ına gider)
  const handleSendOtp = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/auth/send-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userData.email }),
      });
      const data = await res.json();

      if (data.success) {
        setOtpGonderildi(true);
        setMesaj("Mailinize 6 haneli doğrulama kodu gönderildi!");
      } else {
        setMesaj(data.message);
      }
    } catch (error) {
      setMesaj("Kod gönderilirken bir hata oluştu.");
    }
  };

  // 3. ADIM: ŞİFREYİ GÜNCELLE (resetPassword Controller'ına gider)
  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      return setMesaj("Yeni şifreler birbiriyle eşleşmiyor!");
    }

    try {
      const res = await fetch("http://localhost:5001/api/auth/reset-password", {
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
        setMesaj("Şifreniz başarıyla değiştirildi!");
        setOtpGonderildi(false); // Formu başlangıç haline döndür
        setPasswords({ otp: "", newPassword: "", confirmPassword: "" });
      } else {
        setMesaj(data.message);
      }
    } catch (error) {
      setMesaj("Şifre güncellenirken bir hata oluştu.");
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1 className="page-title">Profil</h1>
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
            readOnly={true} // E-posta değiştirme genelde ayrı bir işlem gerektirir
            icon={<FiMail />}
            label="E-posta"
          />

          <div className="profile-actions">
            <Button variant="primary">Bilgileri Güncelle</Button>
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
              style={{ color: "var(--primary-color)", marginBottom: "15px" }}
            >
              {mesaj}
            </p>
          )}

          {/* OTP Henüz Gönderilmediyse Bu Ekran Görünür */}
          {!otpGonderildi ? (
            <div className="otp-request-section">
              <p
                style={{ marginBottom: "15px", color: "var(--text-secondary)" }}
              >
                Şifrenizi değiştirmek için e-posta adresinize bir doğrulama kodu
                göndermemiz gerekiyor.
              </p>
              <Button type="button" variant="primary" onClick={handleSendOtp}>
                Doğrulama Kodu Gönder
              </Button>
            </div>
          ) : (
            // OTP Gönderildikten Sonra Yeni Şifre Formu Görünür
            <form onSubmit={handlePasswordReset}>
              <Input
                type="text"
                name="otp"
                placeholder="E-postanıza gelen 6 haneli kod"
                value={passwords.otp}
                onChange={handleChange}
                icon={<FiKey />}
              />

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

              <div className="password-actions">
                <Button type="submit" variant="primary">
                  Şifreyi Onayla ve Değiştir
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

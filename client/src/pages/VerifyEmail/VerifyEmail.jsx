import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OtpInput from "../../components/OtpInput/OtpInput";
import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";

const VerifyEmail = () => {
  const [mesaj, setMesaj] = useState(
    "Mailinize 6 haneli bir kod gönderiliyor...",
  );
  const navigate = useNavigate();

  // Sayfa açılır açılmaz OTP maili gönder
  useEffect(() => {
    const sendOtpMail = async () => {
      try {
        const res = await fetch(
          "http://localhost:5001/api/auth/send-verify-otp",
          {
            method: "GET",
            credentials: "include", // userAuth middleware'i token'ı buradan okuyacak
            headers: { "Content-Type": "application/json" },
          },
        );

        const data = await res.json();
        if (data.success) {
          setMesaj("Doğrulama kodu e-postanıza gönderildi!");
        }
      } catch (error) {
        setMesaj("Kod gönderilirken bir hata oluştu.");
      }
    };
    sendOtpMail();
  }, []);

  // OtpInput 6 haneyi doldurduğunda bu fonksiyon çalışır
  const handleVerify = async (otpCode) => {
    try {
      const res = await fetch("http://localhost:5001/api/auth/verify-account", {
        method: "POST",
        credentials: "include", // userAuth için şart
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: otpCode }), // Backend userId'yi zaten token'dan (req.userId) alıyorsa sadece otp yeterli
      });

      const data = await res.json();

      if (data.success) {
        setMesaj("Hesabınız doğrulandı! Yönlendiriliyorsunuz...");
        setTimeout(() => navigate("/dashboard"), 1500); // Başarılıysa Step paneline giriş
      } else {
        setMesaj(data.message || "Geçersiz kod.");
      }
    } catch (error) {
      setMesaj("Doğrulama sırasında hata oluştu.");
    }
  };

  return (
    <div
      className="verify-page"
      style={{ display: "flex", justifyContent: "center", marginTop: "10vh" }}
    >
      <Card variant="dark">
        <h2>E-posta Doğrulama</h2>
        <p style={{ color: "#6b7280", marginBottom: "20px" }}>{mesaj}</p>

        {/* Bileşene onOtpSubmit prop'u ile fonksiyonumuzu bağladık */}
        <OtpInput length={6} onOtpSubmit={handleVerify} />

        <Button
          variant="secondary"
          fullWidth
          onClick={() => window.location.reload()}
        >
          Kodu Tekrar Gönder
        </Button>
      </Card>
    </div>
  );
};

export default VerifyEmail;

/*import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import OtpInput from "../../components/OtpInput/OtpInput";
import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
//import "./VerifyEmail.css"; // Kendine göre ortalama/hizalama CSS'lerini yazabilirsin

const VerifyEmail = () => {
  const [otpCode, setOtpCode] = useState("");
  const [mesaj, setMesaj] = useState("");
  const navigate = useNavigate();

  // OtpInput bileşeni 6 haneyi doldurduğunda bu fonksiyon tetiklenir
  const handleOtpComplete = (code) => {
    setOtpCode(code);
  };

  const dogrulamayiTamamla = async (e) => {
    e.preventDefault();

    if (otpCode.length !== 6) {
      return setMesaj("Lütfen 6 haneli kodu eksiksiz girin.");
    }

    try {
      // DİKKAT: Backend'de bu isteği karşılayan route adresini buraya yaz
      const res = await fetch("http://localhost:5001/api/auth/verify-email", {
        method: "POST",
        credentials: "include", // <--- BU ÇOK KRİTİK! Cookie'yi backend'e gönderir
        headers: { "Content-Type": "application/json" },
        // Backend senden userId ve otp bekliyor.
        // Not: userId'yi bir önceki kayıt sayfasından state ile veya localStorage ile buraya aktarman gerekir.
        body: JSON.stringify({
          userId: localStorage.getItem("tempUserId"), // Örnek olarak localStorage'dan aldık
          otp: otpCode,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMesaj("Hesabınız başarıyla doğrulandı!");
        // Doğrulama başarılıysa Dashboard'a veya Login'e yönlendir
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMesaj(data.message);
      }
    } catch (error) {
      setMesaj("Sunucuya bağlanılamadı.");
    }
  };

  return (
    <div
      className="verify-page-container"
      style={{ display: "flex", justifyContent: "center", marginTop: "10vh" }}
    >
      <Card variant="dark">
        <h2 style={{ textAlign: "center" }}>E-posta Doğrulama</h2>
        <p
          style={{
            textAlign: "center",
            color: "#6b7280",
            marginBottom: "20px",
          }}
        >
          Lütfen e-posta adresinize gönderilen 6 haneli kodu girin.
        </p>

        {mesaj && (
          <p style={{ textAlign: "center", color: "#e53935" }}>{mesaj}</p>
        )}

        <form onSubmit={dogrulamayiTamamla}>
          
          <OtpInput length={6} onOtpSubmit={handleOtpComplete} />

          <Button type="submit" variant="primary" fullWidth>
            Doğrula ve Devam Et
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default VerifyEmail;*/

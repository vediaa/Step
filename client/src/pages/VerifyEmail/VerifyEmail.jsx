import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OtpInput from "../../components/OtpInput/OtpInput";
import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import "./VerifyEmail.css";

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
    <div className="verify-page">
      <Card variant="white">
        <h2>E-posta Doğrulama</h2>
        <p style={{ color: "#5e6575", marginBottom: "30px" }}>{mesaj}</p>

        {/* Bileşene onOtpSubmit prop'u ile fonksiyonumuzu bağladık */}
        <OtpInput length={6} onOtpSubmit={handleVerify} />

        <Button
          variant="darkblue"
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

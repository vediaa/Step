import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import OtpInput from "../../components/OtpInput/OtpInput";
import Card from "../../components/Card/Card";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email girme, 2: OTP ve Şifre girme
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [mesaj, setMesaj] = useState("");
  const navigate = useNavigate();

  // 1. AŞAMA: Mail gönder (/send-reset-OTP rotası)
  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/send-reset-OTP", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.succes || data.success) {
        // Backend'deki typo ihtimaline karşı ikisini de yazdık
        setStep(2);
        setMesaj("Sıfırlama kodu mailinize gönderildi.");
      } else {
        setMesaj(data.message);
      }
    } catch (error) {
      setMesaj("Bağlantı hatası.");
    }
  };

  // 2. AŞAMA: Yeni şifreyi kaydet (/send-password rotası)
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (otpCode.length !== 6) return setMesaj("Lütfen 6 haneli kodu girin.");

    try {
      const res = await fetch("http://localhost:5000/api/auth/send-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode, newPassword }),
      });
      const data = await res.json();

      if (data.succes || data.success) {
        setMesaj("Şifreniz güncellendi! Giriş yapabilirsiniz.");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMesaj(data.message);
      }
    } catch (error) {
      setMesaj("Hata oluştu.");
    }
  };

  return (
    <div
      style={{ display: "flex", justifyContent: "center", marginTop: "10vh" }}
    >
      <Card variant="dark">
        <h2>Şifremi Unuttum</h2>
        {mesaj && (
          <p style={{ color: "#e53935", marginBottom: "15px" }}>{mesaj}</p>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp}>
            <Input
              type="email"
              placeholder="E-posta Adresiniz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" variant="primary" fullWidth>
              Kodu Gönder
            </Button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <p style={{ color: "#6b7280", fontSize: "14px" }}>
              E-postanıza gelen kodu girin:
            </p>

            {/* OTP Bileşenimiz yine burada! */}
            <OtpInput length={6} onOtpSubmit={(code) => setOtpCode(code)} />

            <Input
              type="password"
              placeholder="Yeni Şifreniz"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Button type="submit" variant="primary" fullWidth>
              Şifreyi Güncelle
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
};

export default ForgotPassword;

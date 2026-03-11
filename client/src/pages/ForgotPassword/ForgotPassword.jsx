import { useState } from "react";
import { FiMail, FiLock } from "react-icons/fi";
import Card from "../../components/Card/Card";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import OtpInput from "../../components/OtpInput/OtpInput";

const ForgotPassword = () => {
  // Aşama kontrolü: 1 (Email girme), 2 (Kod ve yeni şifre girme)
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mesaj, setMesaj] = useState("");

  // 1. AŞAMA: E-postaya OTP Gönder
  const handleSendCode = async (e) => {
    e.preventDefault();
    try {
      // DİKKAT: Backend'de OTP gönderen rotana göre adresi düzenle
      const res = await fetch("http://localhost:5001/api/auth/send-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.success) {
        setMesaj("Doğrulama kodu e-postanıza gönderildi!");
        setStep(2); // Başarılıysa 2. aşamaya geç
      } else {
        setMesaj(data.message);
      }
    } catch (error) {
      setMesaj("Kod gönderilirken bir hata oluştu.");
    }
  };

  // 2. AŞAMA: Yeni Şifreyi Kaydet
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      return setMesaj("Şifreler birbiriyle eşleşmiyor!");
    }
    if (otp.length !== 6) {
      return setMesaj("Lütfen 6 haneli kodu eksiksiz girin.");
    }

    try {
      // Senin attığın resetPassword controller'ına giden istek
      const res = await fetch("http://localhost:5001/api/auth/send-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();

      if (data.success) {
        alert("Şifreniz başarıyla güncellendi! Giriş yapabilirsiniz.");
        window.location.href = "/login"; // İşlem bitince Login'e yönlendir
      } else {
        setMesaj(data.message);
      }
    } catch (error) {
      setMesaj("Şifre sıfırlanırken bir hata oluştu.");
    }
  };

  return (
    <div
      className="forgot-password-page"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "var(--darkblue)", // Varsa kendi arkaplan rengini koy
        padding: "20px",
      }}
    >
      <Card variant="white" style={{ maxWidth: "450px", width: "100%" }}>
        <h2
          style={{
            textAlign: "center",
            marginBottom: "10px",
            color: "var(--purple)",
          }}
        >
          Şifremi Unuttum
        </h2>

        {mesaj && (
          <p
            style={{
              color: "var(--lightgrey)",
              textAlign: "center",
              marginBottom: "20px",
            }}
          >
            {mesaj}
          </p>
        )}

        {/* EKRAN 1: Sadece E-posta İstiyoruz */}
        {step === 1 && (
          <form onSubmit={handleSendCode}>
            <p
              style={{
                color: "#6b7280",
                textAlign: "center",
                marginBottom: "20px",
                fontSize: "14px",
              }}
            >
              Hesabınıza ait e-posta adresini girin. Size bir şifre sıfırlama
              kodu göndereceğiz.
            </p>

            <Input
              type="email"
              name="email"
              placeholder="E-posta adresiniz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<FiMail />}
            />

            <div style={{ marginTop: "20px" }}>
              <Button type="submit" variant="yellow" fullWidth>
                Kodu Gönder
              </Button>
            </div>

            <div style={{ textAlign: "center", marginTop: "15px" }}>
              <a
                href="/login"
                style={{
                  color: "var(--neongreen)",
                  textDecoration: "none",
                  fontSize: "14px",
                }}
              >
                Giriş sayfasına dön
              </a>
            </div>
          </form>
        )}

        {/* EKRAN 2: Kod ve Yeni Şifre İstiyoruz */}
        {step === 2 && (
          <form onSubmit={handleResetPassword}>
            <p
              style={{
                color: "#6b7280",
                textAlign: "center",
                marginBottom: "15px",
                fontSize: "14px",
              }}
            >
              <strong>{email}</strong> adresine gönderilen 6 haneli kodu girin.
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <OtpInput length={6} onOtpSubmit={(code) => setOtp(code)} />
            </div>

            <Input
              type="password"
              name="newPassword"
              placeholder="Yeni Şifre"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              icon={<FiLock />}
            />

            <Input
              type="password"
              name="confirmPassword"
              placeholder="Yeni Şifre Tekrar"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<FiLock />}
            />

            <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
              <Button type="submit" variant="yellow" fullWidth>
                Şifreyi Yenile
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

export default ForgotPassword;

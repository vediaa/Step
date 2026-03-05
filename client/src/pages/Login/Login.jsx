import { useState } from "react";
import { Link } from "react-router-dom";
import { FiMail, FiLock } from "react-icons/fi";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import Logo from "../../components/Logo/Logo";
import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5001/api/auth/giris", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Token'ı kaydediyoruz
        localStorage.setItem("token", data.token);
        console.log("Giriş başarılı, token kaydedildi!");

        // Dashboard'a yönlendir
        window.location.href = "/dashboard";
      } else {
        alert(data.message || "Giriş başarısız.");
      }
    } catch (error) {
      console.error("Giriş hatası:", error);
      alert("Sunucuya bağlanılamadı.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Logo size="medium" />
            <h1 className="auth-title">Hoş Geldin!</h1>
            <p className="auth-subtitle">
              Hesabına giriş yap ve öğrenmeye devam et
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
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
            />

            <div className="form-footer">
              <Link to="/forgot-password" className="forgot-link">
                Şifreni mi unuttun?
              </Link>
            </div>

            <Button type="submit" variant="primary" fullWidth>
              Giriş Yap
            </Button>
          </form>

          <div className="auth-divider">
            <span>veya</span>
          </div>

          <p className="auth-switch">
            Hesabın yok mu? <Link to="/register">Kayıt Ol</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

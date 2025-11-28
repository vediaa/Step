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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Form gönderme işlemi burada yapılacak
    console.log("Login:", formData);
    // Başarılı giriş sonrası dashboard'a yönlendir
    window.location.href = "/dashboard";
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

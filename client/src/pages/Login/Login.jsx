/* import { useState } from "react";
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
        credentials: "include", // "Backend'den Set-Cookie gelirse lütfen onu tarayıcıya kaydet" demektir!
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
              <Link to="/send-password" className="forgot-link">
                Şifreni mi unuttun?
              </Link>
            </div>

            <Button type="submit" variant="yellow" fullWidth>
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
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock } from "react-icons/fi";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import Logo from "../../components/Logo/Logo";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/giris`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Giriş başarısız.");
        return;
      }

      // 1. Token'ı AuthContext'e kaydet
      await login(data.token);

      // 2. Role bilgisini çek (token payload'da yok, getUserData'dan geliyor)
      const userRes = await fetch(`${API_URL}/user/data`, {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      const userData = await userRes.json();
      const role = userData?.userData?.role;

      // 3. Role göre yönlendir
      if (role === "teacher") {
        navigate("/ogretmen-panel", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setError("Sunucuya bağlanılamadı.");
    } finally {
      setIsLoading(false);
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
              <Link to="/send-password" className="forgot-link">
                Şifreni mi unuttun?
              </Link>
            </div>

            {error && <div className="auth-error">⚠️ {error}</div>}

            <Button
              type="submit"
              variant="yellow"
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
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

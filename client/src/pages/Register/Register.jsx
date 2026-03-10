import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock } from "react-icons/fi";
import Input from "../../components/Input/Input.jsx";
import Button from "../../components/Button/Button.jsx";
import Logo from "../../components/Logo/Logo.jsx";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate(); // Yönlendirme için

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Yükleniyor, hata, başarı durumları için
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // İŞTE SİHİRLİ STATE: Kullanıcı kayıt oldu mu? Başlangıçta hayır (false).
  const [kayitBasarili, setKayitBasarili] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const vediaSubmit = async (e) => {
    e.preventDefault(); //form sayfayı yenilemesin diye
    setIsLoading(true);
    setError("");
    setSuccess("");

    console.log("Gönderilen veri:", formData);

    try {
      const response = await fetch("http://localhost:5001/api/auth/kayit", {
        method: "POST",
        credentials: "include", //cokie için gerekli
        headers: {
          "Content-Type": "application/json", //backende json gönderiyorz demek
        },
        credentials: "include",
        body: JSON.stringify(formData), //veriyi json formataına çevirdik
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`,
        );
      }

      // Başarılı kayıt
      console.log("Kayıt başarılı:", data);
      setSuccess(data.message || "Kayıt başarılı!");
      setIsLoading(false);

      // Formu temizle
      setFormData({ name: "", email: "", password: "" });

      // 2 saniye sonra login sayfasına yönlendir
      setTimeout(() => {
        navigate("/verify-email"); // logindi eskiden
      }, 2000);
    } catch (error) {
      console.error("Kayıt hatası:", error);
      setError(error.message || "Bir hata oluştu!");
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Logo size="medium" />
            <h1 className="auth-title">Hesap Oluştur</h1>
            <p className="auth-subtitle">Hemen kaydol ve öğrenmeye başla</p>
          </div>

          <form className="auth-form" onSubmit={vediaSubmit}>
            <Input
              type="text"
              name="name"
              placeholder="Adınız ve Soyadınız"
              value={formData.name}
              onChange={handleChange}
              icon={<FiUser />}
              required
            />

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
              minLength={6}
            />

            {/* Hata mesajı */}
            {error && (
              <div
                className="error-message"
                style={{
                  color: "#e74c3c",
                  backgroundColor: "#fadbd8",
                  padding: "10px",
                  borderRadius: "5px",
                  marginBottom: "15px",
                  fontSize: "14px",
                }}
              >
                ⚠️ {error}
              </div>
            )}

            {/* Başarı mesajı */}
            {success && (
              <div
                className="success-message"
                style={{
                  color: "#27ae60",
                  backgroundColor: "#d5f4e6",
                  padding: "10px",
                  borderRadius: "5px",
                  marginBottom: "15px",
                  fontSize: "14px",
                }}
              >
                {success}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? "Yükleniyor..." : "Kayıt Ol"}
            </Button>
          </form>

          <div className="auth-divider">
            <span>veya</span>
          </div>

          <p className="auth-switch">
            Zaten hesabın var mı? <Link to="/login">Giriş Yap</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

/* import { useState } from "react";
import { Link } from "react-router-dom";
import { FiUser, FiMail, FiLock } from "react-icons/fi";
import Input from "../../components/Input/Input.jsx";
import Button from "../../components/Button/Button.jsx";
import Logo from "../../components/Logo/Logo.jsx";
import "./Register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const vediaSubmit = (e) => {
    e.preventDefault();
    console.log(e);
    console.log(formData);

    // Form gönderme işlemi burada yapılacak
    // fecht ya da axios ile controller localhost:5173/api/register
    fetch("http://localhost:5001/api/auth/kayit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Cookie için gerekli
      body: JSON.stringify(formData), // Form verisini JSON'a çevir
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        // Başarılı kayıt sonrası
        console.log("Kayıt başarılı:", data);
        this.setState({
          isLoaded: true,
          success: true,
          message: data.message,
        });
      })
      .catch((error) => {
        // Hata durumu
        console.error("Kayıt hatası:", error);
        this.setState({
          isLoaded: true,
          error: error.message,
        });
      });
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Logo size="medium" />
            <h1 className="auth-title">Hesap Oluştur</h1>
            <p className="auth-subtitle">Hemen kaydol ve öğrenmeye başla</p>
          </div>

          <form className="auth-form" onSubmit={vediaSubmit}>
            <Input
              type="text"
              name="name"
              placeholder="Adınız ve Soyadınız"
              value={formData.firstName}
              onChange={handleChange}
              icon={<FiUser />}
              required
            />

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

            <Button type="submit" variant="primary" fullWidth>
              Kayıt Ol
            </Button>
          </form>

          <div className="auth-divider">
            <span>veya</span>
          </div>

          <p className="auth-switch">
            Zaten hesabın var mı? <Link to="/login">Giriş Yap</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
 */

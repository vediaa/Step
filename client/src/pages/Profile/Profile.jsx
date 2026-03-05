import { useState } from "react";
import { FiUser, FiMail, FiLock } from "react-icons/fi";
import Card from "../../components/Card/Card";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import "./Profile.css";

const Profile = () => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    // Şifre değiştirme işlemi
    console.log("Password change:", userData);
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
            value={userData.name}
            onChange={handleChange}
            icon={<FiUser />}
            label="Ad Soyad"
          />

          <Input
            type="email"
            name="email"
            value={userData.email}
            onChange={handleChange}
            icon={<FiMail />}
            label="E-posta"
          />

          <div className="profile-actions">
            <Button variant="primary">Bilgileri Güncelle</Button>
            <Button variant="outline">Çıkış Yap</Button>
          </div>
        </Card>

        <Card className="password-card">
          <h2 className="section-title">Şifre Değiştir</h2>
          <form onSubmit={handlePasswordChange}>
            <Input
              type="password"
              name="currentPassword"
              placeholder="Mevcut Şifre"
              value={userData.currentPassword}
              onChange={handleChange}
              icon={<FiLock />}
            />

            <Input
              type="password"
              name="newPassword"
              placeholder="Yeni Şifre (en az 6 karakter)"
              value={userData.newPassword}
              onChange={handleChange}
              icon={<FiLock />}
            />

            <Input
              type="password"
              name="confirmPassword"
              placeholder="Yeni Şifre Tekrar"
              value={userData.confirmPassword}
              onChange={handleChange}
              icon={<FiLock />}
            />

            <div className="password-actions">
              <Button type="submit" variant="primary">
                Şifreyi Değiştir
              </Button>
              <Button type="button" variant="secondary">
                İptal
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Profile;

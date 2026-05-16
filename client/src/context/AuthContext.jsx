import { createContext, useContext, useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { ad, email, role, dersler }
  const [loading, setLoading] = useState(true); // sayfa ilk yüklenirken bekle

  // ── Uygulama açılınca token varsa kullanıcıyı getir ──────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (token) => {
    try {
      const res = await fetch(`${API_URL}/user/data`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.userData);
      } else {
        // Token geçersizse temizle
        localStorage.removeItem("token");
      }
    } catch {
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  // ── Giriş: token kaydet, kullanıcıyı getir ───────────────────────────────
  const login = async (token) => {
    localStorage.setItem("token", token);
    await fetchUser(token);
  };

  // ── Çıkış ────────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/auth/cikis`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      /* sessizce geç */
    }

    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login";
  };

  const isAuthenticated = !!user;
  const isTeacher = user?.role === "teacher";
  const isStudent = user?.role === "student";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        isTeacher,
        isStudent,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Kullanım: const { user, isTeacher, logout } = useAuth();
export const useAuth = () => useContext(AuthContext);

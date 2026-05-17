import { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

// api.js dosyamızı import ediyoruz (Adım 3'te oluşturmuştuk)
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { ad, email, role, dersler }
  const [loading, setLoading] = useState(true);

  // ── Uygulama açılınca token varsa kullanıcıyı getir ──────────────────────
  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      if (token) {
        await fetchUser(); // api.js interceptor'ı token'ı otomatik ekliyor
      }
    } catch {
      await SecureStore.deleteItemAsync("token");
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await api.get("/user/data");
      if (res.data.success) {
        setUser(res.data.userData);
      } else {
        await SecureStore.deleteItemAsync("token");
        setUser(null);
      }
    } catch {
      await SecureStore.deleteItemAsync("token");
      setUser(null);
    }
  };

  // ── Giriş: token kaydet, kullanıcıyı getir ───────────────────────────────
  const login = async (token) => {
    await SecureStore.setItemAsync("token", token);
    await fetchUser();
    router.replace("/(tabs)/dashboard"); // Başarılı girişte ana sayfaya yolla
  };

  // ── Çıkış ────────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await api.post("/auth/cikis");
    } catch {
      /* sessizce geç */
    }

    await SecureStore.deleteItemAsync("token");
    setUser(null);
    router.replace("/(auth)/login"); // Çıkışta login ekranına yolla
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

export const useAuth = () => useContext(AuthContext);

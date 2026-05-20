import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Logo from "../../components/Logo/Logo";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import { useAuth } from "../../context/AuthContext";
import { Colors } from "../../constants/colors";
import api from "../../services/api";

export default function LoginScreen() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!formData.email || !formData.password) {
      setError("Email ve şifre gerekli.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.post("/auth/giris", formData);
      if (!res.data.success) {
        setError(res.data.message || "Giriş başarısız.");
        return;
      }
      await login(res.data.token);
      const userRes = await api.get("/user/data");
      const role = userRes.data?.userData?.role;
      router.replace(
        role === "teacher" ? "/(tabs)/ogretmen-dashboard" : "/(tabs)/dashboard",
      );
    } catch {
      setError("Sunucuya bağlanılamadı.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          {/* Logo */}
          <View style={styles.logoWrap}>
            <Logo size="medium" />
          </View>

          <Text style={styles.title}>Hoş Geldin!</Text>
          <Text style={styles.subtitle}>
            Hesabına giriş yap ve öğrenmeye devam et
          </Text>

          <Input
            type="email"
            placeholder="E-mail adresin"
            value={formData.email}
            onChangeText={(v) => setFormData({ ...formData, email: v })}
            icon={
              <Ionicons name="mail-outline" size={18} color={Colors.grey} />
            }
          />
          <Input
            type="password"
            placeholder="Şifre (en az 6 karakter)"
            value={formData.password}
            onChangeText={(v) => setFormData({ ...formData, password: v })}
            icon={
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={Colors.grey}
              />
            }
          />

          <TouchableOpacity
            onPress={() => router.push("/(auth)/forgot-password")}
            style={styles.forgotWrap}
          >
            <Text style={styles.forgotLink}>Şifreni mi unuttun?</Text>
          </TouchableOpacity>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          ) : null}

          <Button
            variant="yellow"
            fullWidth
            onPress={handleSubmit}
            loading={isLoading}
          >
            {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </Button>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>veya</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Hesabın yok mu? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
              <Text style={styles.switchLink}>Kayıt Ol</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // Web'deki gibi: koyu lacivert arka plan, beyaz kart
  container: {
    flex: 1,
    backgroundColor: Colors.darkblue, // #26355d
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  logoWrap: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.purple, // rgb(165,131,146) — web ile aynı
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  forgotWrap: {
    alignSelf: "flex-end",
    marginBottom: 16,
    marginTop: 4,
  },
  forgotLink: {
    color: Colors.neongreen, // #1eae98 turkuaz
    fontSize: 13,
    fontWeight: "500",
  },
  errorBox: {
    backgroundColor: "#fef2f2",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  errorText: {
    color: Colors.darkred,
    fontSize: 13,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    color: Colors.grey,
    fontSize: 13,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  switchText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  switchLink: {
    color: Colors.neongreen,
    fontWeight: "700",
    fontSize: 14,
  },
});

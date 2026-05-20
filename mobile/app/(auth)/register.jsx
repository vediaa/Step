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

const DERSLER = [
  "Matematik",
  "Geometri",
  "Fizik",
  "Kimya",
  "Biyoloji",
  "Türkçe",
  "Edebiyat",
  "Tarih",
  "Coğrafya",
  "Felsefe",
  "İngilizce",
];

export default function RegisterScreen() {
  const { login } = useAuth();
  const [adim, setAdim] = useState(1);
  const [secilenRol, setSecilenRol] = useState(null);
  const [secilenDersler, setSecilenDersler] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const dersToggle = (ders) =>
    setSecilenDersler((prev) =>
      prev.includes(ders) ? prev.filter((d) => d !== ders) : [...prev, ders],
    );

  const handleSubmit = async () => {
    setError("");
    if (!formData.name || !formData.email || !formData.password) {
      setError("Tüm alanları doldurun.");
      return;
    }
    if (secilenRol === "teacher" && secilenDersler.length === 0) {
      setError("En az 1 ders seçin.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.post("/auth/kayit", {
        ...formData,
        role: secilenRol,
        dersler: secilenRol === "teacher" ? secilenDersler : [],
      });
      if (!res.data.success) {
        setError(res.data.message || "Kayıt başarısız.");
        return;
      }
      if (res.data.token) await login(res.data.token);
      router.replace("/(auth)/verify-email");
    } catch {
      setError("Sunucuya bağlanılamadı.");
    } finally {
      setIsLoading(false);
    }
  };

  // Adım 1: Rol seçimi
  if (adim === 1) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoWrap}>
            <Logo size="medium" />
          </View>
          <View style={styles.card}>
            <Text style={styles.title}>Hesap Oluştur</Text>
            <Text style={styles.subtitle}>Sen kimsin?</Text>

            <View style={styles.rolRow}>
              {[
                {
                  key: "student",
                  emoji: "🎒",
                  baslik: "Öğrenciyim",
                  aciklama: "Soru sor, çözüm al",
                },
                {
                  key: "teacher",
                  emoji: "👨‍🏫",
                  baslik: "Öğretmenim",
                  aciklama: "Soruları çöz, yardım et",
                },
              ].map((r) => (
                <TouchableOpacity
                  key={r.key}
                  style={[
                    styles.rolKart,
                    secilenRol === r.key && styles.rolKartAktif,
                  ]}
                  onPress={() => setSecilenRol(r.key)}
                >
                  <Text style={styles.rolEmoji}>{r.emoji}</Text>
                  <Text style={styles.rolBaslik}>{r.baslik}</Text>
                  <Text style={styles.rolAciklama}>{r.aciklama}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {secilenRol === "teacher" && (
              <View style={styles.dersSecim}>
                <Text style={styles.dersBaslik}>
                  Hangi dersleri veriyorsun?
                </Text>
                <View style={styles.dersChips}>
                  {DERSLER.map((d) => (
                    <TouchableOpacity
                      key={d}
                      style={[
                        styles.dersChip,
                        secilenDersler.includes(d) && styles.dersChipSecili,
                      ]}
                      onPress={() => dersToggle(d)}
                    >
                      <Text
                        style={[
                          styles.dersChipText,
                          secilenDersler.includes(d) &&
                            styles.dersChipTextSecili,
                        ]}
                      >
                        {d}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {secilenDersler.length === 0 && (
                  <Text style={styles.dersUyari}>En az 1 ders seçmelisin</Text>
                )}
              </View>
            )}

            <Button
              variant="yellow"
              fullWidth
              onPress={() => {
                if (!secilenRol) {
                  setError("Rol seçin.");
                  return;
                }
                if (secilenRol === "teacher" && secilenDersler.length === 0) {
                  setError("En az 1 ders seçin.");
                  return;
                }
                setError("");
                setAdim(2);
              }}
              style={{ marginTop: 8 }}
            >
              Devam Et →
            </Button>

            {error ? <Text style={styles.errorText}>⚠️ {error}</Text> : null}

            <View style={styles.switchRow}>
              <Text style={styles.switchText}>Zaten hesabın var mı? </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                <Text style={styles.switchLink}>Giriş Yap</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Adım 2: Bilgi formu
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoWrap}>
          <Logo size="medium" />
        </View>
        <View style={styles.card}>
          <Text style={styles.title}>Hesap Oluştur</Text>

          <View style={styles.secimOzet}>
            <Text style={styles.ozetRol}>
              {secilenRol === "teacher" ? "👨‍🏫 Öğretmen" : "🎒 Öğrenci"}
            </Text>
            {secilenRol === "teacher" && (
              <Text style={styles.ozetDersler} numberOfLines={1}>
                {secilenDersler.join(", ")}
              </Text>
            )}
            <TouchableOpacity onPress={() => setAdim(1)}>
              <Text style={styles.degistir}>Değiştir</Text>
            </TouchableOpacity>
          </View>

          <Input
            placeholder="Adınız ve Soyadınız"
            value={formData.name}
            onChangeText={(v) => setFormData({ ...formData, name: v })}
            icon={
              <Ionicons
                name="person-outline"
                size={18}
                color={Colors.textTertiary}
              />
            }
          />
          <Input
            type="email"
            placeholder="E-mail adresin"
            value={formData.email}
            onChangeText={(v) => setFormData({ ...formData, email: v })}
            icon={
              <Ionicons
                name="mail-outline"
                size={18}
                color={Colors.textTertiary}
              />
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
                color={Colors.textTertiary}
              />
            }
          />

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorTextBox}>⚠️ {error}</Text>
            </View>
          ) : null}

          <Button
            variant="yellow"
            fullWidth
            onPress={handleSubmit}
            loading={isLoading}
          >
            {isLoading ? "Kaydediliyor..." : "Kayıt Ol"}
          </Button>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>veya</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Zaten hesabın var mı? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text style={styles.switchLink}>Giriş Yap</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.darkblue },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 24 },
  logoWrap: { alignItems: "center", marginBottom: 28 },
  card: {
    backgroundColor: Colors.bgPrimary,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 24,
    padding: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.purple,
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
  },
  rolRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  rolKart: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.bgSecondary,
  },
  rolKartAktif: { borderColor: Colors.purple, backgroundColor: "#2e1065" },
  rolEmoji: { fontSize: 28, marginBottom: 6 },
  rolBaslik: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  rolAciklama: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  dersSecim: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  dersBaslik: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  dersChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  dersChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.bgPrimary,
  },
  dersChipSecili: {
    backgroundColor: Colors.purple,
    borderColor: Colors.purple,
  },
  dersChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  dersChipTextSecili: { color: "#fff" },
  dersUyari: { fontSize: 12, color: Colors.error, marginTop: 8 },
  secimOzet: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    padding: 10,
    backgroundColor: "#2e1065",
    borderRadius: 10,
    marginBottom: 20,
  },
  ozetRol: { fontSize: 13, fontWeight: "700", color: Colors.purple },
  ozetDersler: { flex: 1, fontSize: 12, color: Colors.textSecondary },
  degistir: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.purple,
    textDecorationLine: "underline",
  },
  errorBox: {
    backgroundColor: Colors.errorBg,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    color: Colors.error,
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
  },
  errorTextBox: { color: Colors.error, fontSize: 13 },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { color: Colors.textTertiary, fontSize: 13 },
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  switchText: { color: Colors.textSecondary, fontSize: 14 },
  switchLink: { color: Colors.neongreen, fontWeight: "700", fontSize: 14 },
});

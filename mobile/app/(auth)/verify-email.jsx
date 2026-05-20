import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import Logo from "../../components/Logo/Logo";
import OtpInput from "../../components/OtpInput/OtpInput";
import Button from "../../components/Button/Button";
import { Colors } from "../../constants/colors";
import api from "../../services/api";

export default function VerifyEmailScreen() {
  const [mesaj, setMesaj] = useState(
    "Mailinize 6 haneli bir kod gönderiliyor...",
  );
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    sendOtp();
  }, []);

  const sendOtp = async () => {
    try {
      const res = await api.get("/auth/send-verify-otp");
      if (res.data.success) setMesaj("Doğrulama kodu e-postanıza gönderildi!");
      else setMesaj("Kod gönderilemedi.");
    } catch {
      setMesaj("Bağlantı hatası.");
    }
  };

  const handleVerify = async (otpCode) => {
    try {
      const res = await api.post("/auth/verify-account", { otp: otpCode });
      if (res.data.success) {
        setMesaj("Hesabınız doğrulandı! Yönlendiriliyorsunuz...");
        setSuccess(true);
        setTimeout(() => router.replace("/(tabs)/dashboard"), 1500);
      } else {
        setMesaj(res.data.message || "Geçersiz kod.");
      }
    } catch {
      setMesaj("Doğrulama sırasında hata oluştu.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.logoWrap}>
          <Logo size="medium" />
        </View>
        <View style={styles.card}>
          <Text style={styles.title}>E-posta Doğrulama</Text>
          <Text style={[styles.mesaj, success && styles.mesajSuccess]}>
            {mesaj}
          </Text>
          <OtpInput length={6} onOtpSubmit={handleVerify} />
          <Button variant="darkblue" fullWidth onPress={sendOtp}>
            Kodu Tekrar Gönder
          </Button>
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
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.purple,
    marginBottom: 12,
  },
  mesaj: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 8,
  },
  mesajSuccess: { color: Colors.neongreen },
});

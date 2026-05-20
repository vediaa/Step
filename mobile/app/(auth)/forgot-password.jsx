import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Link, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Logo from "../../components/Logo/Logo";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import OtpInput from "../../components/OtpInput/OtpInput";
import { Colors } from "../../constants/colors";
import api from "../../services/api";

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!email) {
      setMesaj("Email gerekli.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/send-reset-otp", { email });
      if (res.data.success) {
        setMesaj("Doğrulama kodu e-postanıza gönderildi!");
        setStep(2);
      } else {
        setMesaj(res.data.message || "Kod gönderilemedi.");
      }
    } catch {
      setMesaj("Sunucuya bağlanılamadı.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (newPassword !== confirmPassword) {
      setMesaj("Şifreler eşleşmiyor.");
      return;
    }
    if (otp.length !== 6) {
      setMesaj("6 haneli kodu eksiksiz girin.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/send-password", {
        email,
        otp,
        newPassword,
      });
      if (res.data.success) {
        setMesaj("Şifreniz güncellendi!");
        setTimeout(() => router.replace("/(auth)/login"), 1500);
      } else {
        setMesaj(res.data.message || "Sıfırlama başarısız.");
      }
    } catch {
      setMesaj("Sunucuya bağlanılamadı.");
    } finally {
      setLoading(false);
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
        <View style={styles.logoWrap}>
          <Logo size="medium" />
        </View>
        <View style={styles.card}>
          <Text style={styles.title}>Şifremi Unuttum</Text>

          {mesaj ? <Text style={styles.mesaj}>{mesaj}</Text> : null}

          {step === 1 && (
            <>
              <Text style={styles.hint}>
                Hesabınıza ait e-posta adresini girin.
              </Text>
              <Input
                type="email"
                placeholder="E-posta adresiniz"
                value={email}
                onChangeText={setEmail}
                icon={
                  <Ionicons
                    name="mail-outline"
                    size={18}
                    color={Colors.textTertiary}
                  />
                }
              />
              <Button
                variant="yellow"
                fullWidth
                onPress={handleSendCode}
                loading={loading}
              >
                Kodu Gönder
              </Button>
              <Link href="/(auth)/login" style={styles.backLink}>
                Giriş sayfasına dön
              </Link>
            </>
          )}

          {step === 2 && (
            <>
              <Text style={styles.hint}>
                <Text style={{ color: Colors.neongreen }}>{email}</Text>{" "}
                adresine gönderilen 6 haneli kodu girin.
              </Text>
              <OtpInput length={6} onOtpSubmit={(code) => setOtp(code)} />
              <Input
                type="password"
                placeholder="Yeni Şifre"
                value={newPassword}
                onChangeText={setNewPassword}
                icon={
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color={Colors.textTertiary}
                  />
                }
              />
              <Input
                type="password"
                placeholder="Yeni Şifre Tekrar"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                icon={
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color={Colors.textTertiary}
                  />
                }
              />
              <Button
                variant="yellow"
                fullWidth
                onPress={handleReset}
                loading={loading}
              >
                Şifreyi Yenile
              </Button>
            </>
          )}
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
    fontSize: 24,
    fontWeight: "700",
    color: Colors.purple,
    textAlign: "center",
    marginBottom: 12,
  },
  hint: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 22,
  },
  mesaj: {
    fontSize: 13,
    color: Colors.neongreen,
    textAlign: "center",
    marginBottom: 12,
  },
  backLink: {
    color: Colors.neongreen,
    fontSize: 13,
    textAlign: "center",
    marginTop: 16,
  },
});

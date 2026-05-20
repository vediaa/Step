import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import OtpInput from "../../components/OtpInput/OtpInput";
import { Colors } from "../../constants/colors";
import api from "../../services/api";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.ad || "");
  const [email] = useState(user?.email || "");
  const [mesaj, setMesaj] = useState({ text: "", ok: true });
  const [sifreAcik, setSifreAcik] = useState(false);
  const [otpGonderildi, setOtpGonderildi] = useState(false);
  const [passwords, setPasswords] = useState({
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const rolLabel = user?.role === "teacher" ? "Öğretmen" : "Öğrenci";
  const avatarLetter = (user?.ad || "?").charAt(0).toUpperCase();

  const showMsg = (text, ok = true) => {
    setMesaj({ text, ok });
    setTimeout(() => setMesaj({ text: "", ok: true }), 3500);
  };

  const handleUpdateProfile = async () => {
    try {
      const res = await api.put("/user/update", { ad: name });
      if (res.data.success) showMsg("Profil güncellendi.");
      else showMsg(res.data.message || "Güncelleme başarısız.", false);
    } catch {
      showMsg("Bağlantı hatası.", false);
    }
  };

  const handleSendOtp = async () => {
    setLoading(true);
    try {
      const res = await api.post("/auth/send-reset-OTP", { email });
      if (res.data.success) {
        setOtpGonderildi(true);
        showMsg("Kod gönderildi.");
      } else showMsg(res.data.message || "Kod gönderilemedi.", false);
    } catch {
      showMsg("Bağlantı hatası.", false);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      showMsg("Şifreler eşleşmiyor.", false);
      return;
    }
    if (passwords.otp.length !== 6) {
      showMsg("6 haneli kodu eksiksiz girin.", false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/send-password", {
        email,
        otp: passwords.otp,
        newPassword: passwords.newPassword,
      });
      if (res.data.success) {
        showMsg("Şifre değiştirildi.");
        setOtpGonderildi(false);
        setSifreAcik(false);
        setPasswords({ otp: "", newPassword: "", confirmPassword: "" });
      } else showMsg(res.data.message || "Değiştirilemedi.", false);
    } catch {
      showMsg("Bağlantı hatası.", false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Çıkış", "Çıkış yapmak istediğine emin misin?", [
      { text: "İptal", style: "cancel" },
      { text: "Çıkış Yap", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.card}>
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarLetter}</Text>
          </View>
          <View>
            <Text style={styles.name}>{user?.ad || "—"}</Text>
            <View
              style={[
                styles.roleBadge,
                user?.role === "teacher"
                  ? styles.teacherBadge
                  : styles.studentBadge,
              ]}
            >
              <Text style={styles.roleText}>{rolLabel}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={22} color={Colors.darkred} />
          </TouchableOpacity>
        </View>
      </View>

      {mesaj.text ? (
        <View
          style={[
            styles.messageBox,
            mesaj.ok ? styles.messageSuccess : styles.messageError,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              { color: mesaj.ok ? Colors.success : Colors.error },
            ]}
          >
            {mesaj.text}
          </Text>
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Hesap Bilgileri</Text>
        <Input label="Ad Soyad" value={name} onChangeText={setName} />
        <Input label="E-posta" value={email} editable={false} />
        <Button onPress={handleUpdateProfile} loading={loading}>
          Kaydet
        </Button>
      </View>

      <View style={styles.card}>
        <TouchableOpacity
          onPress={() => setSifreAcik(!sifreAcik)}
          style={styles.sectionHeader}
        >
          <Text style={styles.sectionTitle}>Şifre Değiştir</Text>
          <Ionicons
            name={sifreAcik ? "chevron-up" : "chevron-down"}
            size={20}
            color={Colors.textSecondary}
          />
        </TouchableOpacity>

        {sifreAcik && (
          <View style={styles.passwordSection}>
            {!otpGonderildi ? (
              <>
                <Text style={styles.hint}>
                  E-postana doğrulama kodu göndereceğiz.
                </Text>
                <Button onPress={handleSendOtp} loading={loading}>
                  Kod Gönder
                </Button>
              </>
            ) : (
              <>
                <OtpInput
                  length={6}
                  onOtpSubmit={(code) =>
                    setPasswords({ ...passwords, otp: code })
                  }
                />
                <Input
                  placeholder="Yeni Şifre"
                  secureTextEntry
                  value={passwords.newPassword}
                  onChangeText={(v) =>
                    setPasswords({ ...passwords, newPassword: v })
                  }
                />
                <Input
                  placeholder="Yeni Şifre Tekrar"
                  secureTextEntry
                  value={passwords.confirmPassword}
                  onChangeText={(v) =>
                    setPasswords({ ...passwords, confirmPassword: v })
                  }
                />
                <Button onPress={handlePasswordReset} loading={loading}>
                  Şifreyi Güncelle
                </Button>
                <Button
                  variant="secondary"
                  onPress={() => {
                    setOtpGonderildi(false);
                    setPasswords({
                      otp: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                >
                  İptal
                </Button>
              </>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.purple + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.purple,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  teacherBadge: {
    backgroundColor: Colors.orange + "20",
  },
  studentBadge: {
    backgroundColor: Colors.neongreen + "20",
  },
  roleText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  logoutButton: {
    marginLeft: "auto",
    padding: 8,
  },
  messageBox: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  messageSuccess: {
    backgroundColor: Colors.success + "10",
  },
  messageError: {
    backgroundColor: Colors.error + "10",
  },
  messageText: {
    fontSize: 13,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  passwordSection: {
    marginTop: 16,
    gap: 12,
  },
  hint: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
});

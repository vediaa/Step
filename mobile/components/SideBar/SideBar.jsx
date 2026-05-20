import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { Colors } from "../../constants/colors";

export default function Sidebar({ visible, onClose }) {
  const { user, logout, isTeacher } = useAuth();

  const menuItems = [
    // Öğrenci menüleri
    ...(!isTeacher
      ? [
          { title: "Anasayfa", icon: "home-outline", route: "/dashboard" },
          { title: "Dersler", icon: "book-outline", route: "/courses" },
          { title: "Sorularım", icon: "images-outline", route: "/questions" },
          {
            title: "Soru Sor",
            icon: "send-outline",
            route: "/ogrenci-sorular",
          },
          {
            title: "Ders Programı",
            icon: "calendar-outline",
            route: "/schedule",
          },
        ]
      : []),
    // Öğretmen menüleri
    ...(isTeacher
      ? [
          { title: "Gelen Sorular", icon: "inbox-outline", route: "/ogretmen" },
          {
            title: "Özet",
            icon: "stats-chart-outline",
            route: "/ogretmen-dashboard",
          },
        ]
      : []),
    // Ortak
    { title: "Profilim", icon: "person-outline", route: "/profile" },
  ];

  const handleNavigate = (route) => {
    onClose();
    router.push(route);
  };

  const handleLogout = () => {
    onClose();
    logout();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sidebar} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(user?.ad || "?").charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.userName}>{user?.ad || "Kullanıcı"}</Text>
            <Text style={styles.userEmail}>{user?.email || ""}</Text>
          </View>

          {/* Menü Öğeleri */}
          <ScrollView style={styles.menuContainer}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.route}
                style={styles.menuItem}
                onPress={() => handleNavigate(item.route)}
              >
                <Ionicons name={item.icon} size={22} color={Colors.purple} />
                <Text style={styles.menuTitle}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Çıkış Butonu */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color={Colors.darkred} />
            <Text style={styles.logoutText}>Çıkış Yap</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sidebar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "75%",
    backgroundColor: Colors.bgPrimary,
    paddingTop: 50,
    paddingBottom: 30,
  },
  header: {
    alignItems: "center",
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.purple + "20",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.purple,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  menuContainer: {
    flex: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 14,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.textPrimary,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
    borderRadius: 12,
    gap: 12,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.darkred,
  },
});

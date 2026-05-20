import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import FlipCountdown from "../../components/FlipCountdown/FlipCountdown";
import { Colors } from "../../constants/colors";
import api from "../../services/api";

const MENU_ITEMS = [
  {
    label: "Dersler",
    icon: "book-outline",
    route: "/(tabs)/courses",
    bg: "#424769",
  },
  {
    label: "Çalışma Programı",
    icon: "list-outline",
    route: "/(tabs)/schedule",
    bg: "#26355d",
  },
  {
    label: "Sorular",
    icon: "help-circle-outline",
    route: "/(tabs)/questions",
    bg: "#6B728E",
  },
  {
    label: "Netler",
    icon: "bar-chart-outline",
    route: "/(tabs)/exams",
    bg: "#3D45AA",
  },
];

export default function DashboardScreen() {
  const { user } = useAuth();
  const [isim, setIsim] = useState(user?.ad || "");
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!isim) {
      api
        .get("/user/data")
        .then((r) => {
          if (r.data.success) setIsim(r.data.userData.ad);
        })
        .catch(() => {});
    }
  }, []);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingBottom: insets.bottom + 80 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Merhaba{isim ? `, ${isim} !` : " !"}</Text>

        <FlipCountdown />

        <View style={styles.grid}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.card, { backgroundColor: item.bg }]}
              onPress={() => router.push(item.route)}
              activeOpacity={0.85}
            >
              <Ionicons name={item.icon} size={36} color="#ffffff" />
              <Text style={styles.cardTitle}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#3D45AA",
    marginBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  card: {
    width: "47%",
    minHeight: 160,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    textAlign: "center",
  },
});

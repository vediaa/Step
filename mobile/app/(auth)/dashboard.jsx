import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import Card from "../../components/Card/Card";
import FlipCountdown from "../../components/FlipCountdown/FlipCountdown";
import { Colors } from "../../constants/colors";
import api from "../../services/api";

const MENU_ITEMS = [
  {
    label: "Dersler",
    icon: "book-outline",
    route: "/(tabs)/courses",
    variant: "darkpurple",
  },
  {
    label: "Çalışma Programı",
    icon: "list-outline",
    route: "/(tabs)/schedule",
    variant: "darkblue",
  },
  {
    label: "Sorular",
    icon: "help-circle-outline",
    route: "/(tabs)/questions",
    variant: "mor",
  },
  {
    label: "Netler",
    icon: "bar-chart-outline",
    route: "/(tabs)/exams",
    variant: "logoblue",
  },
];

export default function DashboardScreen() {
  const { user } = useAuth();
  const [isim, setIsim] = useState(user?.ad || "");

  useEffect(() => {
    if (!isim) {
      api
        .get("/user/data")
        .then((res) => {
          if (res.data.success) setIsim(res.data.userData.ad);
        })
        .catch(() => {});
    }
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Merhaba{isim ? `, ${isim}!` : "!"}</Text>
        </View>
        <FlipCountdown />
        <View style={styles.grid}>
          {MENU_ITEMS.map((item) => (
            <Card
              key={item.label}
              variant={item.variant}
              onPress={() => router.push(item.route)}
              style={styles.featureCard}
            >
              <Ionicons name={item.icon} size={36} color="#fff" />
              <Text style={styles.featureTitle}>{item.label}</Text>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.darkblue },
  container: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { fontSize: 28, fontWeight: "700", color: Colors.logoblue },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  featureCard: {
    width: "47%",
    minHeight: 160,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
});

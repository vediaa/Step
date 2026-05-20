import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { Colors } from "../../constants/colors";
import api from "../../services/api";

const formatDate = (d) =>
  new Date(d).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function OgretmenDashboardScreen() {
  const { user } = useAuth();
  const [sorular, setSorular] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyukImage, setBuyukImage] = useState(null);

  useEffect(() => {
    api
      .get("/questions_db/teacher-inbox")
      .then((res) => {
        if (res.data.success) setSorular(res.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const bekleyen = sorular.filter((s) => s.status === "pending").length;
  const cevaplanan = sorular.filter((s) => s.status === "answered").length;
  const toplam = sorular.length;
  const sonBekleyenler = sorular
    .filter((s) => s.status === "pending")
    .slice(0, 5);

  return (
    <View style={s.container}>
      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Başlık */}
        <View style={s.heroCard}>
          <View>
            <Text style={s.title}>
              Merhaba{user?.ad ? `, ${user.ad}` : ""} 👋
            </Text>
            <Text style={s.subtitle}>Bugün {bekleyen} soru seni bekliyor.</Text>
          </View>
        </View>

        {/* İstatistikler */}
        <View style={s.stats}>
          {[
            {
              label: "Toplam",
              value: toplam,
              color: "#a855f7",
              icon: "inbox-outline",
              bg: "rgba(168,85,247,0.1)",
            },
            {
              label: "Bekleyen",
              value: bekleyen,
              color: "#eab308",
              icon: "time-outline",
              bg: "rgba(234,179,8,0.1)",
            },
            {
              label: "Cevaplanan",
              value: cevaplanan,
              color: "#10b981",
              icon: "checkmark-circle-outline",
              bg: "rgba(16,185,129,0.1)",
            },
          ].map((st) => (
            <View
              key={st.label}
              style={[s.statCard, { backgroundColor: st.bg }]}
            >
              <Ionicons name={st.icon} size={22} color={st.color} />
              <Text style={[s.statVal, { color: st.color }]}>{st.value}</Text>
              <Text style={s.statLabel}>{st.label}</Text>
            </View>
          ))}
        </View>

        {/* Son bekleyen sorular */}
        <View style={s.section}>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>Son Bekleyen Sorular</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/ogretmen")}>
              <Text style={s.seeAll}>Tümünü Gör →</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color="#a855f7" style={{ marginTop: 20 }} />
          ) : sonBekleyenler.length === 0 ? (
            <View style={s.emptyCard}>
              <Ionicons
                name="checkmark-circle-outline"
                size={48}
                color="#10b981"
              />
              <Text style={s.emptyText}>Bekleyen soru yok 🎉</Text>
            </View>
          ) : (
            sonBekleyenler.map((soru) => (
              <TouchableOpacity
                key={soru._id}
                style={s.soruRow}
                onPress={() => router.push("/(tabs)/ogretmen")}
              >
                <TouchableOpacity
                  style={s.soruThumb}
                  onPress={() => soru.imageUrl && setBuyukImage(soru.imageUrl)}
                >
                  {soru.imageUrl ? (
                    <Image
                      source={{
                        uri: `data:image/jpeg;base64,${soru.imageUrl}`,
                      }}
                      style={{ width: "100%", height: "100%" }}
                    />
                  ) : (
                    <Ionicons name="image-outline" size={24} color="#94a3b8" />
                  )}
                </TouchableOpacity>
                <View style={s.soruBody}>
                  <Text style={s.soruDers}>{soru.ders}</Text>
                  <Text style={s.soruText} numberOfLines={1}>
                    {soru.extractedText
                      ? soru.extractedText.slice(0, 60) + "..."
                      : "Görsel soru"}
                  </Text>
                  <Text style={s.soruMeta}>
                    <Ionicons name="person-outline" size={11} />{" "}
                    {soru.studentName || "Öğrenci"} ·{" "}
                    {formatDate(soru.createdAt)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Tam Ekran Görsel Modal */}
      <Modal
        visible={!!buyukImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setBuyukImage(null)}
      >
        <TouchableOpacity
          style={s.fullImageOverlay}
          activeOpacity={1}
          onPress={() => setBuyukImage(null)}
        >
          {buyukImage && (
            <Image
              source={{ uri: `data:image/jpeg;base64,${buyukImage}` }}
              style={s.fullImage}
              resizeMode="contain"
            />
          )}
          <View style={s.fullImageClose}>
            <Ionicons name="close" size={28} color="#fff" />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
  },
  stats: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 6,
  },
  statVal: {
    fontSize: 26,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "600",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
  },
  seeAll: {
    fontSize: 13,
    color: "#a855f7",
    fontWeight: "600",
  },
  emptyCard: {
    alignItems: "center",
    gap: 12,
    padding: 40,
  },
  emptyText: {
    color: "#64748b",
    fontSize: 14,
  },
  soruRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  soruThumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  soruBody: {
    flex: 1,
    gap: 4,
  },
  soruDers: {
    fontSize: 11,
    fontWeight: "700",
    color: "#a855f7",
    backgroundColor: "rgba(168,85,247,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  soruText: {
    fontSize: 13,
    color: "#1e293b",
    marginTop: 2,
  },
  soruMeta: {
    fontSize: 11,
    color: "#94a3b8",
  },
  fullImageOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "100%",
    height: "100%",
  },
  fullImageClose: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 25,
    padding: 8,
  },
});

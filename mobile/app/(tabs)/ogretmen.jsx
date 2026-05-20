import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { Colors } from "../../constants/colors";
import api from "../../services/api";

const StatusBadge = ({ status }) => {
  const cfg = {
    pending: {
      label: "Bekliyor",
      color: "#eab308",
      bg: "rgba(234,179,8,0.1)",
    },
    answered: {
      label: "Cevaplandı",
      color: "#10b981",
      bg: "rgba(16,185,129,0.1)",
    },
    verified: {
      label: "Doğrulandı",
      color: "#10b981",
      bg: "rgba(16,185,129,0.1)",
    },
    disputed: {
      label: "İtiraz Var",
      color: "#ef4444",
      bg: "rgba(239,68,68,0.1)",
    },
  };
  const c = cfg[status] || cfg.pending;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.color }]}>{c.label}</Text>
    </View>
  );
};

export default function OgretmenScreen() {
  const { user } = useAuth();
  const [sorular, setSorular] = useState([]);
  const [disputed, setDisputed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aktifTab, setAktifTab] = useState("bekleyen");
  const [secilenSoru, setSecilenSoru] = useState(null);
  const [cevapMetni, setCevapMetni] = useState("");
  const [cevapFoto, setCevapFoto] = useState(null);
  const [gonderiyor, setGonderiyor] = useState(false);
  const [buyukImage, setBuyukImage] = useState(null);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [inboxRes, disputedRes] = await Promise.all([
        api.get("/questions_db/teacher-inbox"),
        api.get("/questions_db/disputed"),
      ]);
      if (inboxRes.data.success) setSorular(inboxRes.data.data || []);
      if (disputedRes.data.success) setDisputed(disputedRes.data.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const fotoSec = async () => {
    Alert.alert("Fotoğraf", "Seçim yapın", [
      {
        text: "📷 Kamera",
        onPress: async () => {
          const perm = await ImagePicker.requestCameraPermissionsAsync();
          if (!perm.granted) return;
          const r = await ImagePicker.launchCameraAsync({
            quality: 0.8,
            base64: true,
          });
          if (!r.canceled) setCevapFoto(r.assets[0]);
        },
      },
      {
        text: "🖼️ Galeri",
        onPress: async () => {
          const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!perm.granted) return;
          const r = await ImagePicker.launchImageLibraryAsync({
            quality: 0.8,
            base64: true,
          });
          if (!r.canceled) setCevapFoto(r.assets[0]);
        },
      },
      { text: "İptal", style: "cancel" },
    ]);
  };

  const cevapGonder = async () => {
    if (!cevapMetni.trim() && !cevapFoto) {
      Alert.alert("Uyarı", "Lütfen bir cevap yazın veya fotoğraf ekleyin");
      return;
    }
    setGonderiyor(true);
    try {
      const res = await api.put(`/questions_db/${secilenSoru._id}/answer`, {
        answerText: cevapMetni.trim(),
        answerImageBase64: cevapFoto?.base64 || "",
      });
      if (!res.data.success) throw new Error(res.data.message);

      setSorular((prev) =>
        prev.map((s) =>
          s._id === secilenSoru._id
            ? {
                ...s,
                status: "answered",
                answer: { text: cevapMetni, imageUrl: cevapFoto?.base64 || "" },
              }
            : s,
        ),
      );
      setDisputed((prev) => prev.filter((s) => s._id !== secilenSoru._id));
      setCevapMetni("");
      setCevapFoto(null);
      setSecilenSoru(null);
      Alert.alert("Başarılı", "Cevap gönderildi!");
    } catch (err) {
      Alert.alert("Hata", err.message || "Gönderilemedi.");
    } finally {
      setGonderiyor(false);
    }
  };

  const panelKapat = () => {
    setSecilenSoru(null);
    setCevapMetni("");
    setCevapFoto(null);
  };

  const tabSorular = {
    bekleyen: sorular.filter((s) => s.status === "pending"),
    cevaplanan: sorular.filter((s) =>
      ["answered", "verified"].includes(s.status),
    ),
    itiraz: disputed,
  };
  const listedeSorular = tabSorular[aktifTab] || [];

  const formatDate = (d) =>
    new Date(d).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  const renderSoru = ({ item }) => (
    <TouchableOpacity
      style={[styles.row, item.status === "disputed" && styles.rowDisputed]}
      onPress={() => setSecilenSoru(item)}
    >
      <TouchableOpacity
        style={styles.thumb}
        onPress={() => item.imageUrl && setBuyukImage(item.imageUrl)}
      >
        {item.imageUrl ? (
          <Image
            source={{ uri: `data:image/jpeg;base64,${item.imageUrl}` }}
            style={{ width: "100%", height: "100%" }}
          />
        ) : (
          <Ionicons name="image-outline" size={24} color="#94a3b8" />
        )}
      </TouchableOpacity>
      <View style={styles.rowBody}>
        <Text style={styles.rowDers}>{item.ders}</Text>
        <View style={styles.rowMeta}>
          <Ionicons name="person-outline" size={11} color="#94a3b8" />
          <Text style={styles.rowStudent}>
            {" "}
            {item.studentName || "Öğrenci"}
          </Text>
          <Text style={styles.rowTarih}>{formatDate(item.createdAt)}</Text>
        </View>
      </View>
      <StatusBadge status={item.status} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            Merhaba{user?.ad ? `, ${user.ad}` : ""} 👋
          </Text>
          <Text style={styles.subtitle}>
            Bugün {tabSorular.bekleyen.length} soru seni bekliyor.
          </Text>
        </View>
        <TouchableOpacity onPress={loadAll} style={styles.refreshBtn}>
          <Ionicons name="refresh-outline" size={16} color="#a855f7" />
          <Text style={styles.refreshText}> Yenile</Text>
        </TouchableOpacity>
      </View>

      {/* İstatistikler */}
      <View style={styles.stats}>
        {[
          {
            label: "Bekleyen",
            value: tabSorular.bekleyen.length,
            color: "#eab308",
            icon: "time-outline",
            bg: "rgba(234,179,8,0.1)",
          },
          {
            label: "Cevaplanan",
            value: tabSorular.cevaplanan.length,
            color: "#10b981",
            icon: "checkmark-circle-outline",
            bg: "rgba(16,185,129,0.1)",
          },
          {
            label: "İtiraz",
            value: disputed.length,
            color: "#ef4444",
            icon: "alert-circle-outline",
            bg: "rgba(239,68,68,0.1)",
          },
        ].map((stat) => (
          <View
            key={stat.label}
            style={[styles.statCard, { backgroundColor: stat.bg }]}
          >
            <Ionicons name={stat.icon} size={20} color={stat.color} />
            <Text style={[styles.statVal, { color: stat.color }]}>
              {stat.value}
            </Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {[
          { key: "bekleyen", label: "Bekleyenler" },
          { key: "cevaplanan", label: "Cevaplananlar" },
          {
            key: "itiraz",
            label: `İtirazlar${disputed.length > 0 ? ` (${disputed.length})` : ""}`,
          },
        ].map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, aktifTab === t.key && styles.tabActive]}
            onPress={() => setAktifTab(t.key)}
          >
            <Text
              style={[
                styles.tabText,
                aktifTab === t.key && styles.tabTextActive,
              ]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Liste */}
      {loading ? (
        <ActivityIndicator
          style={{ marginTop: 40 }}
          color="#a855f7"
          size="large"
        />
      ) : listedeSorular.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="inbox-outline" size={48} color="#94a3b8" />
          <Text style={styles.emptyText}>
            {aktifTab === "bekleyen"
              ? "Bekleyen soru yok 🎉"
              : "Burada soru yok"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={listedeSorular}
          renderItem={renderSoru}
          keyExtractor={(i) => i._id}
          contentContainerStyle={styles.list}
        />
      )}

      {/* Detay / Cevap Modal */}
      <Modal
        visible={!!secilenSoru}
        transparent
        animationType="slide"
        onRequestClose={panelKapat}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detayPanel}>
            <View style={styles.detayHead}>
              <View style={{ flex: 1 }}>
                <Text style={styles.detayDers}>{secilenSoru?.ders}</Text>
                <Text style={styles.detayTarih}>
                  {secilenSoru && formatDate(secilenSoru.createdAt)}
                </Text>
              </View>
              <TouchableOpacity onPress={panelKapat}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.detayStudent}>
              <Ionicons name="person-outline" size={14} color="#64748b" />
              <Text style={styles.detayStudentText}>
                {secilenSoru?.studentName || "Öğrenci"}
              </Text>
              {secilenSoru && <StatusBadge status={secilenSoru.status} />}
            </View>

            {secilenSoru?.status === "disputed" &&
              secilenSoru.feedback?.note && (
                <View style={styles.itirazBox}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={15}
                    color="#ef4444"
                  />
                  <Text style={styles.itirazText}>
                    "{secilenSoru.feedback.note}"
                  </Text>
                </View>
              )}

            <ScrollView showsVerticalScrollIndicator={false}>
              {secilenSoru?.imageUrl && (
                <TouchableOpacity
                  onPress={() => setBuyukImage(secilenSoru.imageUrl)}
                >
                  <Image
                    source={{
                      uri: `data:image/jpeg;base64,${secilenSoru.imageUrl}`,
                    }}
                    style={styles.detayImg}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              )}

              {["answered", "verified", "disputed"].includes(
                secilenSoru?.status,
              ) && (
                <View style={styles.answeredBox}>
                  <Text style={styles.answeredTitle}>✓ Verilen Cevap</Text>
                  {secilenSoru?.answer?.text && (
                    <Text style={styles.answeredText}>
                      {secilenSoru.answer.text}
                    </Text>
                  )}
                  {secilenSoru?.answer?.imageUrl && (
                    <TouchableOpacity
                      onPress={() => setBuyukImage(secilenSoru.answer.imageUrl)}
                    >
                      <Image
                        source={{
                          uri: `data:image/jpeg;base64,${secilenSoru.answer.imageUrl}`,
                        }}
                        style={styles.answerImg}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  )}

                  {/* History */}
                  {secilenSoru?.answerHistory &&
                    secilenSoru.answerHistory.length > 0 && (
                      <View style={styles.historyContainer}>
                        <Text style={styles.historyTitle}>
                          <Ionicons
                            name="time-outline"
                            size={12}
                            color="#94a3b8"
                          />
                          Önceki Cevaplar ({secilenSoru.answerHistory.length})
                        </Text>
                        {secilenSoru.answerHistory.map((item, idx) => (
                          <View key={idx} style={styles.historyItem}>
                            <Text style={styles.historyDate}>
                              {new Date(item.answeredAt).toLocaleString(
                                "tr-TR",
                              )}
                            </Text>
                            {item.text ? (
                              <Text style={styles.historyText}>
                                {item.text}
                              </Text>
                            ) : null}
                            {item.imageUrl ? (
                              <TouchableOpacity
                                onPress={() => setBuyukImage(item.imageUrl)}
                              >
                                <Image
                                  source={{
                                    uri: `data:image/jpeg;base64,${item.imageUrl}`,
                                  }}
                                  style={styles.historyImage}
                                  resizeMode="contain"
                                />
                              </TouchableOpacity>
                            ) : null}
                          </View>
                        ))}
                      </View>
                    )}
                </View>
              )}

              {(secilenSoru?.status === "pending" ||
                secilenSoru?.status === "disputed") && (
                <View style={styles.cevapArea}>
                  <Text style={styles.cevapLabel}>
                    {secilenSoru?.status === "disputed"
                      ? "Düzeltilmiş Cevap"
                      : "Cevabını Yaz"}
                  </Text>
                  <TextInput
                    style={styles.cevapInput}
                    placeholder="Çözüm adımlarını açıkla..."
                    placeholderTextColor="#94a3b8"
                    value={cevapMetni}
                    onChangeText={setCevapMetni}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                  {cevapFoto && (
                    <View style={styles.fotoPreviewWrap}>
                      <Image
                        source={{ uri: cevapFoto.uri }}
                        style={styles.fotoPreview}
                        resizeMode="contain"
                      />
                      <TouchableOpacity
                        style={styles.fotoKaldir}
                        onPress={() => setCevapFoto(null)}
                      >
                        <Ionicons name="close" size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  )}
                  <TouchableOpacity style={styles.fotoBtn} onPress={fotoSec}>
                    <Ionicons name="image-outline" size={16} color="#64748b" />
                    <Text style={styles.fotoBtnText}> Fotoğraf Ekle</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.cevapBtn,
                      (gonderiyor || (!cevapMetni.trim() && !cevapFoto)) &&
                        styles.disabled,
                    ]}
                    onPress={cevapGonder}
                    disabled={gonderiyor || (!cevapMetni.trim() && !cevapFoto)}
                  >
                    {gonderiyor ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.cevapBtnText}>Cevabı Gönder</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Tam Ekran Görsel Modal */}
      <Modal
        visible={!!buyukImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setBuyukImage(null)}
      >
        <TouchableOpacity
          style={styles.fullImageOverlay}
          activeOpacity={1}
          onPress={() => setBuyukImage(null)}
        >
          {buyukImage && (
            <Image
              source={{ uri: `data:image/jpeg;base64,${buyukImage}` }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
          <View style={styles.fullImageClose}>
            <Ionicons name="close" size={28} color="#fff" />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#64748b",
  },
  refreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#a855f7",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  refreshText: {
    color: "#a855f7",
    fontWeight: "600",
    fontSize: 13,
  },
  stats: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    gap: 6,
  },
  statVal: {
    fontSize: 22,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "600",
  },
  tabs: {
    flexDirection: "row",
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: "#a855f7",
  },
  tabText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748b",
  },
  tabTextActive: {
    color: "#fff",
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  rowDisputed: {
    borderColor: "#ef4444",
    backgroundColor: "rgba(239,68,68,0.05)",
  },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  rowBody: {
    flex: 1,
    gap: 4,
  },
  rowDers: {
    fontSize: 12,
    fontWeight: "700",
    color: "#a855f7",
  },
  rowMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowStudent: {
    fontSize: 11,
    color: "#64748b",
    flex: 1,
  },
  rowTarih: {
    fontSize: 11,
    color: "#94a3b8",
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 60,
  },
  emptyText: {
    color: "#64748b",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  detayPanel: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "92%",
    gap: 10,
  },
  detayHead: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  detayDers: {
    fontSize: 13,
    fontWeight: "700",
    color: "#a855f7",
  },
  detayTarih: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
  },
  detayStudent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detayStudentText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1e293b",
    flex: 1,
  },
  itirazBox: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "rgba(239,68,68,0.08)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.2)",
    gap: 6,
  },
  itirazText: {
    color: "#ef4444",
    fontSize: 13,
    fontStyle: "italic",
    flex: 1,
  },
  detayImg: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    marginBottom: 12,
  },
  answeredBox: {
    backgroundColor: "rgba(16,185,129,0.05)",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.15)",
    gap: 8,
    marginBottom: 12,
  },
  answeredTitle: {
    fontWeight: "700",
    color: "#10b981",
    fontSize: 14,
  },
  answeredText: {
    fontSize: 14,
    color: "#1e293b",
    lineHeight: 22,
  },
  answerImg: {
    width: "100%",
    height: 180,
    borderRadius: 10,
  },
  historyContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  historyTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 8,
  },
  historyItem: {
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    gap: 6,
  },
  historyDate: {
    fontSize: 10,
    color: "#94a3b8",
  },
  historyText: {
    fontSize: 13,
    color: "#1e293b",
  },
  historyImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  cevapArea: {
    gap: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  cevapLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1e293b",
  },
  cevapInput: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: "#1e293b",
    backgroundColor: "#f8fafc",
    minHeight: 100,
  },
  fotoPreviewWrap: {
    position: "relative",
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    overflow: "hidden",
    height: 180,
  },
  fotoPreview: {
    width: "100%",
    height: "100%",
  },
  fotoKaldir: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  fotoBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignSelf: "flex-start",
    backgroundColor: "#fff",
  },
  fotoBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
  },
  cevapBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#a855f7",
  },
  cevapBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  disabled: {
    opacity: 0.5,
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

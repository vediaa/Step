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

const StatusBadge = ({ status }) => {
  const cfg = {
    pending: { label: "Bekliyor", color: "#eab308", bg: "rgba(234,179,8,0.1)" },
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
      label: "İtirazda",
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

export default function OgrenciSorularScreen() {
  const [sorular, setSorular] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [aktifTab, setAktifTab] = useState("hepsi");
  const [modalGorunur, setModalGorunur] = useState(false);
  const [adim, setAdim] = useState("ders");
  const [secilenDers, setSecilenDers] = useState(null);
  const [secilenOgretmen, setSecilenOgretmen] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [detayModal, setDetayModal] = useState(null);
  const [feedbackNote, setFeedbackNote] = useState("");
  const [showFeedbackNote, setShowFeedbackNote] = useState(false);
  const [buyukImage, setBuyukImage] = useState(null);

  useEffect(() => {
    loadSorular();
  }, []);

  const loadSorular = async () => {
    try {
      setLoading(true);
      const res = await api.get("/questions_db/my");
      if (res.data.success) setSorular(res.data.data || []);
    } catch {
      setSorular([]);
    } finally {
      setLoading(false);
    }
  };

  const modalKapat = () => {
    setModalGorunur(false);
    setAdim("ders");
    setSecilenDers(null);
    setSecilenOgretmen(null);
    setTeachers([]);
  };

  const handleDersSelect = async (ders) => {
    setSecilenDers(ders);
    setAdim("ogretmen");
    setTeacherLoading(true);
    try {
      const res = await api.get(
        `/questions_db/teachers?ders=${encodeURIComponent(ders)}`,
      );
      setTeachers(res.data.success ? res.data.data : []);
    } catch {
      setTeachers([]);
    } finally {
      setTeacherLoading(false);
    }
  };

  const soruGonder = async (source) => {
    const permission =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("İzin gerekli");
      return;
    }

    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({ quality: 0.8, base64: true })
        : await ImagePicker.launchImageLibraryAsync({
            quality: 0.8,
            base64: true,
          });

    if (result.canceled) return;

    setUploading(true);
    modalKapat();
    try {
      const asset = result.assets[0];
      const formData = new FormData();
      formData.append("image", {
        uri: asset.uri,
        type: "image/jpeg",
        name: "soru.jpg",
      });
      formData.append("ders", secilenDers);
      formData.append("teacherId", secilenOgretmen._id);

      const res = await api.post("/questions_db/ask", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        Alert.alert("Başarılı", "Soru öğretmene iletildi!");
        loadSorular();
      } else {
        Alert.alert("Hata", res.data.message || "Gönderilemedi.");
      }
    } catch {
      Alert.alert("Hata", "Sunucuya bağlanılamadı.");
    } finally {
      setUploading(false);
    }
  };

  const sendFeedback = async (type) => {
    try {
      const res = await api.put(`/questions_db/${detayModal._id}/feedback`, {
        type,
        note: feedbackNote.trim(),
      });
      if (res.data.success) {
        const yeniStatus = type === "correct" ? "verified" : "disputed";
        setSorular((prev) =>
          prev.map((s) =>
            s._id === detayModal._id ? { ...s, status: yeniStatus } : s,
          ),
        );
        setDetayModal((prev) => ({ ...prev, status: yeniStatus }));
        setShowFeedbackNote(false);
        setFeedbackNote("");
      }
    } catch {
      Alert.alert("Hata", "Gönderilemedi.");
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  const filtreliSorular = sorular.filter((s) => {
    if (aktifTab === "bekleyen") return s.status === "pending";
    if (aktifTab === "cevaplanan")
      return ["answered", "verified", "disputed"].includes(s.status);
    return true;
  });

  const renderSoru = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => setDetayModal(item)}>
      <View style={styles.cardImgWrap}>
        {item.imageUrl ? (
          <Image
            source={{ uri: `data:image/jpeg;base64,${item.imageUrl}` }}
            style={styles.cardImg}
          />
        ) : (
          <View style={[styles.cardImg, styles.noImg]}>
            <Ionicons
              name="image-outline"
              size={28}
              color={Colors.textTertiary}
            />
          </View>
        )}
        <View style={styles.badgeWrap}>
          <StatusBadge status={item.status} />
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.cardDers}>{item.ders}</Text>
        <Text style={styles.cardTarih}>{formatDate(item.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Sorularım</Text>
          <Text style={styles.subtitle}>
            {sorular.length} soru ·{" "}
            {
              sorular.filter((s) =>
                ["answered", "verified", "disputed"].includes(s.status),
              ).length
            }{" "}
            cevaplandı
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.yeniBtn, uploading && styles.disabled]}
          onPress={() => setModalGorunur(true)}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="send-outline" size={16} color="#fff" />
              <Text style={styles.yeniBtnText}> Soru Sor</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {[
          { key: "hepsi", label: "Tümü" },
          { key: "bekleyen", label: "Bekleyen" },
          { key: "cevaplanan", label: "Cevaplanan" },
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

      {loading ? (
        <ActivityIndicator
          style={{ marginTop: 40 }}
          color={Colors.darkpurple}
          size="large"
        />
      ) : filtreliSorular.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="book-outline" size={48} color={Colors.textTertiary} />
          <Text style={styles.emptyText}>Henüz soru yok</Text>
        </View>
      ) : (
        <FlatList
          data={filtreliSorular}
          renderItem={renderSoru}
          keyExtractor={(i) => i._id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={{ gap: 10 }}
        />
      )}

      {/* ===== SORU SOR MODAL ===== */}
      <Modal
        visible={modalGorunur}
        animationType="slide"
        transparent={true}
        onRequestClose={modalKapat}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {adim === "ders" && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Ders Seç</Text>
                  <TouchableOpacity onPress={modalKapat}>
                    <Ionicons
                      name="close"
                      size={24}
                      color={Colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
                <ScrollView>
                  {DERSLER.map((ders) => (
                    <TouchableOpacity
                      key={ders}
                      style={styles.listeItem}
                      onPress={() => handleDersSelect(ders)}
                    >
                      <Text style={styles.listeItemText}>{ders}</Text>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={Colors.textTertiary}
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            {adim === "ogretmen" && (
              <>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setAdim("ders")}>
                    <Ionicons
                      name="arrow-back"
                      size={24}
                      color={Colors.darkpurple}
                    />
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Öğretmen Seç</Text>
                  <TouchableOpacity onPress={modalKapat}>
                    <Ionicons
                      name="close"
                      size={24}
                      color={Colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
                {teacherLoading ? (
                  <ActivityIndicator
                    color={Colors.darkpurple}
                    style={{ marginTop: 40 }}
                  />
                ) : teachers.length === 0 ? (
                  <View style={styles.emptyModal}>
                    <Text style={styles.emptyText}>
                      Bu derse ait öğretmen bulunamadı
                    </Text>
                  </View>
                ) : (
                  <ScrollView>
                    {teachers.map((t) => (
                      <TouchableOpacity
                        key={t._id}
                        style={styles.listeItem}
                        onPress={() => {
                          setSecilenOgretmen(t);
                          setAdim("foto");
                        }}
                      >
                        <View>
                          <Text style={styles.listeItemText}>{t.name}</Text>
                          <Text style={styles.listeItemSubText}>
                            {t.dersler?.join(", ")}
                          </Text>
                        </View>
                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color={Colors.textTertiary}
                        />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </>
            )}

            {adim === "foto" && (
              <>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setAdim("ogretmen")}>
                    <Ionicons
                      name="arrow-back"
                      size={24}
                      color={Colors.darkpurple}
                    />
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Fotoğraf Yükle</Text>
                  <TouchableOpacity onPress={modalKapat}>
                    <Ionicons
                      name="close"
                      size={24}
                      color={Colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.fotoSecim}>
                  <TouchableOpacity
                    style={styles.fotoBtn}
                    onPress={() => soruGonder("camera")}
                  >
                    <Ionicons
                      name="camera-outline"
                      size={48}
                      color={Colors.darkpurple}
                    />
                    <Text style={styles.fotoBtnText}>Kamera</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.fotoBtn}
                    onPress={() => soruGonder("library")}
                  >
                    <Ionicons
                      name="images-outline"
                      size={48}
                      color={Colors.darkpurple}
                    />
                    <Text style={styles.fotoBtnText}>Galeri</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ===== DETAY MODAL ===== */}
      <Modal
        visible={!!detayModal}
        transparent
        animationType="slide"
        onRequestClose={() => setDetayModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "90%" }]}>
            <View style={styles.modalHeader}>
              <StatusBadge status={detayModal?.status} />
              <Text style={styles.detayDers}>{detayModal?.ders}</Text>
              <TouchableOpacity onPress={() => setDetayModal(null)}>
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {detayModal?.imageUrl && (
                <TouchableOpacity
                  onPress={() => setBuyukImage(detayModal.imageUrl)}
                >
                  <Image
                    source={{
                      uri: `data:image/jpeg;base64,${detayModal.imageUrl}`,
                    }}
                    style={styles.detayImg}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              )}
              {["answered", "verified", "disputed"].includes(
                detayModal?.status,
              ) && (
                <View style={styles.answerBox}>
                  <Text style={styles.answerTitle}>Öğretmen Cevabı</Text>
                  {detayModal?.answer?.text && (
                    <Text style={styles.answerText}>
                      {detayModal.answer.text}
                    </Text>
                  )}
                  {detayModal?.answer?.imageUrl && (
                    <TouchableOpacity
                      onPress={() => setBuyukImage(detayModal.answer.imageUrl)}
                    >
                      <Image
                        source={{
                          uri: `data:image/jpeg;base64,${detayModal.answer.imageUrl}`,
                        }}
                        style={styles.answerImg}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  )}
                  {detayModal?.status === "answered" && !showFeedbackNote && (
                    <View style={styles.feedbackRow}>
                      <TouchableOpacity
                        style={styles.feedbackYes}
                        onPress={() => sendFeedback("correct")}
                      >
                        <Text style={styles.feedbackYesText}>✓ Doğru</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.feedbackNo}
                        onPress={() => setShowFeedbackNote(true)}
                      >
                        <Text style={styles.feedbackNoText}>✗ Yanlış</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  {showFeedbackNote && (
                    <>
                      <TextInput
                        style={styles.feedbackInput}
                        placeholder="Neyin yanlış olduğunu yazın..."
                        value={feedbackNote}
                        onChangeText={setFeedbackNote}
                        multiline
                      />
                      <TouchableOpacity
                        style={styles.feedbackNo}
                        onPress={() => sendFeedback("wrong")}
                      >
                        <Text style={styles.feedbackNoText}>Hatalı Bildir</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              )}
              {detayModal?.status === "pending" && (
                <View style={styles.pendingBox}>
                  <Text style={styles.pendingText}>
                    Öğretmen cevabı bekleniyor...
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ===== TAM EKRAN GÖRSEL MODAL ===== */}
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
          <Image
            source={{ uri: `data:image/jpeg;base64,${buyukImage}` }}
            style={styles.fullImage}
            resizeMode="contain"
          />
          <TouchableOpacity
            style={styles.fullImageClose}
            onPress={() => setBuyukImage(null)}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingBottom: 12,
  },
  title: { fontSize: 24, fontWeight: "700", color: Colors.mavi },
  subtitle: { fontSize: 13, color: "#64748b", marginTop: 2 },
  yeniBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.mavi,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  yeniBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  disabled: { opacity: 0.6 },
  tabs: {
    flexDirection: "row",
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  tab: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: "center" },
  tabActive: { backgroundColor: Colors.mavi },
  tabText: { fontSize: 13, fontWeight: "600", color: "#64748b" },
  tabTextActive: { color: "#fff" },
  grid: { paddingHorizontal: 12, paddingBottom: 20, gap: 10 },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cardImgWrap: { position: "relative" },
  cardImg: { width: "100%", aspectRatio: 1 },
  noImg: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
  },
  badgeWrap: { position: "absolute", top: 8, left: 8 },
  badge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 10, fontWeight: "700" },
  cardFooter: { padding: 8, gap: 3 },
  cardDers: { fontSize: 11, fontWeight: "700", color: Colors.mavi },
  cardTarih: { fontSize: 10, color: "#94a3b8" },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 60,
  },
  emptyText: { color: "#64748b", fontSize: 15 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "80%",
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalTitle: { fontSize: 18, fontWeight: "600", color: "#1e293b" },
  listeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  listeItemText: { fontSize: 16, color: "#1e293b" },
  listeItemSubText: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  emptyModal: { alignItems: "center", padding: 40 },
  fotoSecim: { flexDirection: "row", gap: 16, marginTop: 20 },
  fotoBtn: {
    flex: 1,
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f1f5f9",
    borderRadius: 16,
    gap: 12,
  },
  fotoBtnText: { fontSize: 14, fontWeight: "600", color: "#1e293b" },
  detayDers: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.mavi,
    flex: 1,
    marginHorizontal: 8,
  },
  detayImg: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    marginBottom: 12,
  },
  answerBox: {
    backgroundColor: "#f0fdf4",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#d1fae5",
    gap: 8,
  },
  answerTitle: { fontWeight: "700", color: "#10b981", fontSize: 14 },
  answerText: { fontSize: 14, color: "#1e293b", lineHeight: 22 },
  answerImg: { width: "100%", height: 180, borderRadius: 10 },
  feedbackRow: { flexDirection: "row", gap: 10, marginTop: 8 },
  feedbackYes: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#10b981",
    alignItems: "center",
  },
  feedbackYesText: { color: "#fff", fontWeight: "700" },
  feedbackNo: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#ef4444",
    alignItems: "center",
  },
  feedbackNoText: { color: "#fff", fontWeight: "700" },
  feedbackInput: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    color: "#1e293b",
    backgroundColor: "#fff",
    minHeight: 70,
  },
  pendingBox: {
    padding: 14,
    backgroundColor: "#fefce8",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fef08a",
    alignItems: "center",
  },
  pendingText: { color: "#eab308", fontWeight: "600", fontSize: 14 },

  // Tam ekran görsel stilleri
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

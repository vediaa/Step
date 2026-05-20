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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import api from "../../services/api";

// Sabit renkler
const C = {
  bg: "#f8f9fa",
  white: "#ffffff",
  mavi: "#3D45AA",
  purple: "rgb(165,131,146)",
  yellow: "#f8de22",
  darkred: "#a41f13",
  grey: "#9d9d9d",
  border: "#e8e8e8",
  text: "#333333",
  textSub: "#777777",
  kolay: "#f8de22", // sarı
  orta: "rgb(165,131,146)", // purple
  zor: "#a41f13", // koyu kırmızı
  cozulmemis: "#3D45AA",
};

const KATEGORILER = [
  {
    key: "cozulmemis",
    label: "Çözülmemiş",
    icon: "hourglass-outline",
    color: C.cozulmemis,
  },
  {
    key: "kolay",
    label: "Kolay",
    icon: "checkmark-circle-outline",
    color: C.kolay,
  },
  { key: "orta", label: "Orta", icon: "remove-circle-outline", color: C.orta },
  { key: "zor", label: "Zor", icon: "close-circle-outline", color: C.zor },
];

const ZORLUK_CONFIG = {
  kolay: {
    color: C.kolay,
    textColor: "#333",
    icon: "checkmark-circle-outline",
    label: "Kolay",
  },
  orta: {
    color: C.orta,
    textColor: "#fff",
    icon: "remove-circle-outline",
    label: "Orta",
  },
  zor: {
    color: C.zor,
    textColor: "#fff",
    icon: "close-circle-outline",
    label: "Zor",
  },
};

const formatDate = (d) => {
  const date = new Date(d);
  const now = new Date();
  const days = Math.floor((now - date) / 86400000);
  if (days === 0) return "Bugün";
  if (days === 1) return "Dün";
  if (days < 7) return `${days} gün önce`;
  return date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
};

export default function QuestionsScreen() {
  const insets = useSafeAreaInsets();
  const [sorular, setSorular] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [aktifKategori, setAktif] = useState("cozulmemis");
  const [seciliSoru, setSeciliSoru] = useState(null); // büyük görüntüleme
  const [kategorizeModal, setKatModal] = useState(null); // düzenleme

  useEffect(() => {
    loadSorular();
  }, []);

  const loadSorular = async () => {
    try {
      setLoading(true);
      const res = await api.get("/questions");
      if (res.data.success) setSorular(res.data.data);
    } catch {
      Alert.alert("Hata", "Sorular yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  const fotoEkle = async (source) => {
    const perm =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("İzin gerekli");
      return;
    }

    const res =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({ quality: 0.8, base64: true })
        : await ImagePicker.launchImageLibraryAsync({
            quality: 0.8,
            base64: true,
          });

    if (res.canceled) return;
    setUploading(true);
    try {
      const r = await api.post("/questions/upload", {
        foto: `data:image/jpeg;base64,${res.assets[0].base64}`,
        text: `Soru (${new Date().toLocaleString("tr-TR")})`,
        kategori: "Genel",
      });
      if (r.data.success) {
        setSorular((prev) => [r.data.data, ...prev]);
        Alert.alert("✅", "Soru eklendi!");
      }
    } catch {
      Alert.alert("Hata", "Yüklenemedi.");
    } finally {
      setUploading(false);
    }
  };

  const soruKategorize = async (cozuldu, zorluk) => {
    try {
      const res = await api.put(`/questions/${kategorizeModal._id}`, {
        cozuldu,
        zorluk,
      });
      if (res.data.success) {
        setSorular((prev) =>
          prev.map((s) => (s._id === kategorizeModal._id ? res.data.data : s)),
        );
        setKatModal(null);
      }
    } catch {
      Alert.alert("Hata", "Güncellenemedi.");
    }
  };

  const soruSil = (id) =>
    Alert.alert("Sil", "Bu soruyu silmek istiyor musun?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/questions/${id}`);
            setSorular((prev) => prev.filter((s) => s._id !== id));
          } catch {
            Alert.alert("Hata", "Silinemedi.");
          }
        },
      },
    ]);

  const filtreliSorular = sorular.filter((s) => {
    if (aktifKategori === "cozulmemis") return !s.cozuldu;
    return s.zorluk === aktifKategori;
  });

  const tabSayisi = (key) => {
    if (key === "cozulmemis") return sorular.filter((s) => !s.cozuldu).length;
    return sorular.filter((s) => s.zorluk === key && s.cozuldu).length;
  };

  const renderSoru = ({ item }) => {
    const cfg = item.cozuldu ? ZORLUK_CONFIG[item.zorluk] : null;
    return (
      <TouchableOpacity
        style={s.card}
        onPress={() => setSeciliSoru(item)}
        activeOpacity={0.9}
      >
        {/* Fotoğraf */}
        <View style={s.imgWrap}>
          {item.foto ? (
            <Image source={{ uri: item.foto }} style={s.cardImg} />
          ) : (
            <View style={[s.cardImg, s.noImg]}>
              <Ionicons name="image-outline" size={28} color={C.grey} />
            </View>
          )}
          {/* Zorluk badge */}
          {cfg && (
            <View style={[s.badge, { backgroundColor: cfg.color }]}>
              <Ionicons name={cfg.icon} size={10} color={cfg.textColor} />
              <Text style={[s.badgeText, { color: cfg.textColor }]}>
                {cfg.label}
              </Text>
            </View>
          )}
          {/* Çözülmemiş badge */}
          {!item.cozuldu && (
            <View style={[s.badge, { backgroundColor: C.cozulmemis }]}>
              <Ionicons name="hourglass-outline" size={10} color="#fff" />
              <Text style={[s.badgeText, { color: "#fff" }]}>Bekliyor</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={s.cardFooter}>
          <View style={s.dateRow}>
            <Ionicons name="calendar-outline" size={11} color={C.grey} />
            <Text style={s.dateText}>
              {formatDate(item.createdAt || item.tarih)}
            </Text>
          </View>
          <View style={s.actions}>
            <TouchableOpacity
              onPress={() => setKatModal(item)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="create-outline" size={18} color={C.mavi} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => soruSil(item._id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="trash-outline" size={18} color={C.darkred} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.title}>Sorularım</Text>
          <Text style={s.subtitle}>
            {sorular.filter((x) => !x.cozuldu).length} çözülmemiş soru
          </Text>
        </View>
        <TouchableOpacity
          style={[s.addBtn, uploading && { opacity: 0.6 }]}
          onPress={() =>
            Alert.alert("Soru Ekle", "", [
              { text: "📷 Kamera", onPress: () => fotoEkle("camera") },
              { text: "🖼 Galeri", onPress: () => fotoEkle("library") },
              { text: "İptal", style: "cancel" },
            ])
          }
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={s.addBtnText}>Yeni Soru</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Kategori tabs — yatay kaydırmalı */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.tabScroll}
        contentContainerStyle={s.tabContent}
      >
        {KATEGORILER.map((kat) => {
          const isActive = aktifKategori === kat.key;
          const sayi = tabSayisi(kat.key);
          return (
            <TouchableOpacity
              key={kat.key}
              style={[
                s.tab,
                isActive && {
                  backgroundColor: kat.color,
                  borderColor: kat.color,
                },
              ]}
              onPress={() => setAktif(kat.key)}
            >
              <Ionicons
                name={kat.icon}
                size={15}
                color={
                  isActive ? (kat.key === "kolay" ? "#333" : "#fff") : C.grey
                }
              />
              <Text
                style={[
                  s.tabText,
                  isActive && { color: kat.key === "kolay" ? "#333" : "#fff" },
                ]}
              >
                {kat.label}
              </Text>
              {sayi > 0 && (
                <View
                  style={[
                    s.tabBadge,
                    isActive && { backgroundColor: "rgba(0,0,0,0.2)" },
                  ]}
                >
                  <Text
                    style={[
                      s.tabBadgeText,
                      isActive && {
                        color: kat.key === "kolay" ? "#333" : "#fff",
                      },
                    ]}
                  >
                    {sayi}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Liste */}
      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color={C.mavi} size="large" />
        </View>
      ) : filtreliSorular.length === 0 ? (
        <View style={s.center}>
          <View style={s.emptyIcon}>
            <Ionicons name="images-outline" size={40} color={C.mavi} />
          </View>
          <Text style={s.emptyText}>Bu kategoride soru yok</Text>
          <Text style={s.emptySubtext}>
            {aktifKategori === "cozulmemis"
              ? "Yeni soru eklemek için + butonuna tıkla"
              : "Henüz bu zorlukta çözülmüş soru yok"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtreliSorular}
          renderItem={renderSoru}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={[
            s.grid,
            { paddingBottom: insets.bottom + 80 },
          ]}
          columnWrapperStyle={{ gap: 12 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* ── Büyük görüntüleme modal ── */}
      <Modal
        visible={!!seciliSoru}
        transparent
        animationType="fade"
        onRequestClose={() => setSeciliSoru(null)}
      >
        <View style={s.fullOverlay}>
          <TouchableOpacity
            style={s.closeBtn}
            onPress={() => setSeciliSoru(null)}
          >
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>
          {seciliSoru?.foto && (
            <Image
              source={{ uri: seciliSoru.foto }}
              style={s.fullImg}
              resizeMode="contain"
            />
          )}
          {/* Alt bilgi */}
          {seciliSoru?.cozuldu && ZORLUK_CONFIG[seciliSoru.zorluk] && (
            <View
              style={[
                s.fullBadge,
                { backgroundColor: ZORLUK_CONFIG[seciliSoru.zorluk].color },
              ]}
            >
              <Ionicons
                name={ZORLUK_CONFIG[seciliSoru.zorluk].icon}
                size={14}
                color={ZORLUK_CONFIG[seciliSoru.zorluk].textColor}
              />
              <Text
                style={[
                  s.fullBadgeText,
                  { color: ZORLUK_CONFIG[seciliSoru.zorluk].textColor },
                ]}
              >
                {ZORLUK_CONFIG[seciliSoru.zorluk].label}
              </Text>
            </View>
          )}
        </View>
      </Modal>

      {/* ── Kategorize modal ── */}
      <Modal
        visible={!!kategorizeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setKatModal(null)}
      >
        <View style={s.sheetOverlay}>
          <View style={s.sheet}>
            {/* Handle */}
            <View style={s.sheetHandle} />

            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>Soruyu Değerlendir</Text>
              <TouchableOpacity onPress={() => setKatModal(null)}>
                <Ionicons name="close" size={22} color={C.grey} />
              </TouchableOpacity>
            </View>

            {/* Fotoğraf önizleme */}
            {kategorizeModal?.foto && (
              <Image
                source={{ uri: kategorizeModal.foto }}
                style={s.sheetImg}
                resizeMode="contain"
              />
            )}

            <Text style={s.sheetSubtitle}>
              Bu soru için zorluk seviyesini seç:
            </Text>

            {/* Zorluk butonları */}
            <View style={s.sheetBtns}>
              <TouchableOpacity
                style={[s.sheetBtn, { backgroundColor: C.kolay }]}
                onPress={() => soruKategorize(true, "kolay")}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={22}
                  color="#333"
                />
                <View>
                  <Text style={[s.sheetBtnTitle, { color: "#333" }]}>
                    Kolay
                  </Text>
                  <Text style={[s.sheetBtnSub, { color: "#555" }]}>
                    Rahatlıkla çözdüm
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.sheetBtn, { backgroundColor: C.orta }]}
                onPress={() => soruKategorize(true, "orta")}
              >
                <Ionicons name="remove-circle-outline" size={22} color="#fff" />
                <View>
                  <Text style={[s.sheetBtnTitle, { color: "#fff" }]}>Orta</Text>
                  <Text
                    style={[s.sheetBtnSub, { color: "rgba(255,255,255,0.8)" }]}
                  >
                    Biraz zorlandım
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.sheetBtn, { backgroundColor: C.zor }]}
                onPress={() => soruKategorize(true, "zor")}
              >
                <Ionicons name="close-circle-outline" size={22} color="#fff" />
                <View>
                  <Text style={[s.sheetBtnTitle, { color: "#fff" }]}>Zor</Text>
                  <Text
                    style={[s.sheetBtnSub, { color: "rgba(255,255,255,0.8)" }]}
                  >
                    Çok zorlandım
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  s.sheetBtn,
                  {
                    backgroundColor: C.white,
                    borderWidth: 1.5,
                    borderColor: C.border,
                  },
                ]}
                onPress={() => soruKategorize(false, null)}
              >
                <Ionicons name="hourglass-outline" size={22} color={C.grey} />
                <View>
                  <Text style={[s.sheetBtnTitle, { color: C.text }]}>
                    Henüz Çözülmedi
                  </Text>
                  <Text style={[s.sheetBtnSub, { color: C.grey }]}>
                    Tekrar bakacağım
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: { fontSize: 26, fontWeight: "700", color: C.mavi },
  subtitle: { fontSize: 13, color: C.textSub, marginTop: 2 },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.mavi,
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 5,
  },
  addBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  tabScroll: { maxHeight: 48, marginBottom: 12 },
  tabContent: { paddingHorizontal: 16, gap: 8, alignItems: "center" },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  tabText: { fontSize: 13, fontWeight: "600", color: C.grey },
  tabBadge: {
    backgroundColor: "#eee",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  tabBadgeText: { fontSize: 10, fontWeight: "700", color: C.grey },
  grid: { paddingHorizontal: 16 },
  card: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  imgWrap: { position: "relative" },
  cardImg: { width: "100%", aspectRatio: 1, backgroundColor: "#f0f0f0" },
  noImg: { alignItems: "center", justifyContent: "center" },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 3,
  },
  badgeText: { fontSize: 9, fontWeight: "700" },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  dateText: { fontSize: 10, color: C.grey },
  actions: { flexDirection: "row", gap: 14 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#eef0ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyText: { fontSize: 16, fontWeight: "600", color: C.text },
  emptySubtext: {
    fontSize: 13,
    color: C.grey,
    textAlign: "center",
    paddingHorizontal: 32,
  },

  // Büyük görüntüleme
  fullOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    padding: 8,
    zIndex: 10,
  },
  fullImg: { width: "100%", height: "80%" },
  fullBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
  },
  fullBadgeText: { fontSize: 14, fontWeight: "700" },

  // Bottom sheet
  sheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 36,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: C.border,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sheetTitle: { fontSize: 18, fontWeight: "700", color: C.text },
  sheetImg: {
    width: "100%",
    height: 160,
    borderRadius: 14,
    backgroundColor: "#f0f0f0",
    marginBottom: 14,
  },
  sheetSubtitle: { fontSize: 13, color: C.textSub, marginBottom: 14 },
  sheetBtns: { gap: 10 },
  sheetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
  },
  sheetBtnTitle: { fontSize: 15, fontWeight: "700" },
  sheetBtnSub: { fontSize: 12, marginTop: 1 },
});

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import api from "../../services/api";

export default function ExamsScreen() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/exam/list")
      .then((res) => {
        if (res.data.success) setExams(res.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator
          style={{ marginTop: 60 }}
          color={Colors.purple}
          size="large"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Sınavlar</Text>
      </View>
      {exams.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons
            name="document-text-outline"
            size={48}
            color={Colors.textTertiary}
          />
          <Text style={styles.emptyText}>Henüz sınav yok</Text>
        </View>
      ) : (
        <FlatList
          data={exams}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.examCard}>
              <Text style={styles.examTitle}>
                {item.name || item.title || "Sınav"}
              </Text>
              <Text style={styles.examDate}>
                {new Date(item.createdAt).toLocaleDateString("tr-TR")}
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.darkblue },
  header: { padding: 20, paddingBottom: 12 },
  title: { fontSize: 26, fontWeight: "700", color: Colors.purple },
  list: { padding: 16, gap: 10 },
  examCard: {
    backgroundColor: Colors.bgPrimary,
    borderRadius: 14,
    padding: 16,
  },
  examTitle: { fontSize: 16, fontWeight: "600", color: Colors.textPrimary },
  examDate: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyText: { color: Colors.textSecondary, fontSize: 16 },
});

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Colors } from "../../constants/colors";
import api from "../../services/api";

export default function AnalysisScreen() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/exam/stats")
      .then((res) => {
        if (res.data.success) setStats(res.data.data);
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
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Analiz</Text>
        {!stats ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Henüz analiz verisi yok.</Text>
            <Text style={styles.emptySubtext}>
              Sınav girdikten sonra istatistiklerin burada görünecek.
            </Text>
          </View>
        ) : (
          <Text style={styles.emptyText}>Veriler yüklendi.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.darkblue },
  container: { padding: 20 },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.purple,
    marginBottom: 20,
  },
  empty: { alignItems: "center", marginTop: 60, gap: 10 },
  emptyText: { color: Colors.textSecondary, fontSize: 16, textAlign: "center" },
  emptySubtext: {
    color: Colors.textTertiary,
    fontSize: 13,
    textAlign: "center",
  },
});

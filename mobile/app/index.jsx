import { Redirect } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { View, ActivityIndicator } from "react-native";
import { Colors } from "../constants/colors";

export default function Index() {
  const { isAuthenticated, isTeacher, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Colors.darkblue,
        }}
      >
        <ActivityIndicator size="large" color={Colors.purple} />
      </View>
    );
  }

  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  // Öğretmen → Özet ekranına, Öğrenci → Dashboard'a
  if (isTeacher) return <Redirect href="/(tabs)/ogretmen-dashboard" />;
  return <Redirect href="/(tabs)/dashboard" />;
}

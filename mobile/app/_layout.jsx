import { Stack } from "expo-router";
import { ActivityIndicator, View, StatusBar } from "react-native";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { Colors } from "../constants/colors";

function RootLayoutNav() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Colors.bgPrimary,
        }}
      >
        <StatusBar barStyle="dark-content" backgroundColor={Colors.bgPrimary} />
        <ActivityIndicator size="large" color={Colors.purple} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bgPrimary }}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bgPrimary} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

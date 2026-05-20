import { Tabs, Redirect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import {
  ActivityIndicator,
  View,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Colors } from "../../constants/colors";
import { useState } from "react";
import Sidebar from "../../components/SideBar/SideBar";

const HIDE = { tabBarButton: () => null };

export default function TabLayout() {
  const { isAuthenticated, isTeacher, loading } = useAuth();
  const [sidebarVisible, setSidebarVisible] = useState(false);

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
        <ActivityIndicator size="large" color={Colors.purple} />
      </View>
    );
  }

  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors.bgPrimary,
          },
          headerTintColor: Colors.textPrimary,
          headerTitleStyle: {
            fontWeight: "600",
          },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => setSidebarVisible(true)}
              style={{ marginLeft: 16 }}
            >
              <Ionicons name="menu-outline" size={28} color={Colors.purple} />
            </TouchableOpacity>
          ),
          // ✅ NAVBAR'I TAMAMEN GİZLE
          tabBarStyle: { display: "none" },
          tabBarButton: () => null,
        }}
      >
        <Tabs.Screen
          name="dashboard"
          options={
            isTeacher
              ? HIDE
              : {
                  title: "Anasayfa",
                }
          }
        />
        <Tabs.Screen
          name="courses"
          options={
            isTeacher
              ? HIDE
              : {
                  title: "Dersler",
                }
          }
        />
        <Tabs.Screen
          name="questions"
          options={
            isTeacher
              ? HIDE
              : {
                  title: "Sorularım",
                }
          }
        />
        <Tabs.Screen
          name="ogrenci-sorular"
          options={
            isTeacher
              ? HIDE
              : {
                  title: "Soru Sor",
                }
          }
        />
        <Tabs.Screen
          name="schedule"
          options={
            isTeacher
              ? HIDE
              : {
                  title: "Program",
                }
          }
        />
        <Tabs.Screen
          name="ogretmen"
          options={
            !isTeacher
              ? HIDE
              : {
                  title: "Sorular",
                }
          }
        />
        <Tabs.Screen
          name="ogretmen-dashboard"
          options={
            !isTeacher
              ? HIDE
              : {
                  title: "Özet",
                }
          }
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profilim",
          }}
        />
        <Tabs.Screen name="exams" options={HIDE} />
        <Tabs.Screen name="analysis" options={HIDE} />
      </Tabs>

      <Sidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
      />
    </>
  );
}

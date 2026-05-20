import { View, StatusBar, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../constants/colors";

export default function SafeScreen({ children, scroll = false }) {
  const insets = useSafeAreaInsets();

  // SADECE üst padding ekle (alt padding'i tab bar halleder)
  const topPadding =
    insets.top > 0 ? insets.top : Platform.OS === "ios" ? 44 : 0;

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.background,
          paddingTop: topPadding,
        }}
      >
        {children}
      </View>
    </>
  );
}

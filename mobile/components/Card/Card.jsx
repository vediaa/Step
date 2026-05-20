import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";

const VARIANTS = {
  default: { bg: Colors.bgPrimary, border: Colors.border },
  darkblue: { bg: Colors.darkblue },
  darkpurple: { bg: Colors.darkpurple },
  mor: { bg: Colors.mor },
  logoblue: { bg: Colors.logoblue },
  primary: { bg: Colors.darkred },
  accent: { bg: Colors.accent },
  green: { bg: Colors.green },
  yellow: { bg: Colors.accent },
  white: { bg: "#fff" },
  dark: { bg: Colors.bgTertiary },
};

const Card = ({
  children,
  variant = "default",
  onClick,
  onPress,
  style,
  className,
}) => {
  const v = VARIANTS[variant] || VARIANTS.default;
  const handler = onPress || onClick;

  if (handler) {
    return (
      <TouchableOpacity
        onPress={handler}
        activeOpacity={0.85}
        style={[
          styles.card,
          { backgroundColor: v.bg },
          v.border && { borderWidth: 1.5, borderColor: v.border },
          style,
        ]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: v.bg },
        v.border && { borderWidth: 1.5, borderColor: v.border },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
  },
});

export default Card;

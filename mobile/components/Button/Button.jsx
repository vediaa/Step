import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Colors } from "../../constants/colors";

const VARIANTS = {
  primary:   { bg: Colors.mavi,      text: Colors.white },
  yellow:    { bg: Colors.yellow,    text: Colors.black },
  darkblue:  { bg: Colors.darkblue,  text: Colors.white },
  logoblue:  { bg: Colors.mavi,      text: Colors.white },
  outline:   { bg: "transparent",    text: Colors.mavi,     border: Colors.mavi },
  secondary: { bg: "#f3f4f6",        text: Colors.textPrimary },
  danger:    { bg: Colors.darkred,   text: Colors.white },
  purple:    { bg: Colors.purple,    text: Colors.white },
  neongreen: { bg: Colors.neongreen, text: Colors.white },
};

const Button = ({
  children,
  onPress,
  variant = "primary",
  disabled = false,
  fullWidth = false,
  loading = false,
  style,
}) => {
  const v = VARIANTS[variant] || VARIANTS.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.base,
        { backgroundColor: v.bg },
        v.border && { borderWidth: 2, borderColor: v.border },
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.text} size="small" />
      ) : (
        <Text style={[styles.text, { color: v.text }]}>{children}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: 15,
    paddingHorizontal: 28,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  fullWidth: { width: "100%" },
  disabled: { opacity: 0.6 },
  text: {
    fontSize: 16,
    fontWeight: "700",
  },
});

export default Button;
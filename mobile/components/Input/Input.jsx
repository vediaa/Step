import { View, TextInput, Text, StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";

const Input = ({
  type = "text",
  placeholder,
  value,
  onChangeText,
  icon,
  label,
  error,
  readOnly = false,
  secureTextEntry,
  keyboardType = "default",
  autoCapitalize = "none",
}) => {
  const isPassword = type === "password" || secureTextEntry;
  const kbType = type === "email" ? "email-address" : keyboardType;

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.container, error && styles.containerError]}>
        {icon && <View style={styles.iconWrap}>{icon}</View>}
        <TextInput
          style={[styles.input, icon && styles.inputWithIcon]}
          placeholder={placeholder}
          placeholderTextColor={Colors.grey}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword}
          keyboardType={kbType}
          autoCapitalize={isPassword ? "none" : autoCapitalize}
          editable={!readOnly}
        />
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    backgroundColor: "#f9fafb",
  },
  containerError: {
    borderColor: Colors.darkred,
  },
  iconWrap: {
    paddingLeft: 14,
    paddingRight: 4,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  inputWithIcon: {
    paddingLeft: 4,
  },
  error: {
    fontSize: 12,
    color: Colors.darkred,
    marginTop: 4,
  },
});

export default Input;

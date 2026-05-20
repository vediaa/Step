import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";

const BAR_COLORS = {
  primary: Colors.logoblue,
  accent: Colors.accent,
  success: Colors.green,
  purple: Colors.purple,
};

const ProgressBar = ({
  percentage = 0,
  color = "primary",
  showPercentage = true,
}) => {
  const pct = Math.min(100, Math.max(0, percentage));
  const barColor = BAR_COLORS[color] || BAR_COLORS.primary;

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <View
          style={[styles.fill, { width: `${pct}%`, backgroundColor: barColor }]}
        />
      </View>
      {showPercentage && <Text style={styles.label}>{Math.round(pct)}%</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "100%",
  },
  track: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.bgTertiary,
    borderRadius: 10,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textPrimary,
    minWidth: 40,
    textAlign: "right",
  },
});

export default ProgressBar;

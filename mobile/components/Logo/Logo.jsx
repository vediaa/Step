import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";

const SIZES = {
  small: { icon: 36, radius: 8, step: [6, 10, 14], stepW: 6, text: 18 },
  medium: { icon: 48, radius: 12, step: [8, 14, 20], stepW: 8, text: 24 },
  large: { icon: 64, radius: 16, step: [12, 18, 24], stepW: 10, text: 32 },
};

export default function Logo({ size = "medium" }) {
  const s = SIZES[size];
  return (
    <View style={styles.wrapper}>
      {/* İkon kutusu — web'deki gibi darkblue/logoblue gradient */}
      <View
        style={[
          styles.iconBox,
          { width: s.icon, height: s.icon, borderRadius: s.radius },
        ]}
      >
        <View style={styles.steps}>
          {s.step.map((h, i) => (
            <View
              key={i}
              style={{
                width: s.stepW,
                height: h,
                backgroundColor: Colors.white,
                borderRadius: 2,
              }}
            />
          ))}
        </View>
      </View>
      {/* STEP yazısı — web'deki gradient purple→blue efekti */}
      <Text style={[styles.text, { fontSize: s.text }]}>STEP</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconBox: {
    // Web'deki: background linear-gradient(135deg, var(--logoblue), var(--darkblue))
    backgroundColor: Colors.darkpurple,
    alignItems: "center",
    justifyContent: "center",
  },
  steps: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
  },
  text: {
    fontWeight: "700",
    color: Colors.darkpurple,
    letterSpacing: 1,
  },
});

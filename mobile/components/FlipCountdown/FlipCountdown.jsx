import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const EXAM_DATES = {
  TYT: new Date("2026-06-20T10:15:00").getTime(),
  AYT: new Date("2026-06-21T10:15:00").getTime(),
};

const TimeBox = ({ value, label }) => {
  const display = value < 10 ? `0${value}` : `${value}`;
  return (
    <View style={s.timeBox}>
      <View style={s.flipCard}>
        <Text style={s.timeValue}>{display}</Text>
      </View>
      <Text style={s.timeLabel}>{label}</Text>
    </View>
  );
};

export default function FlipCountdown() {
  const [activeExam, setActiveExam] = useState("TYT");
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const tick = () => {
      const dist = EXAM_DATES[activeExam] - Date.now();
      if (dist <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(dist / 86400000),
        hours: Math.floor((dist % 86400000) / 3600000),
        minutes: Math.floor((dist % 3600000) / 60000),
        seconds: Math.floor((dist % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [activeExam]);

  return (
    <View style={s.container}>
      <View style={s.row}>
        <TouchableOpacity
          style={[s.examBtn, activeExam === "TYT" && s.examBtnActive]}
          onPress={() => setActiveExam("TYT")}
        >
          <Text
            style={[s.examBtnText, activeExam === "TYT" && s.examBtnTextActive]}
          >
            TYT
          </Text>
        </TouchableOpacity>

        <View style={s.clockRow}>
          <TimeBox value={timeLeft.days} label="GÜN" />
          <Text style={s.sep}>:</Text>
          <TimeBox value={timeLeft.hours} label="SAAT" />
          <Text style={s.sep}>:</Text>
          <TimeBox value={timeLeft.minutes} label="DAKİKA" />
          <Text style={s.sep}>:</Text>
          <TimeBox value={timeLeft.seconds} label="SANİYE" />
        </View>

        <TouchableOpacity
          style={[s.examBtn, activeExam === "AYT" && s.examBtnActive]}
          onPress={() => setActiveExam("AYT")}
        >
          <Text
            style={[s.examBtnText, activeExam === "AYT" && s.examBtnTextActive]}
          >
            AYT
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const PURPLE = "rgb(165, 131, 146)";
const GREY = "#9d9d9d";
const WHITE = "#ffffff";

const s = StyleSheet.create({
  container: {
    backgroundColor: WHITE,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 10,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  examBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    minWidth: 52,
    alignItems: "center",
  },
  examBtnActive: {
    backgroundColor: PURPLE,
    borderColor: PURPLE,
  },
  examBtnText: {
    fontSize: 16,
    fontWeight: "800",
    color: GREY,
  },
  examBtnTextActive: {
    color: WHITE,
  },
  clockRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 3,
  },
  timeBox: {
    alignItems: "center",
    gap: 4,
  },
  flipCard: {
    backgroundColor: "#1f2937",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 7,
    minWidth: 42,
    alignItems: "center",
  },
  timeValue: {
    fontSize: 20,
    fontWeight: "800",
    color: WHITE,
  },
  timeLabel: {
    fontSize: 8,
    fontWeight: "700",
    color: GREY,
    letterSpacing: 0.3,
  },
  sep: {
    fontSize: 20,
    fontWeight: "800",
    color: GREY,
    marginTop: 8,
  },
});

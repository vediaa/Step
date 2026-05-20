import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import api from "../../services/api";

export default function CoursesScreen() {
  const [curriculum, setCurriculum] = useState({ tyt: [], ayt: [] });
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("tyt");
  const [expandedSubject, setExpandedSubject] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [currRes, progRes] = await Promise.all([
        api.get("/progress/curriculum"),
        api.get("/progress"),
      ]);
      setCurriculum(currRes.data);
      setProgress(progRes.data.progress || {});
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const toggleTopic = async (subjectId, topicId) => {
    setProgress((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      if (!next[subjectId]) next[subjectId] = {};
      next[subjectId][topicId] = !next[subjectId][topicId];
      return next;
    });
    try {
      const res = await api.post("/progress/toggle", {
        subjectId: String(subjectId),
        topicId: String(topicId),
      });
      setProgress((prev) => {
        const next = { ...prev };
        if (!next[subjectId]) next[subjectId] = {};
        next[subjectId][topicId] = res.data.completed;
        return next;
      });
    } catch {
      loadData();
    }
  };

  const getPercent = (subjectId, topics) => {
    if (!topics?.length) return 0;
    const done = topics.filter(
      (t) => progress[subjectId]?.[t.id] === true,
    ).length;
    return Math.round((done / topics.length) * 100);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={Colors.purple} size="large" />
      </View>
    );
  }

  const SECTIONS = [
    { key: "tyt", label: "TYT Dersleri", color: Colors.mavi },
    { key: "ayt", label: "AYT Dersleri", color: Colors.neongreen },
  ];

  return (
    <View style={styles.container}>
      {/* TYT / AYT sekme */}
      <View style={styles.sectionTabs}>
        {SECTIONS.map((s) => (
          <TouchableOpacity
            key={s.key}
            style={[
              styles.sectionTab,
              activeSection === s.key && { backgroundColor: s.color },
            ]}
            onPress={() => {
              setActiveSection(s.key);
              setExpandedSubject(null);
            }}
          >
            <Text
              style={[
                styles.sectionTabText,
                activeSection === s.key && styles.sectionTabTextActive,
              ]}
            >
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {(curriculum[activeSection] || []).map((subject) => {
          const pct = getPercent(subject.id, subject.topics);
          const isExpanded = expandedSubject === subject.id;
          const sectionColor = SECTIONS.find(
            (s) => s.key === activeSection,
          )?.color;

          return (
            <View key={subject.id} style={styles.subjectCard}>
              {/* Ders başlığı */}
              <TouchableOpacity
                style={[
                  styles.subjectHeader,
                  { backgroundColor: sectionColor },
                ]}
                onPress={() =>
                  setExpandedSubject(isExpanded ? null : subject.id)
                }
              >
                <Text style={styles.subjectTitle}>{subject.name}</Text>
                <View style={styles.progressRow}>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${pct}%`, backgroundColor: Colors.white },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>{pct}%</Text>
                  <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={Colors.white}
                  />
                </View>
              </TouchableOpacity>

              {/* Konular */}
              {isExpanded && (
                <View style={styles.topicsContainer}>
                  {subject.topics.map((topic) => {
                    const done = progress[subject.id]?.[topic.id] === true;
                    return (
                      <TouchableOpacity
                        key={topic.id}
                        style={styles.topicRow}
                        onPress={() => toggleTopic(subject.id, topic.id)}
                      >
                        <View
                          style={[
                            styles.checkbox,
                            done && {
                              backgroundColor: sectionColor,
                              borderColor: sectionColor,
                            },
                          ]}
                        >
                          {done && (
                            <Ionicons
                              name="checkmark"
                              size={13}
                              color={Colors.white}
                            />
                          )}
                        </View>
                        <Text
                          style={[styles.topicText, done && styles.topicDone]}
                        >
                          {topic.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  sectionTabs: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  sectionTab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  sectionTabText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  sectionTabTextActive: {
    color: Colors.white,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  subjectCard: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  subjectHeader: {
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  subjectTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressTrack: {
    width: 50,
    height: 8,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "700",
    minWidth: 32,
  },
  topicsContainer: {
    backgroundColor: Colors.surface,
    paddingVertical: 4,
  },
  topicRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.textSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  topicText: {
    fontSize: 15,
    color: Colors.text,
    flex: 1,
  },
  topicDone: {
    textDecorationLine: "line-through",
    color: Colors.textTertiary,
  },
});

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import api from "../../services/api";

const WEEKDAYS = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"];

export default function ScheduleScreen() {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [tasks, setTasks] = useState({});
  const [newTask, setNewTask] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [showCalendar, setShowCalendar] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get("/tasks");
      const formatted = {};
      res.data.forEach((task) => {
        const dateKey = task.date.split("T")[0];
        if (!formatted[dateKey]) formatted[dateKey] = [];
        formatted[dateKey].push({
          id: task._id || task.id,
          text: task.text,
          completed: task.completed,
        });
      });
      setTasks(formatted);
    } catch {}
  };

  const generateCalendarDays = () => {
    const [year, month] = selectedDate.split("-");
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    let startDow = firstDay.getDay();
    startDow = startDow === 0 ? 6 : startDow - 1;
    const days = [];
    for (let i = 0; i < startDow; i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(i);
    return days;
  };

  const changeMonth = (dir) => {
    const [year, month] = selectedDate.split("-").map(Number);
    const d = new Date(year, month - 1 + dir, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    setSelectedDate(`${y}-${m}-01`);
  };

  const selectDay = (day) => {
    if (!day) return;
    const [year, month] = selectedDate.split("-");
    setSelectedDate(`${year}-${month}-${String(day).padStart(2, "0")}`);
    setShowCalendar(false);
  };

  const toggleTask = async (taskId) => {
    const current = tasks[selectedDate]?.find((t) => t.id === taskId);
    const newStatus = !current?.completed;
    setTasks((prev) => ({
      ...prev,
      [selectedDate]: prev[selectedDate].map((t) =>
        t.id === taskId ? { ...t, completed: newStatus } : t,
      ),
    }));
    try {
      await api.put(`/tasks/${taskId}`, { completed: newStatus });
    } catch {}
  };

  const handleSubmit = async () => {
    if (!newTask.trim()) return;
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, {
          text: newTask,
          date: selectedDate,
        });
      } else {
        await api.post("/tasks/create", {
          text: newTask,
          date: selectedDate,
          completed: false,
        });
      }
      setNewTask("");
      setEditingTask(null);
      fetchTasks();
    } catch {
      Alert.alert("Hata", "Kaydedilemedi.");
    }
  };

  const deleteTask = (taskId) => {
    Alert.alert("Sil", "Bu görevi silmek istiyor musun?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/tasks/${taskId}`);
            setTasks((prev) => ({
              ...prev,
              [selectedDate]: prev[selectedDate].filter((t) => t.id !== taskId),
            }));
          } catch {}
        },
      },
    ]);
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("tr-TR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  const calDays = generateCalendarDays();
  const dayTasks = tasks[selectedDate] || [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Takvim toggle */}
      <TouchableOpacity
        style={styles.toggleBtn}
        onPress={() => setShowCalendar(!showCalendar)}
      >
        <Ionicons name="calendar-outline" size={20} color={Colors.white} />
        <Text style={styles.toggleText}>{formatDate(selectedDate)}</Text>
        <Ionicons
          name={showCalendar ? "chevron-up" : "chevron-down"}
          size={18}
          color={Colors.white}
        />
      </TouchableOpacity>

      {/* Takvim */}
      {showCalendar && (
        <View style={styles.calendar}>
          <View style={styles.calHeader}>
            <TouchableOpacity onPress={() => changeMonth(-1)}>
              <Ionicons name="chevron-back" size={22} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.calMonth}>
              {new Date(selectedDate).toLocaleDateString("tr-TR", {
                month: "long",
                year: "numeric",
              })}
            </Text>
            <TouchableOpacity onPress={() => changeMonth(1)}>
              <Ionicons name="chevron-forward" size={22} color={Colors.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.calWeekRow}>
            {WEEKDAYS.map((d) => (
              <Text key={d} style={styles.calWeekday}>
                {d}
              </Text>
            ))}
          </View>

          <View style={styles.calDaysGrid}>
            {calDays.map((day, i) => {
              const dateStr = day
                ? `${selectedDate.substring(0, 8)}${String(day).padStart(2, "0")}`
                : null;
              const hasTask = dateStr && tasks[dateStr]?.length > 0;
              const isSelected = dateStr === selectedDate;
              const isToday = dateStr === today;
              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.calDay,
                    isSelected && styles.calDaySelected,
                    !day && styles.calDayEmpty,
                  ]}
                  onPress={() => selectDay(day)}
                  disabled={!day}
                >
                  <Text
                    style={[
                      styles.calDayText,
                      isSelected && styles.calDayTextSelected,
                      isToday && !isSelected && styles.calDayToday,
                    ]}
                  >
                    {day || ""}
                  </Text>
                  {hasTask && <View style={styles.calDot} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Görevler listesi */}
      <View style={styles.taskList}>
        {dayTasks.length === 0 ? (
          <View style={styles.emptyTasks}>
            <Text style={styles.emptyTasksText}>Bu tarih için görev yok</Text>
          </View>
        ) : (
          dayTasks.map((task) => (
            <View key={task.id} style={styles.taskCard}>
              <TouchableOpacity
                style={styles.taskCheckRow}
                onPress={() => toggleTask(task.id)}
              >
                <View
                  style={[
                    styles.checkbox,
                    task.completed && styles.checkboxDone,
                  ]}
                >
                  {task.completed && (
                    <Ionicons name="checkmark" size={14} color={Colors.white} />
                  )}
                </View>
                <Text
                  style={[
                    styles.taskText,
                    task.completed && styles.taskTextDone,
                  ]}
                >
                  {task.text}
                </Text>
              </TouchableOpacity>
              <View style={styles.taskActions}>
                <TouchableOpacity
                  onPress={() => {
                    setEditingTask(task);
                    setNewTask(task.text);
                  }}
                >
                  <Ionicons
                    name="pencil-outline"
                    size={18}
                    color={Colors.textSecondary}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteTask(task.id)}>
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color={Colors.darkred}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Görev ekleme formu */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder={editingTask ? "Görevi düzenle..." : "Yeni görev ekle..."}
          placeholderTextColor={Colors.textTertiary}
          value={newTask}
          onChangeText={setNewTask}
          onSubmitEditing={handleSubmit}
        />
        <TouchableOpacity style={styles.addBtn} onPress={handleSubmit}>
          <Ionicons
            name={editingTask ? "checkmark" : "add"}
            size={24}
            color={Colors.white}
          />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  toggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.darkpurple,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  toggleText: {
    flex: 1,
    color: Colors.white,
    fontSize: 16,
    fontWeight: "500",
  },
  calendar: {
    backgroundColor: Colors.darkpurple,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  calHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  calMonth: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  calWeekRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  calWeekday: {
    flex: 1,
    textAlign: "center",
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "600",
  },
  calDaysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calDay: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  calDayEmpty: { opacity: 0 },
  calDaySelected: { backgroundColor: Colors.neongreen },
  calDayText: { color: Colors.white, fontSize: 14 },
  calDayTextSelected: { color: Colors.white, fontWeight: "700" },
  calDayToday: { color: Colors.yellow, fontWeight: "700" },
  calDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.yellow,
    marginTop: 2,
  },
  taskList: {
    gap: 8,
    marginBottom: 16,
  },
  emptyTasks: {
    padding: 24,
    alignItems: "center",
  },
  emptyTasksText: {
    color: Colors.textSecondary,
    fontSize: 15,
  },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  taskCheckRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
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
  checkboxDone: {
    backgroundColor: Colors.neongreen,
    borderColor: Colors.neongreen,
  },
  taskText: {
    fontSize: 15,
    color: Colors.text,
    flex: 1,
  },
  taskTextDone: {
    textDecorationLine: "line-through",
    color: Colors.textTertiary,
  },
  taskActions: {
    flexDirection: "row",
    gap: 10,
  },
  form: {
    flexDirection: "row",
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.darkpurple,
    alignItems: "center",
    justifyContent: "center",
  },
});

import { useState, useEffect } from "react";
import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import "./DersProgrami.css";
import { FiCalendar, FiEdit3, FiTrash2 } from "react-icons/fi";

const DersProgrami = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [tasks, setTasks] = useState({});
  const [newTask, setNewTask] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const API_BASE_URL = "http://localhost:5001/api/tasks";

  // --- YENİ EKLENEN KISIM: VERİLERİ VERİTABANINDAN ÇEKME ---
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_BASE_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      // Backend'den gelen düz listeyi { "2025-12-21": [...] } formatına çeviriyoruz
      const formattedTasks = {};
      data.forEach((task) => {
        // Backend'den gelen tarih "2025-12-21T00:00:00.000Z" ise sadece tarih kısmını al
        const dateKey = task.date.split("T")[0];
        if (!formattedTasks[dateKey]) {
          formattedTasks[dateKey] = [];
        }
        formattedTasks[dateKey].push({
          id: task._id || task.id, // MongoDB'den geliyorsa _id kullanır
          text: task.text,
          completed: task.completed,
        });
      });
      setTasks(formattedTasks);
    } catch (error) {
      console.error("Görevler yüklenirken hata:", error);
    }
  };
  // -------------------------------------------------------

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { weekday: "long", day: "numeric", month: "long" };
    return date.toLocaleDateString("tr-TR", options);
  };

  // Takvim günlerini oluştur - PAZARTESİ BAŞLANGIÇLI
  const generateCalendarDays = () => {
    const [year, month] = selectedDate.split("-");
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();

    // getDay() -> Pazar:0, Pazartesi:1... Cumartesi:6 döner.
    let startingDayOfWeek = firstDay.getDay();

    // Pazar(0) ise onu 6 yapıyoruz, diğerlerinden 1 çıkarıyoruz.
    // Böylece Pazartesi:0, Salı:1 ... Pazar:6 oluyor.
    startingDayOfWeek = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

    const days = [];
    // Önceki ayın boşlukları (Pazartesi'ye göre)
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Bu ayın günleri
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  // Önceki/sonraki ay - GÜNCELLENDİ
  const changeMonth = (direction) => {
    const [year, month] = selectedDate.split("-").map(Number);

    // Yeni ayı hesapla (JavaScript Date objesi 12. ayı otomatik olarak sonraki yıla aktarır)
    const newDate = new Date(year, month - 1 + direction, 1);

    // Yılı ve Ayı manuel formatlıyoruz (toISOString saat farkı hatasını önlemek için)
    const newYear = newDate.getFullYear();
    const newMonth = String(newDate.getMonth() + 1).padStart(2, "0");
    const newDay = "01"; // Ay değişiminde her zaman ayın 1'ine gitsin

    const newDateString = `${newYear}-${newMonth}-${newDay}`;
    setSelectedDate(newDateString);
  };

  const toggleTaskCompletion = async (taskId) => {
    // 1. Önce Frontend'de durumu değiştir (Hızlı tepki için)
    const currentTask = tasks[selectedDate].find((t) => t.id === taskId);
    const newStatus = !currentTask.completed;

    setTasks((prev) => ({
      ...prev,
      [selectedDate]: prev[selectedDate].map((task) =>
        task.id === taskId ? { ...task, completed: newStatus } : task
      ),
    }));

    // 2. Backend'i güncelle (API'de toggle endpoint'in yoksa PUT kullan)
    try {
      await fetch(`${API_BASE_URL}/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ completed: newStatus }),
      });
    } catch (e) {
      console.error("Tamamlama durumu güncellenemedi");
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const token = localStorage.getItem("token");

    if (editingTask) {
      // GÜNCELLEME
      const response = await fetch(`${API_BASE_URL}/${editingTask.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newTask, date: selectedDate }),
      });

      if (response.ok) fetchTasks(); // Veritabanından güncel hali çek
    } else {
      // YENİ EKLEME
      const response = await fetch(`${API_BASE_URL}/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: newTask,
          date: selectedDate,
          completed: false,
        }),
      });

      if (response.ok) fetchTasks(); // Veritabanından güncel hali çek
    }

    setEditingTask(null);
    setNewTask("");
  };

  const deleteTask = async (taskId) => {
    if (window.confirm("Bu görevi silmek istediğinize emin misiniz?")) {
      const response = await fetch(`${API_BASE_URL}/${taskId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (response.ok) {
        // Frontend state'inden de sil
        setTasks((prev) => ({
          ...prev,
          [selectedDate]: prev[selectedDate].filter((t) => t.id !== taskId),
        }));
      }
    }
  };

  const editTask = (task) => {
    setEditingTask(task);
    setNewTask(task.text);
  };

  const selectDay = (day) => {
    if (!day) return;
    const [year, month] = selectedDate.split("-");
    const newDate = `${year}-${month.padStart(2, "0")}-${String(day).padStart(
      2,
      "0"
    )}`;
    setSelectedDate(newDate);
    setShowCalendar(false);
  };

  return (
    <div className="ders-programi-container">
      <div className="ders-programi-content">
        <button
          className="calendar-toggle-button"
          onClick={() => setShowCalendar(!showCalendar)}
        >
          <FiCalendar className="calendar-icon" />

          <span className="calendar-date-text">{formatDate(selectedDate)}</span>
          <span className="calendar-arrow">{showCalendar ? "▲" : "▼"}</span>
        </button>

        {showCalendar && (
          <Card className="calendar-card">
            <div className="calendar-header">
              <button
                className="calendar-nav-button"
                onClick={() => changeMonth(-1)}
              >
                ◀
              </button>
              <span className="calendar-month-year">
                {new Date(selectedDate).toLocaleDateString("tr-TR", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <button
                className="calendar-nav-button"
                onClick={() => changeMonth(1)}
              >
                ▶
              </button>
            </div>
            <div className="calendar-grid">
              <div className="calendar-weekdays">
                {["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"].map((day) => (
                  <div key={day} className="calendar-weekday">
                    {day}
                  </div>
                ))}
              </div>
              <div className="calendar-days">
                {generateCalendarDays().map((day, index) => {
                  const dateString = day
                    ? `${selectedDate.substring(0, 8)}${String(day).padStart(
                        2,
                        "0"
                      )}`
                    : null;
                  const hasTask =
                    dateString &&
                    tasks[dateString] &&
                    tasks[dateString].length > 0;
                  const isSelected = dateString === selectedDate;

                  return (
                    <button
                      key={index}
                      className={`calendar-day ${
                        !day ? "calendar-day-empty" : ""
                      } ${isSelected ? "calendar-day-selected" : ""} ${
                        hasTask ? "calendar-day-marked" : ""
                      }`}
                      onClick={() => selectDay(day)}
                      disabled={!day}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>
        )}

        <div className="tasks-list">
          {(tasks[selectedDate] || []).length === 0 ? (
            <Card>
              <p className="no-tasks-text">
                Bu tarih için henüz görev eklenmemiş.
              </p>
            </Card>
          ) : (
            tasks[selectedDate].map((task) => (
              <Card key={task.id} className="task-card">
                <div className="task-content">
                  <button
                    className="task-checkbox-container"
                    onClick={() => toggleTaskCompletion(task.id)}
                  >
                    <div
                      className={`task-checkbox ${
                        task.completed ? "task-checkbox-completed" : ""
                      }`}
                    >
                      {task.completed && <span className="checkmark">✓</span>}
                    </div>
                    <span
                      className={`task-text ${
                        task.completed ? "task-text-completed" : ""
                      }`}
                    >
                      {task.text}
                    </span>
                  </button>
                  <div className="task-actions">
                    <button
                      className="task-edit-button"
                      onClick={() => editTask(task)}
                    >
                      <FiEdit3 size={18} />
                    </button>
                    <button
                      className="task-delete-button"
                      onClick={() => deleteTask(task.id)}
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        <form onSubmit={handleTaskSubmit} className="add-task-form">
          <input
            type="text"
            className="task-input"
            placeholder={
              editingTask ? "Görevi düzenle..." : "Yeni görev ekle..."
            }
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
          />
          <button type="submit" className="add-task-button">
            {editingTask ? "✓" : "+"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DersProgrami;

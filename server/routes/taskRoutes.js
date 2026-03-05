import express from "express";
import {
  createTask,
  getTasks,
  getTasksGroupedByDate,
  getTaskById,
  updateTask,
  toggleTaskCompletion,
  deleteTask,
  getIncompleteTasks,
  getTaskStats,
} from "../controllers/taskController.js";
import auth from "../middleware/userAuth.js";

const router = express.Router();

// Tüm route'lar auth middleware ile korunuyor

// Görev oluştur
router.post("/create", auth, createTask);

// Tüm görevleri getir (query ile filtreleme yapılabilir)
// Örnek: GET /api/tasks?date=2024-12-20
// Örnek: GET /api/tasks?month=12&year=2024
router.get("/", auth, getTasks);

// Tarihe göre gruplu görevleri getir
// Frontend için pratik: { "2024-12-20": [...tasks], "2024-12-21": [...tasks] }
router.get("/grouped", auth, getTasksGroupedByDate);

// İstatistikleri getir
router.get("/stats", auth, getTaskStats);

// Tamamlanmamış görevleri getir
router.get("/incomplete", auth, getIncompleteTasks);

// Belirli bir görevi getir
router.get("/:id", auth, getTaskById);

// Görev güncelle
router.put("/:id", auth, updateTask);

// Görev tamamlama durumunu değiştir
router.patch("/:id/toggle", auth, toggleTaskCompletion);

// Görev sil
router.delete("/:id", auth, deleteTask);

export default router;
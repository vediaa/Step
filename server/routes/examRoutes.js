import express from "express";
import {
  createExam,
  getExams,
  getExamById,
  deleteExam,
  updateExam,
  getExamStats,
} from "../controllers/examController.js";
import auth from "../middleware/userAuth.js";

const router = express.Router();

// Tüm route'lar auth middleware ile korunuyor

// Deneme oluştur
router.post("/create", auth, createExam);

// Tüm denemeleri getir
router.get("/", auth, getExams);

// İstatistikleri getir
router.get("/stats", auth, getExamStats);

// Belirli bir denemeyi getir
router.get("/:id", auth, getExamById);

// Deneme güncelle
router.put("/:id", auth, updateExam);

// Deneme sil
router.delete("/:id", auth, deleteExam);

export default router;

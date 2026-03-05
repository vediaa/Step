import express from "express";
import {
  uploadQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  getQuestionStats,
  deleteMultipleQuestions,
} from "../controllers/questionController.js";
import auth from "../middleware/userAuth.js";

const router = express.Router();

// Tüm route'lar auth middleware ile korunuyor

// Soru yükle (fotoğraf ile)
router.post("/upload", auth, uploadQuestion);

// Tüm soruları getir (query ile filtreleme yapılabilir)
// Örnek: GET /api/questions?cozuldu=false
// Örnek: GET /api/questions?zorluk=kolay
// Örnek: GET /api/questions?kategori=Matematik
router.get("/", auth, getQuestions);

// İstatistikleri getir
router.get("/stats", auth, getQuestionStats);

// Belirli bir soruyu getir
router.get("/:id", auth, getQuestionById);

// Soruyu güncelle (kategorize et)
router.put("/:id", auth, updateQuestion);

// Soruyu sil
router.delete("/:id", auth, deleteQuestion);

// Toplu silme
router.post("/delete-multiple", auth, deleteMultipleQuestions);

export default router; 

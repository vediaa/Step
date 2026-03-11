import express from "express";
import {
  createExam,
  getExams,
  getExamById,
  updateExam,
  deleteExam,
  getAnalytics,
  getSubjectAnalysis,
} from "../controllers/examController.js";
import auth from "../middleware/userAuth.js";

const router = express.Router();

// Tüm route'lar auth middleware ile korunuyor

// Analytics endpointleri ÖNCE (çünkü :id ile çakışmasın)
router.get("/analytics/overview", auth, getAnalytics);
router.get("/analytics/subject/:subject", auth, getSubjectAnalysis);

// CRUD İşlemleri
router.post("/", auth, createExam);           // Yeni deneme oluştur
router.get("/", auth, getExams);              // Tüm denemeleri getir
router.get("/:id", auth, getExamById);        // Tek deneme getir
router.put("/:id", auth, updateExam);         // Deneme güncelle
router.delete("/:id", auth, deleteExam);      // Deneme sil

export default router;

// ========================================
// server.js'e EKLENECEK:
// ========================================
/*
import examRoutes from "./routes/examRoutes.js";
import targetRoutes from "./routes/targetRoutes.js";

app.use("/api/exams", examRoutes);
app.use("/api/targets", targetRoutes);
*/

// ========================================
// KULLANIM ÖRNEKLERİ:
// ========================================

/*

✅ BACKEND HAZIR - TÜM ENDPOİNTLER:

1. DENEME İŞLEMLERİ:
   POST   /api/exams                        → Yeni deneme
   GET    /api/exams                        → Tüm denemeler
   GET    /api/exams?type=TYT               → TYT denemeleri
   GET    /api/exams?type=AYT&branch=Sayısal → AYT Sayısal
   GET    /api/exams/:id                    → Tek deneme
   PUT    /api/exams/:id                    → Deneme güncelle
   DELETE /api/exams/:id                    → Deneme sil

2. ANALİZ:
   GET    /api/exams/analytics/overview     → Genel analiz
   GET    /api/exams/analytics/subject/matematik?type=TYT → Ders analizi

3. HEDEFLER:
   POST   /api/targets                      → Hedef kaydet
   GET    /api/targets                      → Hedefleri getir
   GET    /api/targets/stats                → İstatistikler
   POST   /api/targets/recalculate-stats    → Stats yeniden hesapla

*/

/* import express from "express";
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
 */
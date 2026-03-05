import express from "express";
import {
  getProgress,
  updateProgress,
  toggleTopic,
  getCurriculum,
  getProgressStats,
  resetProgress,
} from "../controllers/progressController.js";
import auth from "../middleware/userAuth.js";

const router = express.Router();

// Tüm route'lar auth middleware ile korunuyor

// Curriculum'u getir (sabit veri)
router.get("/curriculum", auth, getCurriculum);

// Kullanıcının ilerlemesini getir
router.get("/", auth, getProgress);

// İlerleme istatistiklerini getir
router.get("/stats", auth, getProgressStats); //çalışıyor artık. map mantığı ile
// İlerlemeyi güncelle (tüm progress objesini) //buna bak
router.put("/", auth, updateProgress);

// Tek bir konuyu tamamla/geri al burada ilerleme akydedeiliyor
router.post("/toggle", auth, toggleTopic);

// İlerlemeyi sıfırla
router.delete("/reset", auth, resetProgress);

export default router;
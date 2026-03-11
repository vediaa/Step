/* import express from "express";
import { getTargets, updateTargets } from "../controllers/targetController.js";
import auth from "../middleware/userAuth.js";

const router = express.Router();

// Kullanıcının hedeflerini getir
router.get("/", auth, getTargets);

// Hedefleri güncelle veya oluştur
router.put("/", auth, updateTargets);

export default router; */


// ========================================
// Target Routes (targetRoutes.js)
// ========================================

import express from "express";
import {
  saveTargets,
  getTargets,
  getUserStats,
  recalculateStats,
} from "../controllers/targetController.js";
import auth from "../middleware/userAuth.js";

const router = express.Router();

router.post("/", auth, saveTargets);                    // Hedefleri kaydet
router.get("/", auth, getTargets);                      // Hedefleri getir
router.get("/stats", auth, getUserStats);               // İstatistikleri getir
router.post("/recalculate-stats", auth, recalculateStats); // İstatistikleri yeniden hesapla

export default router;

// ========================================
// server.js'e eklenecek:
// ========================================
/*
import targetRoutes from "./routes/targetRoutes.js";
app.use("/api/targets", targetRoutes);
*/

// ========================================
// KULLANIM ÖRNEKLERİ:
// ========================================

/*

1. HEDEFLERİ KAYDET
POST /api/targets
Body: {
  "branch": "Sayısal",
  "tytNet": 90,
  "aytNet": 70
}

Response: {
  "success": true,
  "message": "Hedefler başarıyla kaydedildi",
  "data": {
    "branch": "Sayısal",
    "tytNet": 90,
    "aytNet": 70,
    "updatedAt": "2024-03-15T10:30:00.000Z"
  }
}

---

2. HEDEFLERİ GETİR
GET /api/targets

Response: {
  "success": true,
  "data": {
    "branch": "Sayısal",
    "tytNet": 90,
    "aytNet": 70,
    "updatedAt": "2024-03-15T10:30:00.000Z"
  }
}

---

3. İSTATİSTİKLERİ GETİR
GET /api/targets/stats

Response: {
  "success": true,
  "data": {
    "stats": {
      "totalExams": 35,
      "averageNet": 68.5,
      "bestNet": 85.2,
      "improvement": {
        "first5Avg": 55.3,
        "last5Avg": 75.8,
        "totalChange": 20.5
      },
      "targetReachedCount": 15,
      "targetReachedPercentage": 42.9
    },
    "targets": {
      "branch": "Sayısal",
      "tytNet": 90,
      "aytNet": 70
    }
  }
}

---

4. İSTATİSTİKLERİ YENİDEN HESAPLA
POST /api/targets/recalculate-stats

Response: {
  "success": true,
  "message": "İstatistikler yeniden hesaplandı",
  "data": { ... updated stats ... }
}

*/
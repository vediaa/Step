/* import express from "express";
import multer from "multer";
import { askQuestion } from "../controllers/question_dbController.js";
import  userAuth  from "../middleware/userAuth.js"; // mevcut middleware

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // buffer olarak al

router.post("/ask", userAuth, upload.single("image"), askQuestion);

export default router; */
//kullandığım
// 
/* 
import express from "express";
import multer from "multer";
import { askQuestion } from "../controllers/question_dbController.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

 Dosyayı diske kaydetmiyoruz — buffer üzerinde işliyoruz
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

 POST /api/questions_db/ask
router.post("/ask", userAuth, upload.single("image"), askQuestion);

export default router; */
/* 
import express from "express";
import multer from "multer";
import {
  askQuestion,
  getMyQuestions,
  getAllQuestions,
  answerQuestion,
} from "../controllers/question_dbController.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// POST /api/questions_db/ask          → Öğrenci soru gönderir (görsel + form-data)
router.post("/ask", userAuth, upload.single("image"), askQuestion);

// GET  /api/questions_db/my           → Öğrenci kendi sorularını listeler
router.get("/my", userAuth, getMyQuestions);

// GET  /api/questions_db/all          → Öğretmen tüm soruları görür
router.get("/all", userAuth, getAllQuestions);

// PUT  /api/questions_db/:id/answer   → Öğretmen soruyu cevaplar
router.put("/:id/answer", userAuth, answerQuestion);

export default router; */

/* import express from "express";
import multer from "multer";
import {
  askQuestion,
  getMyQuestions,
  getTeacherInbox,
  getTeachersByDers,
  answerQuestion,
  getAllQuestions,
} from "../controllers/question_dbController.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// ── Öğrenci ───────────────────────────────────────────────────────────────────
// Ders seçince o dersteki öğretmenleri listele
router.get("/teachers", userAuth, getTeachersByDers);

// Soru gönder (öğretmen + ders seçili olmalı)
router.post("/ask", userAuth, upload.single("image"), askQuestion);

// Kendi sorularım
router.get("/my", userAuth, getMyQuestions);

// ── Öğretmen ─────────────────────────────────────────────────────────────────
// Gelen sorular (sadece kendisine ait)
router.get("/teacher-inbox", userAuth, getTeacherInbox);

// Soruyu cevapla (metin + opsiyonel fotoğraf)
router.put("/:id/answer", userAuth, answerQuestion);

// ── Admin ─────────────────────────────────────────────────────────────────────
router.get("/all", userAuth, getAllQuestions);


export default router;
 */


import express from "express";
import multer from "multer";
import {
  askQuestion,
  getMyQuestions,
  getTeacherInbox,
  getTeachersByDers,
  answerQuestion,
  giveFeedback,
  getDisputedQuestions,
  getAllQuestions,
} from "../controllers/question_dbController.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// ── Öğrenci ───────────────────────────────────────────────────────────────────
router.get("/teachers",          userAuth, getTeachersByDers);   // ders seçince öğretmenler
router.post("/ask",              userAuth, upload.single("image"), askQuestion);
router.get("/my",                userAuth, getMyQuestions);
router.put("/:id/feedback",      userAuth, giveFeedback);        // doğrula veya hatalı bildir

// ── Öğretmen ─────────────────────────────────────────────────────────────────
router.get("/teacher-inbox",     userAuth, getTeacherInbox);     // gelen sorular
router.get("/disputed",          userAuth, getDisputedQuestions);// hatalı bildirilenler
router.put("/:id/answer",        userAuth, answerQuestion);      // cevap gönder

// ── Admin ─────────────────────────────────────────────────────────────────────
router.get("/all",               userAuth, getAllQuestions);

export default router;
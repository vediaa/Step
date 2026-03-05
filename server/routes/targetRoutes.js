import express from "express";
import { getTargets, updateTargets } from "../controllers/targetController.js";
import auth from "../middleware/userAuth.js";

const router = express.Router();

// Kullanıcının hedeflerini getir
router.get("/", auth, getTargets);

// Hedefleri güncelle veya oluştur
router.put("/", auth, updateTargets);

export default router;
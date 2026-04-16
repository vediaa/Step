import express from "express";
import multer from "multer";
import { askQuestion } from "../controllers/question_dbController.js";
import  userAuth  from "../middleware/userAuth.js"; // mevcut middleware

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // buffer olarak al

router.post("/ask", userAuth, upload.single("image"), askQuestion);

export default router;
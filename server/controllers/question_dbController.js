
import mongoose from "mongoose";
import { atlasConnection } from "../config/mongoDB.js";
import { processQuestion } from "../services/questionService.js";
import User from "../models/user.js";

// ─── Atlas Model ──────────────────────────────────────────────────────────────
const AskedQuestionSchema = new mongoose.Schema(
  {
    studentId:        { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    teacherId:        { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    sourceQuestionId: { type: mongoose.Schema.Types.ObjectId, default: null },
    imageUrl:         { type: String, required: true },
    extractedText:    { type: String, default: "" },
    embedding:        { type: [Number], default: [] },
    ders:             { type: String, default: "Genel" },
    status: {
      type: String,
      enum: ["pending", "answered", "verified", "disputed"],
      default: "pending",
    },
    answer: {
      text:       { type: String, default: "" },
      imageUrl:   { type: String, default: "" },
      answeredAt: { type: Date, default: null },
    },
    feedback: {
      type:    { type: String, enum: ["correct", "wrong", null], default: null },
      note:    { type: String, default: "" },
      givenAt: { type: Date, default: null },
    },
    isDuplicate:      { type: Boolean, default: false },
    linkedQuestionId: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { timestamps: true }
);

const getAtlasModel = () => {
  if (!atlasConnection) throw new Error("Atlas bağlantısı hazır değil");
  if (atlasConnection.models["questions"]) return atlasConnection.models["questions"];
  return atlasConnection.model("questions", AskedQuestionSchema);
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/questions_db/ask
// ─────────────────────────────────────────────────────────────────────────────
export const askQuestion = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Fotoğraf gerekli." });
    }

    const { ders, teacherId } = req.body;
    const studentId = req.user._id;

    if (!teacherId) return res.status(400).json({ success: false, message: "Öğretmen seçin." });
    if (!ders)      return res.status(400).json({ success: false, message: "Ders seçin." });

    const teacher = await User.findOne({ _id: teacherId, role: "teacher" }).lean();
    if (!teacher) return res.status(404).json({ success: false, message: "Öğretmen bulunamadı." });

    const result = await processQuestion({ imageBuffer: req.file.buffer, studentId, teacherId, ders });

    if (result.isDuplicate && result.answered) {
      return res.status(200).json({
        success: true, status: "duplicate_answered",
        message: "Bu soru daha önce çözülmüş!", answer: result.answer, extractedText: result.extractedText,
      });
    }
    if (result.isDuplicate && !result.answered) {
      return res.status(200).json({
        success: true, status: "duplicate_pending",
        message: "Bu soru zaten öğretmene iletildi.", linkedQuestionId: result.linkedQuestionId, extractedText: result.extractedText,
      });
    }
    return res.status(201).json({
      success: true, status: "sent_to_teacher",
      message: `Soru ${teacher.name} öğretmene iletildi`, questionId: result.questionId, extractedText: result.extractedText,
    });
  } catch (error) {
    console.error("❌ askQuestion:", error.message);
    if (error.message === "Görsel okunamadı") {
      return res.status(422).json({ success: false, message: "Görsel okunamadı." });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/questions_db/my  →  Öğrenci kendi sorularını görür
// ─────────────────────────────────────────────────────────────────────────────
export const getMyQuestions = async (req, res) => {
  try {
    const AtlasQuestion = getAtlasModel();
    const sorular = await AtlasQuestion
      .find({ studentId: req.user._id })
      .select("-embedding")
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ success: true, data: sorular });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Sorular alınamadı" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/questions_db/teacher-inbox  →  Öğretmen gelen sorularını görür
// ─────────────────────────────────────────────────────────────────────────────
export const getTeacherInbox = async (req, res) => {
  try {
    const AtlasQuestion = getAtlasModel();
    const teacherId = req.user._id;

    const teacher = await User.findById(teacherId).lean();
    if (!teacher || teacher.role !== "teacher") {
      return res.status(403).json({ success: false, message: "Sadece öğretmenler erişebilir." });
    }

    const sorular = await AtlasQuestion
      .find({ teacherId })
      .select("-embedding")
      .sort({ createdAt: -1 })
      .lean();

    // Öğrenci isimlerini ekle
    const studentIds = [...new Set(sorular.map((s) => s.studentId?.toString()))];
    const students   = await User.find({ _id: { $in: studentIds } }).select("name").lean();
    const studentMap = Object.fromEntries(students.map((s) => [s._id.toString(), s.name]));

    const enriched = sorular.map((s) => ({
      ...s,
      studentName: studentMap[s.studentId?.toString()] || "Öğrenci",
    }));

    return res.status(200).json({ success: true, data: enriched });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Gelen kutusu alınamadı" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/questions_db/teachers?ders=Matematik
// ─────────────────────────────────────────────────────────────────────────────
export const getTeachersByDers = async (req, res) => {
  try {
    const { ders } = req.query;
    const filter = { role: "teacher" };
    if (ders && ders !== "Tümü") filter.dersler = { $in: [ders] };

    const teachers = await User.find(filter).select("name dersler biyografi").lean();
    return res.status(200).json({ success: true, data: teachers });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Öğretmenler alınamadı" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
/* // PUT /api/questions_db/:id/answer  →  Öğretmen cevap gönderir CLOUDE YAZDI
// ─────────────────────────────────────────────────────────────────────────────
 export const answerQuestion = async (req, res) => {
  try {
    const AtlasQuestion = getAtlasModel();
    const { id } = req.params;
    const { answerText, answerImageBase64 } = req.body;
    const teacherId = req.user._id;

    if (!answerText?.trim() && !answerImageBase64) {
      return res.status(400).json({ success: false, message: "Cevap metni veya fotoğraf gerekli." });
    }

    const soru = await AtlasQuestion.findById(id).lean();
    if (!soru) return res.status(404).json({ success: false, message: "Soru bulunamadı." });

    if (soru.teacherId?.toString() !== teacherId.toString()) {
      return res.status(403).json({ success: false, message: "Bu soruyu cevaplama yetkiniz yok." });
    }

    const updated = await AtlasQuestion.findByIdAndUpdate(
      id,
      {
        // Disputed sorular tekrar answered olur, öğrenci tekrar doğrulayabilir
        status: "answered",
        "answer.text":       answerText?.trim() || "",
        "answer.imageUrl":   answerImageBase64  || "",
        "answer.answeredAt": new Date(),
        // Önceki feedback'i temizle (yeniden çözüm gönderildi)
        "feedback.type":    null,
        "feedback.note":    "",
        "feedback.givenAt": null,
      },
      { new: true, select: "-embedding" }
    ).lean();

    console.log("✅ Cevap kaydedildi:", updated._id);
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Cevap kaydedilemedi" });
  }
};  */

 // PUT /api/questions_db/:id/answer
export const answerQuestion = async (req, res) => {
  try {
    const AtlasQuestion = getAtlasModel();
    const { id } = req.params;
    const { answerText, answerImageBase64 } = req.body;
    const teacherId = req.user._id;

    if (!answerText?.trim() && !answerImageBase64) {
      return res.status(400).json({ success: false, message: "Cevap metni veya fotoğraf gerekli." });
    }

    const soru = await AtlasQuestion.findById(id).lean();
    if (!soru) return res.status(404).json({ success: false, message: "Soru bulunamadı." });

    if (soru.teacherId?.toString() !== teacherId.toString()) {
      return res.status(403).json({ success: false, message: "Bu soruyu cevaplama yetkiniz yok." });
    }

    // 🔧 ESKİ CEVABI HISTORY'E KAYDET
    const answerHistory = soru.answerHistory || [];
    if (soru.answer?.text || soru.answer?.imageUrl) {
      answerHistory.push({
        text: soru.answer.text,
        imageUrl: soru.answer.imageUrl,
        answeredAt: soru.answer.answeredAt || new Date(),
      });
    }

    const updated = await AtlasQuestion.findByIdAndUpdate(
      id,
      {
        status: "answered",
        "answer.text": answerText?.trim() || "",
        "answer.imageUrl": answerImageBase64 || "",
        "answer.answeredAt": new Date(),
        "feedback.type": null,
        "feedback.note": "",
        "feedback.givenAt": null,
        answerHistory: answerHistory,
      },
      { new: true, select: "-embedding" }
    ).lean();

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Cevap kaydedilemedi" });
  }
}; 
// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/questions_db/:id/feedback  →  Öğrenci cevabı doğrular veya hatalı bildirir
// body: { type: "correct" | "wrong", note: string (opsiyonel) }
// ─────────────────────────────────────────────────────────────────────────────
export const giveFeedback = async (req, res) => {
  try {
    const AtlasQuestion = getAtlasModel();
    const { id }  = req.params;
    const { type, note } = req.body;
    const studentId = req.user._id;

    if (!["correct", "wrong"].includes(type)) {
      return res.status(400).json({ success: false, message: "type 'correct' veya 'wrong' olmalı." });
    }

    const soru = await AtlasQuestion.findById(id).lean();
    if (!soru) return res.status(404).json({ success: false, message: "Soru bulunamadı." });

    // Sadece soruyu soran öğrenci geri bildirim verebilir
    if (soru.studentId?.toString() !== studentId.toString()) {
      return res.status(403).json({ success: false, message: "Sadece soruyu soran öğrenci geri bildirim verebilir." });
    }

    // Sadece answered durumundaki sorulara geri bildirim verilebilir
    if (soru.status !== "answered") {
      return res.status(400).json({ success: false, message: "Bu soru henüz cevaplanmamış." });
    }

    const yeniStatus = type === "correct" ? "verified" : "disputed";

    const updated = await AtlasQuestion.findByIdAndUpdate(
      id,
      {
        status: yeniStatus,
        "feedback.type":    type,
        "feedback.note":    note || "",
        "feedback.givenAt": new Date(),
      },
      { new: true, select: "-embedding" }
    ).lean();

    console.log(`✅ Geri bildirim: ${type} → status: ${yeniStatus}`);
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Geri bildirim kaydedilemedi" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/questions_db/disputed  →  Öğretmen hatalı bildirilen soruları görür
// ─────────────────────────────────────────────────────────────────────────────
export const getDisputedQuestions = async (req, res) => {
  try {
    const AtlasQuestion = getAtlasModel();
    const teacherId = req.user._id;

    const sorular = await AtlasQuestion
      .find({ teacherId, status: "disputed" })
      .select("-embedding")
      .sort({ updatedAt: -1 })
      .lean();

    const studentIds = [...new Set(sorular.map((s) => s.studentId?.toString()))];
    const students   = await User.find({ _id: { $in: studentIds } }).select("name").lean();
    const studentMap = Object.fromEntries(students.map((s) => [s._id.toString(), s.name]));

    const enriched = sorular.map((s) => ({
      ...s,
      studentName: studentMap[s.studentId?.toString()] || "Öğrenci",
    }));

    return res.status(200).json({ success: true, data: enriched });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Disputed sorular alınamadı" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/questions_db/all  →  Admin
// ─────────────────────────────────────────────────────────────────────────────
export const getAllQuestions = async (req, res) => {
  try {
    const AtlasQuestion = getAtlasModel();
    const user = await User.findById(req.user._id).lean();
    if (!user || user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Sadece admin erişebilir." });
    }
    const sorular = await AtlasQuestion.find({}).select("-embedding").sort({ createdAt: -1 }).lean();
    return res.status(200).json({ success: true, data: sorular });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Sorular alınamadı" });
  }
};
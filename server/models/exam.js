
import mongoose from "mongoose";

// Ders Skoru için Sub-Schema
const ScoreSchema = new mongoose.Schema({
  correct: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  wrong: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
}, { _id: false }); // _id oluşturma, sadece embedded document

// Ana Exam Schema - Mobil koddaki veri yapısına uygun
const ExamSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["TYT", "AYT"],
      required: true,
    },
    // Ders skorları - mobil koddaki scores objesine uygun
    scores: {
      // TYT Dersleri
      turkce: ScoreSchema,
      matematik: ScoreSchema,
      sosyal: ScoreSchema,
      fen: ScoreSchema,
      // AYT Dersleri
      aytMatematik: ScoreSchema,
      aytFen: ScoreSchema,
      aytEdebiyat: ScoreSchema,
      aytSosyal1: ScoreSchema,
      aytSosyal2: ScoreSchema,
    },
    totalNet: {
      type: Number,
      required: true,
    },
    // Kayıt anındaki hedef bölümü sakla
    targetBranchAtExamTime: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true, // createdAt ve updatedAt otomatik eklenir
  }
);

// Index'ler - performans için
ExamSchema.index({ userId: 1, createdAt: -1 });
ExamSchema.index({ userId: 1, type: 1 });

const Exam = mongoose.models.Exam || mongoose.model("Exam", ExamSchema);

export default Exam;
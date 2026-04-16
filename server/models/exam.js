
import mongoose from "mongoose";
//
// Soru limitleri (Validation için)
export const EXAM_LIMITS = {
  TYT: {
    turkce: { max: 40, name: "Türkçe" },
    matematik: { max: 40, name: "Matematik" },
    sosyal: { max: 20, name: "Sosyal Bilimler" },
    fen: { max: 20, name: "Fen Bilimleri" },
  },
  AYT: {
    // Sayısal
    aytMatematik: { max: 40, name: "Matematik" },
    aytFizik: { max: 14, name: "Fizik" },
    aytKimya: { max: 13, name: "Kimya" },
    aytBiyoloji: { max: 13, name: "Biyoloji" },
    
    // Sözel
    aytEdebiyat: { max: 24, name: "Edebiyat" },
    aytTarih1: { max: 10, name: "Tarih-1" },
    aytCografya1: { max: 6, name: "Coğrafya-1" },
    aytTarih2: { max: 11, name: "Tarih-2" },
    aytCografya2: { max: 11, name: "Coğrafya-2" },
    aytFelsefe: { max: 12, name: "Felsefe" },
    aytDin: { max: 6, name: "Din Kültürü" },
    
    // Dil
    aytDil: { max: 80, name: "Yabancı Dil" },
  },
};

// Her ders için skor şeması
const ScoreSchema = new mongoose.Schema(
  {
    dogru: { type: Number, default: 0, min: 0 },
    yanlis: { type: Number, default: 0, min: 0 },
    bos: { type: Number, default: 0, min: 0 },
    net: { type: Number, default: 0 },
  },
  { _id: false }
);

// Ana Deneme Şeması
const ExamSchema = new mongoose.Schema(
  {
    // Kullanıcı
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Temel Bilgiler
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    
    type: {
      type: String,
      enum: ["TYT", "AYT"],
      required: true,
    },
    
    branch: {
      type: String,
      enum: ["Sayısal", "Eşit Ağırlık", "Sözel", "Dil", null],
      default: null,
    },
    
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },

    // TYT Skorları
    tytScores: {
      turkce: ScoreSchema,
      matematik: ScoreSchema,
      sosyal: ScoreSchema,
      fen: ScoreSchema,
    },

    // AYT Skorları (Tüm dersler - kullanılan dersler branch'e göre değişir)
    aytScores: {
      aytMatematik: ScoreSchema,
      aytFizik: ScoreSchema,
      aytKimya: ScoreSchema,
      aytBiyoloji: ScoreSchema,
      aytEdebiyat: ScoreSchema,
      aytTarih1: ScoreSchema,
      aytCografya1: ScoreSchema,
      aytTarih2: ScoreSchema,
      aytCografya2: ScoreSchema,
      aytFelsefe: ScoreSchema,
      aytDin: ScoreSchema,
      aytDil: ScoreSchema,
    },

    // Toplam İstatistikler
    totalNet: {
      type: Number,
      required: true,
      default: 0,
    },
    
    totalDogru: {
      type: Number,
      default: 0,
    },
    
    totalYanlis: {
      type: Number,
      default: 0,
    },
    
    totalBos: {
      type: Number,
      default: 0,
    },

    // Hedef Karşılaştırması
    targetNet: {
      type: Number,
      default: null,
    },
    
    targetReached: {
      type: Boolean,
      default: false,
    },
    
    targetDifference: {
      type: Number,
      default: null,
    },

    // Ek Bilgiler
    duration: {
      type: Number, // Dakika
      default: null,
    },
    
    difficulty: {
      type: String,
      enum: ["Kolay", "Orta", "Zor", null],
      default: null,
    },
    
    notes: {
      type: String,
      maxlength: 500,
      default: "",
    },
    
    // Yayın Evi / Kaynak
    source: {
      type: String,
      maxlength: 100,
      default: "",
    },
  },
  {
    timestamps: true, // createdAt, updatedAt otomatik
  }
);

// Index'ler (Performans için)
ExamSchema.index({ userId: 1, date: -1 });
ExamSchema.index({ userId: 1, type: 1 });
ExamSchema.index({ userId: 1, branch: 1 });
ExamSchema.index({ userId: 1, totalNet: -1 });

// Virtual: Denemenin kaç gün önce çözüldüğü
ExamSchema.virtual("daysAgo").get(function () {
  const now = new Date();
  const examDate = new Date(this.date);
  const diffTime = Math.abs(now - examDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Instance Method: Toplam istatistikleri hesapla
ExamSchema.methods.calculateTotals = function () {
  let totalDogru = 0;
  let totalYanlis = 0;
  let totalBos = 0;

  // TYT toplamları
  if (this.type === "TYT" && this.tytScores) {
    Object.values(this.tytScores).forEach((score) => {
      if (score) {
        totalDogru += score.dogru || 0;
        totalYanlis += score.yanlis || 0;
        totalBos += score.bos || 0;
      }
    });
  }

  // AYT toplamları
  if (this.type === "AYT" && this.aytScores) {
    Object.values(this.aytScores).forEach((score) => {
      if (score) {
        totalDogru += score.dogru || 0;
        totalYanlis += score.yanlis || 0;
        totalBos += score.bos || 0;
      }
    });
  }

  this.totalDogru = totalDogru;
  this.totalYanlis = totalYanlis;
  this.totalBos = totalBos;
};

// Instance Method: Hedef karşılaştırması
ExamSchema.methods.compareWithTarget = function (targetNet) {
  if (!targetNet) {
    this.targetReached = false;
    this.targetDifference = null;
    return;
  }

  this.targetNet = targetNet;
  this.targetReached = this.totalNet >= targetNet;
  this.targetDifference = parseFloat(
    (this.totalNet - targetNet).toFixed(2)
  );
};

const Exam = mongoose.models.Exam || mongoose.model("Exam", ExamSchema);

export default Exam;

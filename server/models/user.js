import mongoose from "mongoose";

const UserTargetSchema = new mongoose.Schema(
  {
    branch: {
      type: String,
      enum: ["Sayısal", "Eşit Ağırlık", "Sözel", "Dil", null],
      default: null,
    },
    tytNet: {
      type: Number,
      default: null,
      min: 0,
      max: 120,
    },
    aytNet: {
      type: Number,
      default: null,
      min: 0,
      max: 80,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const UserStatsSchema = new mongoose.Schema(
  {
    // Toplam Denemeler
    totalExams: { type: Number, default: 0 },
    totalTytExams: { type: Number, default: 0 },
    totalAytExams: { type: Number, default: 0 },

    // Ortalamalar
    averageNet: { type: Number, default: 0 },
    averageTytNet: { type: Number, default: 0 },
    averageAytNet: { type: Number, default: 0 },

    // En İyi ve En Kötü
    bestNet: { type: Number, default: 0 },
    worstNet: { type: Number, default: null },
    bestTytNet: { type: Number, default: 0 },
    bestAytNet: { type: Number, default: 0 },

    // İlerleme
    improvement: {
      // İlk 5 deneme ortalaması vs Son 5 deneme ortalaması
      first5Avg: { type: Number, default: 0 },
      last5Avg: { type: Number, default: 0 },
      totalChange: { type: Number, default: 0 },
    },

    // Hedef İstatistikleri
    targetReachedCount: { type: Number, default: 0 },
    targetMissedCount: { type: Number, default: 0 },
    targetReachedPercentage: { type: Number, default: 0 },

    // Son Güncelleme
    lastUpdated: { type: Date, default: Date.now },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verifyOtp: { type: String, default: "" }, //one time pasword doğrulama
    verifyOtpExpireAt: { type: Number, default: 0 }, //geçerlilik süresi
    isAccountVerified: { type: Boolean, default: false }, //hesap doğrulandı mı
    resetOtp: { type: String, default: "" },
    resetOtpExpireAt: { type: Number, default: 0 },
    newPassword: { type: String, default: "" },

    aktif: { type: Boolean, default: false },
    aktivasyonKodu: { type: String },
    kodSonTarih: { type: Date },
    sifreSifirlaKodu: { type: String },
    sifreSifirlaSonTarih: { type: Date },
     // 👇 YENİ EKLEDİKLERİMİZ
    targets:UserTargetSchema,
    stats:UserStatsSchema
  },
  { timestamps: true }
  //Bir verinin ne zaman oluşturulduğunu ve ne zaman değiştirildiğini otomatik bilmek
);

//Eğer mongoose.models içinde "user" (veya "Kullanici") modeli zaten varsa, yeniden oluşturma → onu kullan.
const User = mongoose.models.user || mongoose.model("user", UserSchema); //mongo baş harfi kü.ültüp sonuna s ekleyecek
export default User;

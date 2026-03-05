import mongoose from "mongoose";

// Soru Schema'sı
const QuestionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    // Fotoğraf (Base64 string veya URL)
    foto: {
      type: String,
      required: true,
    },
    // Çözülme durumu
    cozuldu: {
      type: Boolean,
      default: false,
    },
    // Zorluk seviyesi
    zorluk: {
      type: String,
      enum: ["kolay", "orta", "zor", null],
      default: null,
    },
    // Kategoriler (opsiyonel - gelecekte kullanılabilir)
    kategori: {
      type: String,
      default: "Genel",
    },
    ders: {
      type: String,
      default: "",
    },
    // Notlar (opsiyonel)
    notlar: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // createdAt ve updatedAt
  }
);

// Index'ler
// Buradaki index yapısına bir bak!
QuestionSchema.index({ userId: 1, createdAt: -1 });
QuestionSchema.index({ userId: 1, cozuldu: 1 });
QuestionSchema.index({ userId: 1, zorluk: 1 });

const Question =  mongoose.models.Question || mongoose.model("Question", QuestionSchema);

export default Question;

 


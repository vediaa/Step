import mongoose from "mongoose";

// Kullanıcının ders konularındaki ilerlemesini tutan schema
const ProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Her kullanıcının tek bir ilerleme kaydı
      index: true,
    },
    // İlerleme verisi: { subjectId: { topicId: true/false } }
    // Örnek: { "1": { "1": true, "2": false }, "2": { "1": true } }
    progress: {
      type: Map,
      of: Map, // Nested Map yapısı
      default: {},
    },
    // Alternatif olarak Mixed type kullanabiliriz
    // progress: {
    //   type: mongoose.Schema.Types.Mixed,
    //   default: {},
    // },
  },
  {
    timestamps: true,
  }
);

// Virtual field - toplam tamamlanan konu sayısı
ProgressSchema.virtual("totalCompleted").get(function () {
  let total = 0;
  if (this.progress) {
    for (const [subjectId, topics] of this.progress) {
      if (topics instanceof Map) {
        for (const [topicId, completed] of topics) {
          if (completed) total++;
        }
      } else if (typeof topics === "object") {
        total += Object.values(topics).filter(Boolean).length;
      }
    }
  }
  return total;
});

const Progress =
  mongoose.models.Progress || mongoose.model("Progress", ProgressSchema);

export default Progress;
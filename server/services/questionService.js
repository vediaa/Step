
import { atlasConnection } from "../config/mongoDB.js";
import { extractTextFromImage } from "./visionService.js";
import { getEmbedding } from "./embeddingService.js";
import mongoose from "mongoose";

const SIMILARITY_THRESHOLD = 0.95;

const AskedQuestionSchema = new mongoose.Schema(
  {
    studentId:        { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    teacherId:        { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    sourceQuestionId: { type: mongoose.Schema.Types.ObjectId, default: null },
    imageUrl:         { type: String, required: true },
    extractedText:    { type: String, default: "" },
    embedding:        { type: [Number], default: [] },
    ders:             { type: String, default: "Genel" },

    // pending   → öğretmen henüz cevaplamadı
    // answered  → öğretmen cevapladı, öğrenci doğrulamadı
    // verified  → öğrenci doğruladı, aynı soru gelirse direkt döner
    // disputed  → öğrenci hatalı dedi, öğretmen inceliyor
    status: {
      type: String,
      enum: ["pending", "answered", "verified", "disputed"],
      default: "pending",
    },

    // AskedQuestionSchema'ya şu alanı ekleyin:
    answerHistory: {
      type: [{
        text: { type: String, default: "" },
        imageUrl: { type: String, default: "" },
        answeredAt: { type: Date, default: Date.now },
      }],
      default: [],
    },
    
    answer: {
      text:       { type: String, default: "" },
      imageUrl:   { type: String, default: "" },
      answeredAt: { type: Date,   default: null },
    },

    // Öğrencinin geri bildirimi
    feedback: {
      type:    { type: String, enum: ["correct", "wrong", null], default: null },
      note:    { type: String, default: "" },
      givenAt: { type: Date,   default: null },
    },

    isDuplicate:      { type: Boolean, default: false },
    linkedQuestionId: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { timestamps: true }
);

const getAtlasModel = () => {
  if (!atlasConnection) throw new Error("Atlas bağlantısı henüz hazır değil");
  if (atlasConnection.models["questions"]) return atlasConnection.models["questions"];
  return atlasConnection.model("questions", AskedQuestionSchema);
};

// ─── Vector Search ────────────────────────────────────────────────────────────
// SADECE verified sorular aranır.
// answered, disputed, pending olanlar duplicate olarak dönmez.
const findSimilarQuestion = async (embedding, ders) => {
  const AtlasQuestion = getAtlasModel();

  const results = await AtlasQuestion.aggregate([
    {
      $vectorSearch: {
        index: "vector_index",
        path: "embedding",
        queryVector: embedding,
        numCandidates: 100,
        limit: 5,
      },
    },
    { $addFields: { score: { $meta: "vectorSearchScore" } } },
    {
      $match: {
        score:  { $gte: SIMILARITY_THRESHOLD },
        ders,
        status: "verified", // sadece öğrenci onaylamış sorular
      },
    },
    { $project: { embedding: 0 } },
    { $limit: 1 },
  ]);

  if (results.length > 0) {
    console.log(`⚠️ Verified benzer soru — skor: ${(results[0].score * 100).toFixed(2)}%`);
    return results[0];
  }

  console.log("🆕 Verified benzer soru yok, kaydedilecek.");
  return null;
};

// ─── Ana İş Akışı ─────────────────────────────────────────────────────────────
export const processQuestion = async ({
  imageBuffer,
  studentId,
  teacherId,
  ders = "Genel",
}) => {
  const AtlasQuestion = getAtlasModel();

  // 1. OCR
  const extractedText = await extractTextFromImage(imageBuffer);

  // 2. Embedding
  const embedding = await getEmbedding(extractedText);

  // 3. Benzer verified soru var mı?
  const similar = await findSimilarQuestion(embedding, ders);

  if (similar) {
    if (similar.answer?.text || similar.answer?.imageUrl) {
      return {
        isDuplicate: true,
        answered:    true,
        answer:      similar.answer,
        extractedText,
      };
    }
    return {
      isDuplicate:      true,
      answered:         false,
      linkedQuestionId: similar._id,
      extractedText,
      message: "Bu soru zaten öğretmene iletildi, cevap bekleniyor.",
    };
  }

  // 4. Yeni soru — kaydet
  const asked = await AtlasQuestion.create({
    studentId,
    teacherId,
    imageUrl:      imageBuffer.toString("base64"),
    extractedText,
    embedding,
    ders,
    status:      "pending",
    isDuplicate: false,
  });

  console.log("✅ Yeni soru kaydedildi:", asked._id);

  return {
    isDuplicate: false,
    questionId:  asked._id,
    extractedText,
  };
};
/* import AskedQuestion from "../models/askedQuestion.js";
import { extractTextFromImage } from "./visionService.js";
import { getEmbedding } from "./embeddingService.js";

const SIMILARITY_THRESHOLD = 0.95;

const findSimilarQuestion = async (embedding) => {
  const results = await AskedQuestion.aggregate([
    {
      $vectorSearch: {
        index: "vector_index",
        path: "embedding",
        queryVector: embedding,
        numCandidates: 100,
        limit: 1,
      },
    },
    {
      $project: {
        extractedText: 1,
        answer: 1,
        isDuplicate: 1,
        score: { $meta: "vectorSearchScore" },
      },
    },
  ]);

  if (results.length > 0 && results[0].score >= SIMILARITY_THRESHOLD) {
    return results[0];
  }

  return null;
};

export const processQuestion = async ({
  imageBuffer,
  studentId,
  sourceQuestionId = null,
  ders = "Genel",
}) => {
  // 1. Vision API - metni çıkar
  const extractedText = await extractTextFromImage(imageBuffer);

  // 2. Embedding al
  const embedding = await getEmbedding(extractedText);

  // 3. Benzer soru var mı?
  const similar = await findSimilarQuestion(embedding);

  if (similar) {
    console.log("🔁 Duplicate bulundu, skor:", similar.score);

    // Cevabı olan bir duplicate
    if (similar.answer?.text) {
      return {
        isDuplicate: true,
        answered: true,
        answer: similar.answer,
        extractedText,
      };
    }

    // Benzer soru var ama henüz cevaplanmamış
    return {
      isDuplicate: true,
      answered: false,
      linkedQuestionId: similar._id,
      extractedText,
      message: "Bu soru zaten öğretmene iletildi, cevap bekleniyor.",
    };
  }

  // 4. Yeni soru — kaydet ve öğretmene gönder
  const asked = await AskedQuestion.create({
    studentId,
    sourceQuestionId: sourceQuestionId || null,
    imageUrl: imageBuffer.toString("base64"),
    extractedText,
    embedding,
    ders,
    status: "pending",
    isDuplicate: false,
  });

  console.log("✅ Yeni soru kaydedildi:", asked._id);

  return {
    isDuplicate: false,
    questionId: asked._id,
    extractedText,
  };
}; */
/* 
import { atlasConnection } from "../config/mongoDB.js";
import { extractTextFromImage } from "./visionService.js";
import { getEmbedding } from "./embeddingService.js";

const SIMILARITY_THRESHOLD = 0.95;

// ─── Atlas connection üzerinden AskedQuestion modeli ─────────────────────────
// mongoose.model() değil — createConnection().model() kullanıyoruz
// Çünkü config/mongoDB.js'de atlasConnection = mongoose.createConnection(ATLAS_URI)
import mongoose from "mongoose";

const AskedQuestionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sourceQuestionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      default: null,
    },
    imageUrl: { type: String, required: true },
    extractedText: { type: String, default: "" },
    embedding: { type: [Number], default: [] },
    ders: { type: String, default: "Genel" },
    status: {
      type: String,
      enum: ["pending", "answered"],
      default: "pending",
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    answer: {
      text: { type: String, default: "" },
      imageUrl: { type: String, default: "" },
      answeredAt: { type: Date, default: null },
    },
    isDuplicate: { type: Boolean, default: false },
    linkedQuestionId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  { timestamps: true }
);

// atlasConnection hazır olduğunda modeli ona bağlıyoruz
// "questions" → Atlas'taki collection adın (askedQuestion.js ile aynı)
const getAtlasModel = () => {
  // Bağlantı henüz hazır değilse hata fırlat
  if (!atlasConnection) {
    throw new Error("Atlas bağlantısı henüz hazır değil");
  }
  // Aynı connection'da model zaten varsa tekrar oluşturma
  if (atlasConnection.models["questions"]) {
    return atlasConnection.models["questions"];
  }
  return atlasConnection.model("questions", AskedQuestionSchema);
};

// ─── Vector Search ────────────────────────────────────────────────────────────
const findSimilarQuestion = async (embedding) => {
  const AtlasQuestion = getAtlasModel();

  const results = await AtlasQuestion.aggregate([
    {
      $vectorSearch: {
        index: "vector_index",
        path: "embedding",
        queryVector: embedding,
        numCandidates: 100,
        limit: 1,
      },
    },
    {
      $project: {
        extractedText: 1,
        answer: 1,
        isDuplicate: 1,
        ders: 1,
        createdAt: 1,
        score: { $meta: "vectorSearchScore" },
      },
    },
  ]);

  if (results.length > 0 && results[0].score >= SIMILARITY_THRESHOLD) {
    console.log(`⚠️ Benzer soru bulundu — skor: ${(results[0].score * 100).toFixed(2)}%`);
    return results[0];
  }

  console.log("🆕 Benzer soru yok, yeni kayıt oluşturulacak.");
  return null;
};

// ─── Ana İş Akışı ─────────────────────────────────────────────────────────────
export const processQuestion = async ({
  imageBuffer,
  studentId,
  sourceQuestionId = null,
  ders = "Genel",
}) => {
  const AtlasQuestion = getAtlasModel();

  // 1. Vision API → OCR + temizleme
  const extractedText = await extractTextFromImage(imageBuffer);

  // 2. Embedding üret
  const embedding = await getEmbedding(extractedText);

  // 3. Duplicate kontrolü
  const similar = await findSimilarQuestion(embedding);

  if (similar) {
    // Cevabı olan bir duplicate
    if (similar.answer?.text) {
      return {
        isDuplicate: true,
        answered: true,
        answer: similar.answer,
        extractedText,
      };
    }

    // Benzer var ama cevaplanmamış
    return {
      isDuplicate: true,
      answered: false,
      linkedQuestionId: similar._id,
      extractedText,
      message: "Bu soru zaten öğretmene iletildi, cevap bekleniyor.",
    };
  }

  // 4. Yeni soru → Atlas'a kaydet
  const asked = await AtlasQuestion.create({
    studentId,
    sourceQuestionId: sourceQuestionId || null,
    imageUrl: imageBuffer.toString("base64"),
    extractedText,
    embedding,
    ders,
    status: "pending",
    isDuplicate: false,
  });

  console.log("✅ Yeni soru Atlas'a kaydedildi:", asked._id);

  return {
    isDuplicate: false,
    questionId: asked._id,
    extractedText,
  };
}; */

/* 
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

status: {
  type: String,
  enum: ["pending", "answered", "reported", "soft_banned", "verified"],
  default: "pending",
},

reportCount: { type: Number, default: 0 },

reportedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
// Aynı öğrenci 2 kez şikayet etmesin diye

moderationNote: { type: String, default: "" },
// Moderatörün neden onayladığı/reddettiği
    answer: {
      text:        { type: String, default: "" },
      imageUrl:    { type: String, default: "" },
      answeredAt:  { type: Date, default: null },
    },
    isDuplicate:        { type: Boolean, default: false },
    linkedQuestionId:   { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { timestamps: true }
);

const getAtlasModel = () => {
  if (!atlasConnection) throw new Error("Atlas bağlantısı henüz hazır değil");
  if (atlasConnection.models["questions"]) return atlasConnection.models["questions"];
  return atlasConnection.model("questions", AskedQuestionSchema);
};

// ─── Vector Search ────────────────────────────────────────────────────────────
// Aynı ders içinde %95+ benzer soruyu bulur.
// answer alanını da projeksiyona dahil ediyoruz,
// böylece cevabı olan/olmayan ayrımını burada yapabiliyoruz.
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
    {
      $addFields: { score: { $meta: "vectorSearchScore" } },
    },
    {
      // Eşik ve ders filtresi
      $match: {
      score: { $gte: SIMILARITY_THRESHOLD },
      ders:  ders,
      // soft_banned sorular duplicate kontrolünden de çıkar
      status: { $in: ["answered", "verified"] },
    },
    },
    {
      // Embedding hariç her şeyi al (answer dahil!)
      $project: {
        embedding:    0,
      },
    },
    { $limit: 1 },
  ]);

  if (results.length > 0) {
    console.log(`⚠️ Benzer soru — skor: ${(results[0].score * 100).toFixed(2)}%`);
    return results[0];
  }

  console.log("🆕 Benzer soru yok, kaydedilecek.");
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

  // 1. OCR: görselden metin çıkar
  const extractedText = await extractTextFromImage(imageBuffer);

  // 2. Embedding: metni vektöre çevir
  const embedding = await getEmbedding(extractedText);

  // 3. Duplicate kontrolü
  const similar = await findSimilarQuestion(embedding, ders);

  if (similar) {
    const cevapVar = !!(similar.answer?.text || similar.answer?.imageUrl);

    if (cevapVar) {
      // ✅ Doğrulanmış cevap mevcut → öğretmene gitme, direkt döndür
      console.log("✅ Doğrulanmış cevap bulundu, öğretmene gitmeden döndürülüyor.");
      return {
        isDuplicate: true,
        answered:    true,
        answer:      similar.answer,
        extractedText,
      };
    }

    // ⏳ Benzer soru var ama henüz cevaplanmamış
    console.log("⏳ Benzer soru var ama cevap bekleniyor.");
    return {
      isDuplicate:      true,
      answered:         false,
      linkedQuestionId: similar._id,
      extractedText,
      message: "Bu soru zaten öğretmene iletildi, cevap bekleniyor.",
    };
  }

  // 4. Yeni soru → Atlas'a kaydet
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

  console.log("✅ Yeni soru Atlas'a kaydedildi:", asked._id);

  return {
    isDuplicate: false,
    questionId:  asked._id,
    extractedText,
  };
}; */

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
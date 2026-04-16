import AskedQuestion from "../models/askedQuestion.js";
import { extractTextFromImage } from "./visionService.js";
import { getEmbedding } from "./embeddingService.js";
import { atlasConnection } from "../config/mongoDB.js";

const SIMILARITY_THRESHOLD = 0.85;

// Benzer soru ara
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
        score: { $meta: "vectorSearchScore" },
      },
    },
  ]);

  if (results.length > 0 && results[0].score >= SIMILARITY_THRESHOLD) {
    return results[0];
  }

  return null;
};

// Ana fonksiyon
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

  if (similar && similar.answer?.text) {
    // Duplicate! Öğretmene gitme
    console.log("Duplicate bulundu, skor:", similar.score);
    return {
      isDuplicate: true,
      answer: similar.answer,
      extractedText,
    };
  }

  // 4. Yeni soru - kaydet ve öğretmene gönder
  const asked = await AskedQuestion.create({
    studentId,
    sourceQuestionId,
    imageUrl: imageBuffer.toString("base64"),
    extractedText,
    embedding,
    ders,
    status: "pending",
    isDuplicate: false,
  });

  console.log("Yeni soru kaydedildi:", asked._id);

  return {
    isDuplicate: false,
    questionId: asked._id,
    extractedText,
  };
};
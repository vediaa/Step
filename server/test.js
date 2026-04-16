import dotenv from "dotenv";
dotenv.config();

import connectDB, { atlasConnection } from "./config/mongoDB.js";
import { extractTextFromImage } from "./services/visionService.js";
import { getEmbedding } from "./services/embeddingService.js";
import fs from "fs";
import mongoose from "mongoose";

const test = async () => {
  try {
    // 1. Veritabanlarına bağlan
    console.log("⏳ Veritabanlarına bağlanılıyor...");
    await connectDB();
    
    // Bağlantıların oturması için kısa bir bekleme
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log("✅ Bağlantılar hazır!");

    // Dosya adının soru1.jpg olduğundan emin ol (Veya test.jpg hangisiyse düzelt)
    const imageBuffer = fs.readFileSync("./soru1.jpg");

    // 2. Vision API - Fotoğrafı Oku
    console.log("📷 Vision API fotoğrafı analiz ediyor...");
    const text = await extractTextFromImage(imageBuffer);
    console.log("🔍 Çıkan Metin:", text);

    // 3. Embedding - M2 İşlemcinle Vektör Yap
    console.log("🔢 M2 İşlemci vektör üretiyor...");
    const embedding = await getEmbedding(text);
    console.log("✅ Vektör Hazır! Boyut:", embedding.length);

    // 4. ATLAS ÜZERİNDE ARAMA (Vector Search)
    console.log("🔍 Atlas üzerinde benzerlik taraması yapılıyor...");
    
    const results = await atlasConnection.collection("questions").aggregate([
      {
        $vectorSearch: {
          index: "vector_index", 
          path: "embedding",
          queryVector: embedding,
          numCandidates: 10,
          limit: 1
        }
      },
      {
        $addFields: { score: { $meta: "vectorSearchScore" } } 
      }
    ]).toArray();

    // --- KRİTİK MANTIK DÜZENLEMESİ BURASI ---
    const threshold = 0.90; // %90 benzerlik sınırı
    let isDuplicate = false;

    if (results.length > 0 && results[0].score > threshold) {
      isDuplicate = true;
      console.log(`⚠️ BENZER SORU BULDUM! (Skor: ${(results[0].score * 100).toFixed(2)}%)`);
    }

    if (!isDuplicate) {
      console.log("🆕 Bu soru yeni bir soru olarak algılandı. Atlas'a kaydediliyor...");
      
      await atlasConnection.collection("questions").insertOne({
        text: text,
        embedding: embedding,
        createdAt: new Date(),
        ders: "Geometri" // Yeni attığın fotoğraf geometri olduğu için böyle yazdım
      });

      console.log("✅ BAŞARI: Soru Atlas veritabanına kaydedildi!");
    } else {
      console.log("❌ KAYIT İPTAL: Bu soru zaten veritabanında mevcut olduğu için kaydedilmedi.");
    }

    console.log("🚀 TEST BAŞARIYLA TAMAMLANDI!");
    
    // İşlem bittikten 1 saniye sonra kapat
    setTimeout(() => process.exit(0), 1000);

  } catch (err) {
    console.error("❌ Hata oluştu:", err.message);
    process.exit(1);
  }
};

test();
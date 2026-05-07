/* export const getEmbedding = async (text) => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "models/text-embedding-004",
          content: {
            parts: [{ text }],
          },
        }),
      }
    );

    const data = await response.json();
    console.log("Embedding API response:", JSON.stringify(data, null, 2));

    if (!data.embedding?.values) {
      throw new Error("Embedding alınamadı");
    }

    return data.embedding.values;

  } catch (error) {
    console.error("Embedding Hatası:", error.message);
    throw new Error("Embedding oluşturulamadı");
  }
};// services/embeddingService.js
import dotenv from "dotenv";
dotenv.config();

export const getEmbedding = async (text) => {
  try {
    const key = process.env.GEMINI_API_KEY;
    
    // Google'ın en güncel ve en stabil v1beta endpoint'i
    const url = `https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${key}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "models/embedding-001",
        content: {
          parts: [{ text: text }]
        }
      })
    });

    const result = await response.json();

    if (result.error) {
      console.error("❌ Google API Hatası:", result.error.message);
      // Eğer hala 404 verirse, son bir şans 'embedding-001' ismini deneceğiz ama önce bunu gör
      throw new Error(result.error.message);
    }

    const embedding = result.embedding.values;
    console.log("✅ Gemini Vektörü Alındı! Boyut:", embedding.length);
    return embedding;

  } catch (error) {
    console.error("❌ Embedding İşleminde Teknik Hata:", error.message);
    throw error;
  }
}; */
/* 
import dotenv from "dotenv";
dotenv.config();

export const getEmbedding = async (text) => {
  try {
    // 768 boyut veren ve Türkçe destekleyen en iyi model budur:
    const model = "sentence-transformers/all-mpnet-base-v2";
    const url = `https://api-inference.huggingface.co/pipeline/feature-extraction/${model}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HF_TOKEN}`, // .env dosandaki isme dikkat et!
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        inputs: text,
        options: { wait_for_model: true } // Model uykudaysa uyandırana kadar bekle
      }),
    });

    const data = await response.json();

    // Eğer veri bir dizi içinde gelirse (Hugging Face bazen öyle yapar) temizle
    const embedding = Array.isArray(data[0]) ? data[0] : data;

    if (embedding.error) {
       throw new Error(embedding.error);
    }

    console.log("✅ Vektör Alındı! Boyut:", embedding.length); // Burası 768 yazmalı!
    return embedding;

  } catch (error) {
    console.error("❌ Embedding Hatası:", error.message);
    throw error;
  }
};
 */

import { pipeline } from "@xenova/transformers";

let extractor = null;

export const getEmbedding = async (text) => {
  try {
    if (!extractor) {
      console.log("⏳ Embedding motoru yükleniyor...");
      extractor = await pipeline("feature-extraction", "Xenova/all-mpnet-base-v2");
      console.log("✅ Embedding motoru hazır");
    }

    const output = await extractor(text, { pooling: "mean", normalize: true });
    const embedding = Array.from(output.data);
    console.log("✅ Vektör boyutu:", embedding.length);
    return embedding;

  } catch (error) {
    console.error("❌ Embedding hatası:", error);
    throw error;
  }
};
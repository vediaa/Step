

import Progress from "../models/progress.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// curriculum.json'u yükle
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const curriculumPath = path.join(__dirname, "../data/curriculum.json");
const curriculum = JSON.parse(fs.readFileSync(curriculumPath, "utf-8"));

// 🔧 Map'i Normal Objeye Çevir (Yardımcı Fonksiyon)
const convertMapToObject = (map) => {
  if (!map) return {};
  
  const obj = {};
  
  if (map instanceof Map) {
    for (const [key, value] of map) {
      if (value instanceof Map) {
        obj[key] = convertMapToObject(value);
      } else {
        obj[key] = value;
      }
    }
  } else if (typeof map === 'object') {
    // Zaten object ise direkt dön
    return map;
  }
  
  return obj;
};

// Kullanıcının İlerlemesini Getir
export const getProgress = async (req, res) => {
  try {
    let progressDoc = await Progress.findOne({ userId: req.user.id });

    // Eğer ilerleme kaydı yoksa, boş bir kayıt oluştur
    if (!progressDoc) {
      progressDoc = await Progress.create({
        userId: req.user.id,
        progress: {},
      });
    }

    // Map'i düz objeye çevir
    const progressObj = convertMapToObject(progressDoc.progress);

    res.status(200).json({
      progress: progressObj,
      totalCompleted: calculateTotalCompleted(progressObj),
    });
  } catch (error) {
    console.error("İlerleme getirme hatası:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// Toplam tamamlanan konu sayısını hesapla
const calculateTotalCompleted = (progress) => {
  let total = 0;
  for (const subjectId in progress) {
    const topics = progress[subjectId];
    if (typeof topics === 'object') {
      for (const topicId in topics) {
        if (topics[topicId] === true) {
          total++;
        }
      }
    }
  }
  return total;
};

// İlerlemeyi Güncelle (Tüm progress objesini kaydet)
export const updateProgress = async (req, res) => {
  try {
    const { progress } = req.body;

    if (!progress || typeof progress !== "object") {
      return res.status(400).json({ message: "Geçersiz ilerleme verisi!" });
    }

    // Kullanıcının ilerleme kaydını bul veya oluştur
    let progressDoc = await Progress.findOneAndUpdate(
      { userId: req.user.id },
      { progress },
      { new: true, upsert: true, runValidators: false }
    );

    const progressObj = convertMapToObject(progressDoc.progress);

    res.status(200).json({
      message: "İlerleme kaydedildi",
      progress: progressObj,
      totalCompleted: calculateTotalCompleted(progressObj),
    });
  } catch (error) {
    console.error("İlerleme güncelleme hatası:", error);
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
};

// 🎯 Tek Bir Konuyu Tamamla/Geri Al (DÜZELTİLDİ)
export const toggleTopic = async (req, res) => {
  try {
    console.log("Toggle isteği geldi:", req.body);
    console.log("Kullanıcı ID:", req.user.id);

    const { subjectId, topicId } = req.body;

    // Validasyon
    if (!subjectId || !topicId) {
      return res.status(400).json({ 
        message: "Ders ID (subjectId) ve Konu ID (topicId) gereklidir!",
        example: { subjectId: "1", topicId: "5" }
      });
    }

    // String olarak kullan
    const subjectIdStr = String(subjectId);
    const topicIdStr = String(topicId);

    // İlerleme kaydını bul veya oluştur
    let progressDoc = await Progress.findOne({ userId: req.user.id });

    if (!progressDoc) {
      progressDoc = await Progress.create({
        userId: req.user.id,
        progress: {},
      });
    }

    // 🔧 Progress'i düz objeye çevir
    let progressData = convertMapToObject(progressDoc.progress);

    console.log("Önceki Progress:", JSON.stringify(progressData, null, 2));

    // Ders yoksa oluştur
    if (!progressData[subjectIdStr]) {
      progressData[subjectIdStr] = {};
    }

    // 🎯 TOGGLE: Mevcut değeri al ve ters çevir
    const currentValue = progressData[subjectIdStr][topicIdStr] === true;
    progressData[subjectIdStr][topicIdStr] = !currentValue;

    console.log(`Toggle: ${subjectIdStr}.${topicIdStr} = ${currentValue} → ${!currentValue}`);

    // Kaydet
    progressDoc.progress = progressData;
    progressDoc.markModified('progress'); // MongoDB'ye değişikliği bildir
    await progressDoc.save();

    console.log("Yeni Progress:", JSON.stringify(progressData, null, 2));

    res.status(200).json({
      message: "Konu durumu güncellendi",
      subjectId: subjectIdStr,
      topicId: topicIdStr,
      completed: progressData[subjectIdStr][topicIdStr],
      totalCompleted: calculateTotalCompleted(progressData),
    });
  } catch (error) {
    console.error("Konu güncelleme hatası:", error);
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
};

// Curriculum'u Getir
export const getCurriculum = async (req, res) => {
  try {
    res.status(200).json(curriculum);
  } catch (error) {
    console.error("Curriculum getirme hatası:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// İstatistikler
export const getProgressStats = async (req, res) => {
  try {
    const progressDoc = await Progress.findOne({ userId: req.user.id });

    console.log("Stats için bulunan doküman:", progressDoc ? "Var" : "Yok");

    if (!progressDoc || !progressDoc.progress) {
      return res.status(200).json({
        totalTopics: 0,
        completedTopics: 0,
        tytCompleted: 0,
        aytCompleted: 0,
        completionRate: 0,
      });
    }

    // Progress'i objeye çevir
    const progressData = convertMapToObject(progressDoc.progress);

    console.log("Stats Progress Data:", JSON.stringify(progressData, null, 2));

    let totalTopics = 0;
    let completedTopics = 0;
    let tytCompleted = 0;
    let aytCompleted = 0;

    // TYT konularını say
    curriculum.tyt.forEach((subject) => {
      totalTopics += subject.topics.length;
      
      const subjectIdStr = String(subject.id);
      const subjectProgress = progressData[subjectIdStr] || {};
      
      subject.topics.forEach((topic) => {
        const topicIdStr = String(topic.id);
        if (subjectProgress[topicIdStr] === true) {
          completedTopics++;
          tytCompleted++;
        }
      });
    });

    // AYT konularını say
    curriculum.ayt.forEach((subject) => {
      totalTopics += subject.topics.length;
      
      const subjectIdStr = String(subject.id);
      const subjectProgress = progressData[subjectIdStr] || {};
      
      subject.topics.forEach((topic) => {
        const topicIdStr = String(topic.id);
        if (subjectProgress[topicIdStr] === true) {
          completedTopics++;
          aytCompleted++;
        }
      });
    });

    const completionRate =
      totalTopics > 0 ? ((completedTopics / totalTopics) * 100).toFixed(2) : 0;

    console.log("Stats Sonuç:", {
      totalTopics,
      completedTopics,
      tytCompleted,
      aytCompleted,
      completionRate,
    });

    res.status(200).json({
      totalTopics,
      completedTopics,
      tytCompleted,
      aytCompleted,
      completionRate: parseFloat(completionRate),
    });
  } catch (error) {
    console.error("İstatistik hatası:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// İlerlemeyi Sıfırla
export const resetProgress = async (req, res) => {
  try {
    await Progress.findOneAndUpdate(
      { userId: req.user.id },
      { progress: {} },
      { new: true, upsert: true }
    );

    res.status(200).json({ message: "İlerleme sıfırlandı" });
  } catch (error) {
    console.error("Sıfırlama hatası:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

import User from "../models/user.js";
import Exam, { EXAM_LIMITS } from "../models/exam.js";
import {
  updateUserStats,
  calculateAverageNet,
  getBestExam,
  calculateTrend,
} from "../services/statsService.js";

import mongoose from "mongoose";

// Helper: Net Hesaplama
const calculateNet = (dogru, yanlis) => {
  return parseFloat((dogru - yanlis / 4).toFixed(2));
};

// Helper: Validasyon
const validateExamScores = (type, scores) => {
  const limits = EXAM_LIMITS[type];
  const errors = [];

  Object.entries(scores).forEach(([subject, data]) => {
    if (!data || !limits[subject]) return;

    const { dogru = 0, yanlis = 0, bos = 0 } = data;
    const total = dogru + yanlis + bos;
    const max = limits[subject].max;

    if (total > max) {
      errors.push(
        `${limits[subject].name}: Toplam ${max} soru olmalı (Girilen: ${total})`
      );
    }

    if (dogru < 0 || yanlis < 0 || bos < 0) {
      errors.push(`${limits[subject].name}: Negatif değer girilemez`);
    }
  });

  return errors;
};

// @desc    Yeni deneme oluştur
// @route   POST /api/exams
// @access  Private
export const createExam = async (req, res) => {
  try {
    const { name, type, branch, tytScores, aytScores, duration, difficulty, notes, source } = req.body;

    // Validasyon
    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: "Deneme adı ve türü gereklidir",
      });
    }

    if (type === "AYT" && !branch) {
      return res.status(400).json({
        success: false,
        message: "AYT için alan seçimi gereklidir",
      });
    }

    // --- İŞTE YENİ EKLENEN SİHİRLİ KISIM (Veri Yıkayıcı) ---
    const sanitizeScores = (scores) => {
      const cleaned = {};
      Object.entries(scores).forEach(([subject, data]) => {
        if (data) {
          cleaned[subject] = {
            dogru: parseInt(data.dogru) || 0,
            yanlis: parseInt(data.yanlis) || 0,
            // DİKKAT: Frontend'den gelen hatalı/gecikmeli 'bos' verisini siliyoruz!
            // Böylece backend validasyonu sadece doğru ve yanlışa bakacak.
          };
        }
      });
      return cleaned;
    };

    // Skorları temizleyerek validasyona hazırlıyoruz
    let scoresToValidate = {};
    if (type === "TYT") {
      scoresToValidate = sanitizeScores(tytScores || {});
    } else {
      scoresToValidate = sanitizeScores(aytScores || {});
    }
    // --------------------------------------------------------

    const validationErrors = validateExamScores(type, scoresToValidate);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validasyon hatası",
        errors: validationErrors,
      });
    }

    // Her ders için net hesapla
    const calculateScoreNets = (scores) => {
      const calculated = {};
      Object.entries(scores).forEach(([subject, data]) => {
        if (data) {
          calculated[subject] = {
            ...data,
            net: calculateNet(data.dogru || 0, data.yanlis || 0),
          };
        }
      });
      return calculated;
    };

    let processedTytScores = {};
    let processedAytScores = {};
    let totalNet = 0;

    if (type === "TYT") {
      processedTytScores = calculateScoreNets(tytScores || {});
      totalNet = Object.values(processedTytScores).reduce(
        (sum, score) => sum + (score.net || 0),
        0
      );
    } else {
      processedAytScores = calculateScoreNets(aytScores || {});
      totalNet = Object.values(processedAytScores).reduce(
        (sum, score) => sum + (score.net || 0),
        0
      );
    }

    totalNet = parseFloat(totalNet.toFixed(2));

    // Kullanıcının hedefini getir
    const user = await User.findById(req.user.id);
    const targetNet = type === "TYT" ? user.targets?.tytNet : user.targets?.aytNet;

    // Denemeyi oluştur
    const exam = new Exam({
      userId: req.user.id,
      name,
      type,
      branch: type === "AYT" ? branch : null,
      tytScores: processedTytScores,
      aytScores: processedAytScores,
      totalNet,
      duration,
      difficulty,
      notes,
      source,
    });

    // Toplam istatistikleri hesapla
    exam.calculateTotals();

    // Hedefle karşılaştır
    if (targetNet) {
      exam.compareWithTarget(targetNet);
    }

    await exam.save();

    // Kullanıcı istatistiklerini güncelle (Service kullanarak)
    await updateUserStats(req.user.id);

    res.status(201).json({
      success: true,
      message: "Deneme başarıyla kaydedildi",
      data: exam,
    });
  } catch (error) {
    console.error("Deneme oluşturma hatası:", error);
    res.status(500).json({
      success: false,
      message: "Deneme kaydedilirken bir hata oluştu",
      error: error.message,
    });
  }
};

// @desc    Tüm denemeleri getir
// @route   GET /api/exams?type=TYT&branch=Sayısal&limit=10
// @access  Private
export const getExams = async (req, res) => {
  try {
    const { type, branch, limit = 50, sort = "-date" } = req.query;

    const filter = { userId: req.user.id };
    if (type) filter.type = type;
    if (branch) filter.branch = branch;

    const exams = await Exam.find(filter)
      .sort(sort)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: exams.length,
      data: exams,
    });
  } catch (error) {
    console.error("Denemeler getirme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Denemeler getirilirken bir hata oluştu",
      error: error.message,
    });
  }
};

// @desc    Tek deneme getir
// @route   GET /api/exams/:id
// @access  Private
export const getExamById = async (req, res) => {
  try {
    const exam = await Exam.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Deneme bulunamadı",
      });
    }

    res.status(200).json({
      success: true,
      data: exam,
    });
  } catch (error) {
    console.error("Deneme getirme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Deneme getirilirken bir hata oluştu",
      error: error.message,
    });
  }
};

// @desc    Deneme güncelle
// @route   PUT /api/exams/:id
// @access  Private
export const updateExam = async (req, res) => {
  try {
    const exam = await Exam.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Deneme bulunamadı",
      });
    }

    const { name, difficulty, notes, source } = req.body;

    if (name) exam.name = name;
    if (difficulty) exam.difficulty = difficulty;
    if (notes !== undefined) exam.notes = notes;
    if (source !== undefined) exam.source = source;

    await exam.save();

    res.status(200).json({
      success: true,
      message: "Deneme güncellendi",
      data: exam,
    });
  } catch (error) {
    console.error("Deneme güncelleme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Deneme güncellenirken bir hata oluştu",
      error: error.message,
    });
  }
};

// @desc    Deneme sil
// @route   DELETE /api/exams/:id
// @access  Private
export const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Deneme bulunamadı",
      });
    }

    // Kullanıcı istatistiklerini güncelle (Service kullanarak)
    await updateUserStats(req.user.id);

    res.status(200).json({
      success: true,
      message: "Deneme silindi",
    });
  } catch (error) {
    console.error("Deneme silme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Deneme silinirken bir hata oluştu",
      error: error.message,
    });
  }
};

// @desc    Analiz verileri getir
// @route   GET /api/exams/analytics/overview
// @access  Private
export const getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    // Kullanıcı istatistikleri
    const user = await User.findById(userId);
    
    // Ortalama netler (Service kullanarak)
    const tytAvg = await calculateAverageNet(userId, "TYT");
    const aytAvg = await calculateAverageNet(userId, "AYT");

    // En iyi denemeler (Service kullanarak)
    const bestTyt = await getBestExam(userId, "TYT");
    const bestAyt = await getBestExam(userId, "AYT");

    // Trend analizleri (Service kullanarak)
    const tytTrend = await calculateTrend(userId, "TYT", 10);
    const aytTrend = await calculateTrend(userId, "AYT", 10);

    // Son 10 deneme
    const recentExams = await Exam.find({ userId })
      .sort({ date: -1 })
      .limit(10)
      .select("name type totalNet date");

    res.status(200).json({
      success: true,
      data: {
        userStats: user.stats,
        targets: user.targets,
        averages: {
          tyt: tytAvg,
          ayt: aytAvg,
        },
        best: {
          tyt: bestTyt,
          ayt: bestAyt,
        },
        trends: {
          tyt: tytTrend,
          ayt: aytTrend,
        },
        recentExams,
      },
    });
  } catch (error) {
    console.error("Analiz hatası:", error);
    res.status(500).json({
      success: false,
      message: "Analiz verileri alınırken bir hata oluştu",
      error: error.message,
    });
  }
};

// @desc    Ders bazlı analiz
// @route   GET /api/exams/analytics/subject/:subject
// @access  Private
export const getSubjectAnalysis = async (req, res) => {
  try {
    const { subject } = req.params;
    const { type = "TYT" } = req.query;

    // Service kullanarak hesapla
    const { calculateSubjectStats } = await import("../services/statsService.js");
    const stats = await calculateSubjectStats(req.user.id, type, subject);

    if (stats.count === 0) {
      return res.status(404).json({
        success: false,
        message: "Bu ders için deneme bulunamadı",
      });
    }

    // Detaylı skorları getir
    const scoreField = type === "TYT" ? `tytScores.${subject}` : `aytScores.${subject}`;
    const exams = await Exam.find({
      userId: req.user.id,
      type,
      [scoreField]: { $exists: true },
    }).sort({ date: 1 });

    const scores = exams.map((exam) => {
      const scoreData = type === "TYT" 
        ? exam.tytScores?.[subject] 
        : exam.aytScores?.[subject];
      
      return {
        examId: exam._id,
        examName: exam.name,
        date: exam.date,
        ...scoreData,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        ...stats,
        scores,
      },
    });
  } catch (error) {
    console.error("Ders analizi hatası:", error);
    res.status(500).json({
      success: false,
      message: "Ders analizi alınırken bir hata oluştu",
      error: error.message,
    });
  }
};

/* 



import UserTarget from "../models/usertarget.js";
import { EXAM_LIMITS } from "../../client/src/utils/examLimits.js";
import { calculateNet } from "../../client/src/utils/netCalculator.js";

// Yeni deneme oluştur
export const createExam = async (req, res) => {
  try {
    const { examName, examType, dersler } = req.body;

    let totalNet = 0;

    // Her ders için net hesapla ve limit kontrolü yap
    for (const ders in dersler) {
      const data = dersler[ders];
      const max = EXAM_LIMITS[examType][ders];

      if (!max) continue;

      if (data.dogru + data.yanlis + data.bos > max) {
        return res
          .status(400)
          .json({ message: `${ders} için max ${max} soru girilebilir` });
      }

      data.net = calculateNet(data.dogru, data.yanlis);
      totalNet += data.net;
    }

    // Kullanıcının hedeflerini al
    const target = await UserTarget.findOne({ userId: req.user.id });
    const hedef = examType === "TYT" ? target?.hedefTYT : target?.hedefAYT;
    const hedefBolum = target?.hedefBolum || "";

    // Denemeyi kaydet
    const exam = await ExamResult.create({
      userId: req.user.id,
      examName,
      examType,
      dersler,
      totalNet: parseFloat(totalNet.toFixed(2)),
      hedefGecildiMi: hedef ? totalNet >= hedef : false,
      hedefBolum, // Kayıt anındaki bölümü sakla
    });

    res.status(201).json(exam);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Kullanıcının tüm denemelerini getir
export const getExams = async (req, res) => {
  try {
    const exams = await ExamResult.find({ userId: req.user.id })
      .sort({ createdAt: -1 }); // En yeni en üstte

    res.status(200).json(exams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Belirli bir denemeyi getir
export const getExamById = async (req, res) => {
  try {
    const exam = await ExamResult.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!exam) {
      return res.status(404).json({ message: "Deneme bulunamadı" });
    }

    res.status(200).json(exam);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deneme sil
export const deleteExam = async (req, res) => {
  try {
    const exam = await ExamResult.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!exam) {
      return res.status(404).json({ message: "Deneme bulunamadı" });
    }

    res.status(200).json({ message: "Deneme başarıyla silindi" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deneme güncelle
export const updateExam = async (req, res) => {
  try {
    const { examName, examType, dersler } = req.body;

    let totalNet = 0;

    // Her ders için net hesapla
    for (const ders in dersler) {
      const data = dersler[ders];
      const max = EXAM_LIMITS[examType][ders];

      if (!max) continue;

      if (data.dogru + data.yanlis + data.bos > max) {
        return res
          .status(400)
          .json({ message: `${ders} için max ${max} soru girilebilir` });
      }

      data.net = hesaplaNet(data.dogru, data.yanlis);
      totalNet += data.net;
    }

    const target = await UserTarget.findOne({ userId: req.user.id });
    const hedef = examType === "TYT" ? target?.hedefTYT : target?.hedefAYT;

    const exam = await ExamResult.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      {
        examName,
        examType,
        dersler,
        totalNet: parseFloat(totalNet.toFixed(2)),
        hedefGecildiMi: hedef ? totalNet >= hedef : false,
      },
      { new: true }
    );

    if (!exam) {
      return res.status(404).json({ message: "Deneme bulunamadı" });
    }

    res.status(200).json(exam);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// İstatistikler için özet bilgi
export const getExamStats = async (req, res) => {
  try {
    const exams = await ExamResult.find({ userId: req.user.id });

    const tytExams = exams.filter((e) => e.examType === "TYT");
    const aytExams = exams.filter((e) => e.examType === "AYT");

    const avgTYT =
      tytExams.length > 0
        ? tytExams.reduce((sum, e) => sum + e.totalNet, 0) / tytExams.length
        : 0;

    const avgAYT =
      aytExams.length > 0
        ? aytExams.reduce((sum, e) => sum + e.totalNet, 0) / aytExams.length
        : 0;

    const maxTYT = tytExams.length > 0 ? Math.max(...tytExams.map((e) => e.totalNet)) : 0;
    const maxAYT = aytExams.length > 0 ? Math.max(...aytExams.map((e) => e.totalNet)) : 0;

    res.status(200).json({
      totalExams: exams.length,
      tytCount: tytExams.length,
      aytCount: aytExams.length,
      avgTYT: parseFloat(avgTYT.toFixed(2)),
      avgAYT: parseFloat(avgAYT.toFixed(2)),
      maxTYT: parseFloat(maxTYT.toFixed(2)),
      maxAYT: parseFloat(maxAYT.toFixed(2)),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; */
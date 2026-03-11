// services/statsService.js
// Model'den ÇIKARIP servis katmanına taşıdık

import User from "../models/user.js";
import Exam from "../models/exam.js";
import mongoose from "mongoose";

/**
 * Kullanıcının tüm istatistiklerini hesaplar
 * @param {String} userId - Kullanıcı ID
 * @returns {Object} İstatistik objesi
 */
export const calculateUserStats = async (userId) => {
  // Tüm denemeleri getir
  const allExams = await Exam.find({ userId }).sort({ date: 1 });

  // Hiç deneme yoksa varsayılan değerler döndür
  if (allExams.length === 0) {
    return {
      totalExams: 0,
      totalTytExams: 0,
      totalAytExams: 0,
      averageNet: 0,
      averageTytNet: 0,
      averageAytNet: 0,
      bestNet: 0,
      worstNet: null,
      bestTytNet: 0,
      bestAytNet: 0,
      improvement: {
        first5Avg: 0,
        last5Avg: 0,
        totalChange: 0,
      },
      targetReachedCount: 0,
      targetMissedCount: 0,
      targetReachedPercentage: 0,
      lastUpdated: new Date(),
    };
  }

  // TYT ve AYT'yi ayır
  const tytExams = allExams.filter((e) => e.type === "TYT");
  const aytExams = allExams.filter((e) => e.type === "AYT");

  // Toplam sayılar
  const totalExams = allExams.length;

  // ORTALAMALAR
  const totalNetSum = allExams.reduce((sum, e) => sum + e.totalNet, 0);
  const averageNet = totalNetSum / totalExams;

  const tytNetSum = tytExams.reduce((sum, e) => sum + e.totalNet, 0);
  const averageTytNet = tytExams.length > 0 ? tytNetSum / tytExams.length : 0;

  const aytNetSum = aytExams.reduce((sum, e) => sum + e.totalNet, 0);
  const averageAytNet = aytExams.length > 0 ? aytNetSum / aytExams.length : 0;

  // EN İYİ VE EN KÖTÜ
  const allNets = allExams.map((e) => e.totalNet);
  const bestNet = Math.max(...allNets);
  const worstNet = Math.min(...allNets);

  const tytNets = tytExams.map((e) => e.totalNet);
  const bestTytNet = tytNets.length > 0 ? Math.max(...tytNets) : 0;

  const aytNets = aytExams.map((e) => e.totalNet);
  const bestAytNet = aytNets.length > 0 ? Math.max(...aytNets) : 0;

  // İLERLEME ANALİZİ (İlk 5 vs Son 5)
  let improvement = { first5Avg: 0, last5Avg: 0, totalChange: 0 };

  if (totalExams >= 5) {
    const first5 = allExams.slice(0, 5);
    const last5 = allExams.slice(-5);

    const first5Avg =
      first5.reduce((sum, e) => sum + e.totalNet, 0) / first5.length;
    const last5Avg =
      last5.reduce((sum, e) => sum + e.totalNet, 0) / last5.length;

    improvement = {
      first5Avg: parseFloat(first5Avg.toFixed(2)),
      last5Avg: parseFloat(last5Avg.toFixed(2)),
      totalChange: parseFloat((last5Avg - first5Avg).toFixed(2)),
    };
  }

  // HEDEF İSTATİSTİKLERİ
  const targetReachedCount = allExams.filter((e) => e.targetReached).length;
  const targetMissedCount = allExams.filter(
    (e) => !e.targetReached && e.targetNet
  ).length;
  const targetReachedPercentage =
    targetReachedCount + targetMissedCount > 0
      ? parseFloat(
          (
            (targetReachedCount / (targetReachedCount + targetMissedCount)) *
            100
          ).toFixed(1)
        )
      : 0;

  // SONUÇ
  return {
    totalExams,
    totalTytExams: tytExams.length,
    totalAytExams: aytExams.length,
    averageNet: parseFloat(averageNet.toFixed(2)),
    averageTytNet: parseFloat(averageTytNet.toFixed(2)),
    averageAytNet: parseFloat(averageAytNet.toFixed(2)),
    bestNet,
    worstNet,
    bestTytNet,
    bestAytNet,
    improvement,
    targetReachedCount,
    targetMissedCount,
    targetReachedPercentage,
    lastUpdated: new Date(),
  };
};

/**
 * Kullanıcının istatistiklerini günceller (DB'ye kaydeder)
 * @param {String} userId - Kullanıcı ID
 * @returns {Object} Güncellenmiş istatistikler
 */
export const updateUserStats = async (userId) => {
  //const User = mongoose.model("User");
  
  // İstatistikleri hesapla
  const newStats = await calculateUserStats(userId);
  
  // User'ı güncelle
  const user = await User.findByIdAndUpdate(
    userId,
    { stats: newStats },
    { new: true, runValidators: true }
  );

  return user ? user.stats : null; // user bulunamazsa diye ufak bir güvenlik önlemi
};

/**
 * Ders bazlı istatistik hesapla
 * @param {String} userId - Kullanıcı ID
 * @param {String} examType - TYT veya AYT
 * @param {String} subject - Ders adı (turkce, matematik, vb.)
 * @returns {Object} Ders istatistikleri
 */
export const calculateSubjectStats = async (userId, examType, subject) => {
  const scoreField =
    examType === "TYT" ? `tytScores.${subject}` : `aytScores.${subject}`;

  const exams = await Exam.find({
    userId,
    type: examType,
    [scoreField]: { $exists: true },
  }).sort({ date: 1 });

  if (exams.length === 0) {
    return {
      subject,
      examType,
      count: 0,
      avgNet: 0,
      maxNet: 0,
      minNet: 0,
      trend: "insufficient_data",
      improvement: 0,
    };
  }

  // Skorları çıkar
  const nets = exams.map((exam) => {
    const scoreData =
      examType === "TYT"
        ? exam.tytScores?.[subject]
        : exam.aytScores?.[subject];
    return scoreData?.net || 0;
  });

  // İstatistikler
  const avgNet = parseFloat(
    (nets.reduce((a, b) => a + b, 0) / nets.length).toFixed(2)
  );
  const maxNet = Math.max(...nets);
  const minNet = Math.min(...nets);

  // Trend
  const firstNet = nets[0];
  const lastNet = nets[nets.length - 1];
  const trend =
    lastNet > firstNet
      ? "increasing"
      : lastNet < firstNet
      ? "decreasing"
      : "stable";
  const improvement = parseFloat((lastNet - firstNet).toFixed(2));

  return {
    subject,
    examType,
    count: exams.length,
    avgNet,
    maxNet,
    minNet,
    trend,
    improvement,
    improvementPercentage:
      firstNet > 0 ? ((improvement / firstNet) * 100).toFixed(1) : 0,
  };
};

/**
 * Trend analizi (Son N deneme)
 * @param {String} userId - Kullanıcı ID
 * @param {String} examType - TYT veya AYT (null = hepsi)
 * @param {Number} limit - Kaç deneme analiz edilecek
 * @returns {Object} Trend bilgisi
 */
export const calculateTrend = async (userId, examType = null, limit = 10) => {
  const match = { userId: new mongoose.Types.ObjectId(userId) };
  if (examType) match.type = examType;

  const exams = await Exam.find(match)
    .sort({ date: -1 })
    .limit(limit)
    .select("totalNet date");

  if (exams.length < 2) {
    return { trend: "insufficient_data", change: 0, percentage: 0 };
  }

  const latest = exams[0].totalNet;
  const oldest = exams[exams.length - 1].totalNet;
  const change = parseFloat((latest - oldest).toFixed(2));
  const percentage = oldest > 0 ? ((change / oldest) * 100).toFixed(1) : 0;

  return {
    trend: change > 0 ? "increasing" : change < 0 ? "decreasing" : "stable",
    change,
    percentage,
    dataPoints: exams.length,
  };
};

/**
 * Ortalama net hesapla
 * @param {String} userId - Kullanıcı ID
 * @param {String} examType - TYT veya AYT (null = hepsi)
 * @returns {Object} Ortalama ve sayı
 */
export const calculateAverageNet = async (userId, examType = null) => {
  const match = { userId: new mongoose.Types.ObjectId(userId) };
  if (examType) match.type = examType;

  const result = await Exam.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        avgNet: { $avg: "$totalNet" },
        count: { $sum: 1 },
      },
    },
  ]);

  return result.length > 0
    ? {
        avgNet: parseFloat(result[0].avgNet.toFixed(2)),
        count: result[0].count,
      }
    : { avgNet: 0, count: 0 };
};

/**
 * En iyi denemeyi getir
 * @param {String} userId - Kullanıcı ID
 * @param {String} examType - TYT veya AYT (null = hepsi)
 * @returns {Object} En iyi deneme
 */
export const getBestExam = async (userId, examType = null) => {
  const match = { userId: new mongoose.Types.ObjectId(userId) };
  if (examType) match.type = examType;

  return await Exam.findOne(match).sort({ totalNet: -1 }).limit(1);
};
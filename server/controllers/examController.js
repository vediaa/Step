import ExamResult from "../models/exam.js";
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
};
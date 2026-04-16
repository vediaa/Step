import { processQuestion } from "../services/questionService.js";

export const askQuestion = async (req, res) => {
  try {
    const { sourceQuestionId, ders } = req.body;
    const studentId = req.user._id; // middleware'den geliyor

    if (!req.file) {
      return res.status(400).json({ message: "Fotoğraf gerekli" });
    }

    const result = await processQuestion({
      imageBuffer: req.file.buffer,
      studentId,
      sourceQuestionId: sourceQuestionId || null,
      ders: ders || "Genel",
    });

    if (result.isDuplicate) {
      return res.status(200).json({
        success: true,
        isDuplicate: true,
        message: "Bu soru daha önce çözülmüş!",
        answer: result.answer,
      });
    }

    return res.status(201).json({
      success: true,
      isDuplicate: false,
      message: "Soru öğretmene iletildi",
      questionId: result.questionId,
    });

  } catch (error) {
    console.error("askQuestion Hatası:", error.message);
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
};
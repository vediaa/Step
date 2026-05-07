import { processQuestion } from "../services/questionService.js";

export const askQuestion = async (req, res) => {
  try {
    const { sourceQuestionId, ders } = req.body;
    const studentId = req.user._id;

    if (!req.file) {
      return res.status(400).json({ message: "Fotoğraf gerekli" });
    }

    const result = await processQuestion({
      imageBuffer: req.file.buffer,
      studentId,
      sourceQuestionId: sourceQuestionId || null,
      ders: ders || "Genel",
    });

    // Daha önce sorulmuş ve cevaplanmış
    if (result.isDuplicate && result.answered) {
      return res.status(200).json({
        success: true,
        status: "duplicate_answered",
        message: "Bu soru daha önce çözülmüş, cevap aşağıda!",
        answer: result.answer,
        extractedText: result.extractedText,
      });
    }

    // Daha önce sorulmuş ama henüz cevaplanmamış
    if (result.isDuplicate && !result.answered) {
      return res.status(200).json({
        success: true,
        status: "duplicate_pending",
        message: result.message,
        linkedQuestionId: result.linkedQuestionId,
        extractedText: result.extractedText,
      });
    }

    // Yeni soru, öğretmene gönderildi
    return res.status(201).json({
      success: true,
      status: "sent_to_teacher",
      message: "Soru öğretmene iletildi",
      questionId: result.questionId,
      extractedText: result.extractedText,
    });

  } catch (error) {
    console.error("askQuestion Hatası:", error.message);
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
};
import Question from "../models/question.js";
import mongoose from "mongoose";

// @desc    Yeni soru yükle (fotoğraf ile)
// @route   POST /api/questions/upload
// @access  Private
export const uploadQuestion = async (req, res) => {
  try {
    const { text, foto, kategori, ders, notlar } = req.body;

    // Validasyon
    if (!foto || !text) {
      return res.status(400).json({
        success: false,
        message: "Fotoğraf ve açıklama gereklidir",
      });
    }

    // Base64 boyut kontrolü (5MB)
    const sizeInBytes = (foto.length * 3) / 4;
    const sizeInMB = sizeInBytes / (1024 * 1024);

    if (sizeInMB > 5) {
      return res.status(400).json({
        success: false,
        message: "Fotoğraf boyutu 5MB'dan küçük olmalıdır",
      });
    }

    // Yeni soru oluştur
    const newQuestion = await Question.create({
      userId: req.user.id, // auth middleware'den geliyor
      text,
      foto,
      kategori: kategori || "Genel",
      ders: ders || "",
      notlar: notlar || "",
      cozuldu: false,
      zorluk: null,
    });

    res.status(201).json({
      success: true,
      message: "Soru başarıyla eklendi",
      data: newQuestion,
    });
  } catch (error) {
    console.error("Soru yükleme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Soru yüklenirken bir hata oluştu",
      error: error.message,
    });
  }
};

// @desc    Tüm soruları getir (filtreleme ile)
// @route   GET /api/questions?cozuldu=false&zorluk=kolay&kategori=Matematik
// @access  Private
export const getQuestions = async (req, res) => {
  try {
    const { cozuldu, zorluk, kategori, ders, search } = req.query;

    // Filtre objesi oluştur
    const filter = { userId: req.user.id };

    // Çözülme durumuna göre filtrele
    if (cozuldu !== undefined) {
      filter.cozuldu = cozuldu === "true";
    }

    // Zorluk seviyesine göre filtrele
    if (zorluk) {
      filter.zorluk = zorluk;
    }

    // Kategoriye göre filtrele
    if (kategori) {
      filter.kategori = kategori;
    }

    // Derse göre filtrele
    if (ders) {
      filter.ders = ders;
    }

    // Arama (text içinde)
    if (search) {
      filter.text = { $regex: search, $options: "i" };
    }

    // Soruları getir (en yeni önce)
    const questions = await Question.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (error) {
    console.error("Sorular yüklenirken hata:", error);
    res.status(500).json({
      success: false,
      message: "Sorular yüklenirken bir hata oluştu",
      error: error.message,
    });
  }
};

// @desc    Belirli bir soruyu getir
// @route   GET /api/questions/:id
// @access  Private
export const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;

    // ID validasyonu
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Geçersiz soru ID'si",
      });
    }

    // Soruyu bul
    const question = await Question.findOne({
      _id: id,
      userId: req.user.id, // Sadece kendi sorularını görebilir
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Soru bulunamadı",
      });
    }

    res.status(200).json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error("Soru getirme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Soru getirilirken bir hata oluştu",
      error: error.message,
    });
  }
};

// @desc    Soruyu güncelle (kategorize et)
// @route   PUT /api/questions/:id
// @access  Private
export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, cozuldu, zorluk, kategori, ders, notlar } = req.body;

    // ID validasyonu
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Geçersiz soru ID'si",
      });
    }

    // Soruyu bul
    const question = await Question.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Soru bulunamadı",
      });
    }

    // Güncellenebilir alanlar
    if (text !== undefined) question.text = text;
    if (cozuldu !== undefined) {
      question.cozuldu = cozuldu;
      // Eğer çözülmediyse zorluk seviyesini null yap
      if (!cozuldu) {
        question.zorluk = null;
      }
    }
    if (zorluk !== undefined && question.cozuldu) {
      // Sadece çözüldüyse zorluk atanabilir
      question.zorluk = zorluk;
    }
    if (kategori !== undefined) question.kategori = kategori;
    if (ders !== undefined) question.ders = ders;
    if (notlar !== undefined) question.notlar = notlar;

    // Kaydet
    await question.save();

    res.status(200).json({
      success: true,
      message: "Soru başarıyla güncellendi",
      data: question,
    });
  } catch (error) {
    console.error("Soru güncelleme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Soru güncellenirken bir hata oluştu",
      error: error.message,
    });
  }
};

// @desc    Soruyu sil
// @route   DELETE /api/questions/:id
// @access  Private
export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    // ID validasyonu
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Geçersiz soru ID'si",
      });
    }

    // Soruyu bul ve sil
    const question = await Question.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Soru bulunamadı",
      });
    }

    res.status(200).json({
      success: true,
      message: "Soru başarıyla silindi",
      data: { id: question._id },
    });
  } catch (error) {
    console.error("Soru silme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Soru silinirken bir hata oluştu",
      error: error.message,
    });
  }
};

// @desc    İstatistikleri getir
// @route   GET /api/questions/stats
// @access  Private
export const getQuestionStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Toplam soru sayısı
    const totalQuestions = await Question.countDocuments({ userId });

    // Çözülmüş soru sayısı
    const solvedQuestions = await Question.countDocuments({
      userId,
      cozuldu: true,
    });

    // Çözülmemiş soru sayısı
    const unsolvedQuestions = await Question.countDocuments({
      userId,
      cozuldu: false,
    });

    // Zorluk seviyelerine göre dağılım
    const kolayCount = await Question.countDocuments({
      userId,
      zorluk: "kolay",
    });
    const ortaCount = await Question.countDocuments({
      userId,
      zorluk: "orta",
    });
    const zorCount = await Question.countDocuments({
      userId,
      zorluk: "zor",
    });

    // Kategorilere göre dağılım
    const categoryStats = await Question.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$kategori", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Derslere göre dağılım
    const dersStats = await Question.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $match: { ders: { $ne: "" } } }, // Boş olmayanlar
      { $group: { _id: "$ders", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Son 7 günde eklenen sorular
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentQuestions = await Question.countDocuments({
      userId,
      createdAt: { $gte: sevenDaysAgo },
    });

    res.status(200).json({
      success: true,
      data: {
        total: totalQuestions,
        solved: solvedQuestions,
        unsolved: unsolvedQuestions,
        difficulty: {
          kolay: kolayCount,
          orta: ortaCount,
          zor: zorCount,
        },
        categories: categoryStats,
        subjects: dersStats,
        recentlyAdded: recentQuestions,
        solvedPercentage:
          totalQuestions > 0
            ? Math.round((solvedQuestions / totalQuestions) * 100)
            : 0,
      },
    });
  } catch (error) {
    console.error("İstatistik hatası:", error);
    res.status(500).json({
      success: false,
      message: "İstatistikler alınırken bir hata oluştu",
      error: error.message,
    });
  }
};

// @desc    Birden fazla soruyu sil
// @route   POST /api/questions/delete-multiple
// @access  Private
export const deleteMultipleQuestions = async (req, res) => {
  try {
    const { ids } = req.body;

    // IDs validasyonu
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Geçerli ID listesi gönderilmelidir",
      });
    }

    // Tüm ID'lerin geçerli olduğunu kontrol et
    const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));

    if (validIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Geçerli ID bulunamadı",
      });
    }

    // Soruları sil
    const result = await Question.deleteMany({
      _id: { $in: validIds },
      userId: req.user.id,
    });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} soru başarıyla silindi`,
      data: {
        deletedCount: result.deletedCount,
      },
    });
  } catch (error) {
    console.error("Toplu silme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Sorular silinirken bir hata oluştu",
      error: error.message,
    });
  }
};
/* import UserTarget from "../models/usertarget.js";

// Kullanıcının hedeflerini getir
export const getTargets = async (req, res) => {
  try {
    let target = await UserTarget.findOne({ userId: req.user.id });

    // Eğer hedef yoksa, varsayılan değerlerle oluştur
    if (!target) {
      target = await UserTarget.create({
        userId: req.user.id,
        hedefTYT: 0,
        hedefAYT: 0,
        hedefBolum: "",
      });
    }

    res.status(200).json(target);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Hedefleri güncelle veya oluştur
export const updateTargets = async (req, res) => {
  try {
    const { hedefTYT, hedefAYT, hedefBolum } = req.body;

    let target = await UserTarget.findOne({ userId: req.user.id });

    if (target) {
      // Varsa güncelle
      target.hedefTYT = hedefTYT !== undefined ? hedefTYT : target.hedefTYT;
      target.hedefAYT = hedefAYT !== undefined ? hedefAYT : target.hedefAYT;
      target.hedefBolum =
        hedefBolum !== undefined ? hedefBolum : target.hedefBolum;
      await target.save();
    } else {
      // Yoksa oluştur
      target = await UserTarget.create({
        userId: req.user.id,
        hedefTYT: hedefTYT || 0,
        hedefAYT: hedefAYT || 0,
        hedefBolum: hedefBolum || "",
      });
    }

    res.status(200).json(target);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; */

import User from "../models/user.js";
import { updateUserStats } from "../services/statsService.js";

// @desc    Hedefleri kaydet/güncelle
// @route   POST /api/targets
// @access  Private
export const saveTargets = async (req, res) => {
  try {
    const { branch, tytNet, aytNet } = req.body;

    // Validasyon
    if (!branch) {
      return res.status(400).json({
        success: false,
        message: "Alan seçimi gereklidir",
      });
    }

    if (!tytNet && !aytNet) {
      return res.status(400).json({
        success: false,
        message: "En az bir hedef net girmelisiniz",
      });
    }

    // Net validasyonu
    if (tytNet && (tytNet < 0 || tytNet > 120)) {
      return res.status(400).json({
        success: false,
        message: "TYT neti 0-120 arasında olmalıdır",
      });
    }

    if (aytNet && (aytNet < 0 || aytNet > 80)) {
      return res.status(400).json({
        success: false,
        message: "AYT neti 0-80 arasında olmalıdır",
      });
    }

    // Kullanıcıyı bul ve güncelle
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Kullanıcı bulunamadı",
      });
    }

    // Hedefleri güncelle
    user.targets = {
      branch,
      tytNet: tytNet ? parseFloat(tytNet) : null,
      aytNet: aytNet ? parseFloat(aytNet) : null,
      updatedAt: new Date(),
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: "Hedefler başarıyla kaydedildi",
      data: user.targets,
    });
  } catch (error) {
    console.error("Hedef kaydetme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Hedefler kaydedilirken bir hata oluştu",
      error: error.message,
    });
  }
};

// @desc    Hedefleri getir
// @route   GET /api/targets
// @access  Private
export const getTargets = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("targets");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Kullanıcı bulunamadı",
      });
    }

    res.status(200).json({
      success: true,
      data: user.targets || {
        branch: null,
        tytNet: null,
        aytNet: null,
      },
    });
  } catch (error) {
    console.error("Hedef getirme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Hedefler getirilirken bir hata oluştu",
      error: error.message,
    });
  }
};

// @desc    İstatistikleri getir
// @route   GET /api/targets/stats
// @access  Private
export const getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("stats targets");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Kullanıcı bulunamadı",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        stats: user.stats,
        targets: user.targets,
      },
    });
  } catch (error) {
    console.error("İstatistik getirme hatası:", error);
    res.status(500).json({
      success: false,
      message: "İstatistikler getirilirken bir hata oluştu",
      error: error.message,
    });
  }
};

// @desc    İstatistikleri yeniden hesapla (Manuel trigger)
// @route   POST /api/targets/recalculate-stats
// @access  Private
export const recalculateStats = async (req, res) => {
  try {
    // İstatistikleri yeniden hesapla (Service kullanarak)
    const stats = await updateUserStats(req.user.id);

    res.status(200).json({
      success: true,
      message: "İstatistikler yeniden hesaplandı",
      data: stats,
    });
  } catch (error) {
    console.error("İstatistik hesaplama hatası:", error);
    res.status(500).json({
      success: false,
      message: "İstatistikler hesaplanırken bir hata oluştu",
      error: error.message,
    });
  }
};

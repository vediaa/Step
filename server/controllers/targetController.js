import UserTarget from "../models/usertarget.js";

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
};
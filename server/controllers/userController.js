import User from "../models/user.js";

//senkron fonksiyon await için async lazım
export const getUserData = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.json({ success: false, message: "kullanııc bulunamadı" });
    }

    res.json({
      success: true,
      userData: {
        ad: user.ad,
        isAccountVerified: user.isAccountVerified,
      },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

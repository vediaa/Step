import User from "../models/user.js";

//senkron fonksiyon await için async lazım
export const getUserData = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "kullanııc bulunamadı" });//return kod dursun diye
    }

    res.json({
      success: true,
      userData: {
        ad: user.name,
        email: user.email, // Profil sayfası için e-postayı da ekledik
        isAccountVerified: user.isAccountVerified,
      },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

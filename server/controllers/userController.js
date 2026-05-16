/* import User from "../models/user.js";

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

// Profil bilgilerini güncelleme fonksiyonu
export const updateProfile = async (req, res) => {
  try {
    // 1. Güvenlik görevlisinden (userAuth) gelen kimliği alıyoruz
    const userId = req.user.id; 
    
    // 2. React (Frontend) tarafından gönderilen yeni adı alıyoruz
    // Not: React'te body: JSON.stringify({ ad: userData.name }) yazmıştık, o yüzden 'ad' olarak çekiyoruz.
    const { ad } = req.body; 

    // Boş isim gönderilmesini engelle
    if (!ad || ad.trim() === "") {
      return res.json({ success: false, message: "Lütfen geçerli bir isim girin." });
    }

    // 3. Kullanıcıyı veritabanında bul
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "Kullanıcı bulunamadı." });
    }

    // 4. shenadaki nem olduğu için
    user.name = ad; 
    await user.save();

    return res.json({ 
      success: true, 
      message: "Profil bilgileriniz başarıyla güncellendi." 
    });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
 */

import User from "../models/user.js";

export const getUserData = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "Kullanıcı bulunamadı" });
    }

    return res.json({
      success: true,
      userData: {
        ad:                user.name,
        email:             user.email,
        isAccountVerified: user.isAccountVerified,
        // Rol bilgisi — frontend buna göre hangi sayfayı göstereceğine karar verir
        role:              user.role,
        dersler:           user.dersler || [],
      },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { ad } = req.body;

    if (!ad || ad.trim() === "") {
      return res.json({ success: false, message: "Lütfen geçerli bir isim girin." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "Kullanıcı bulunamadı." });
    }

    user.name = ad;
    await user.save();

    return res.json({ success: true, message: "Profil başarıyla güncellendi." });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
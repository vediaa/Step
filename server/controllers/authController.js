import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import transporter from "../config/nodemailler.js";

export const kayitOl = async (req, res) => {
  const { ad, ePosta, sifre } = req.body;
  if (!ad || !ePosta || !sifre) {
    return res.json({ success: false, message: "eksik bilgi" });
  }

  try {
    const userExists = await User.findOne({ ePosta });
    if (userExists) {
      return res.json({ success: false, message: "kullanıcı zaten maevcut" });
    }
    const hashedPassword = await bcrypt.hash(sifre, 10);
    const user = new User({ ad, ePosta, sifre: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const mailOptions = {
      from: process.env.SENDER_MAIL,
      to: ePosta,
      subject: "hoşgeldiniz",
      text: `
        Merhaba ${ad},
        Kaydınız başarıyla tamamlandı!
       Giriş yapmak için e-posta adresinizi kullanabilirsiniz.
      `,
    };
    await transporter.sendMail(mailOptions);
    return res.json({ success: true, message: "e posta gönderildi" });
  } catch (error) {
    //postmanda hataları göremediğim için bu çok yardımcı oldu
    console.error("Kayıt hatası:", error);
    res.json({ success: false, message: error.message });
  }
};

export const girisYap = async (res, req) => {
  const { ePosta, sifre } = req.body;
  if (!ePosta || !sifre) {
    return res.json({
      success: false,
      message: "email ve şifreniiz girmelisniz",
    });
  }
  try {
    const user = await User.findOne({ ePosta });
    if (!user) {
      return res.json({ success: false, message: "geçersiz mail " });
    }
    const isMatch = await bcrypt.compare(sifre, user.sifre);
    if (!isMatch) {
      return res.json({ success: false, message: "geçersiz sifre" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//fonk adlarını roueterda yazdık
export const cikisYap = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    res.json({ success: false, message: "oturum kapandi" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const sendVerifyOtp = async (req, res) => {
  try {
    const { userId } = req.body; //userıd veritabındaki kullanıc ıdsi jwt sayesinde biz bunu biliyoruz

    const user = await User.findById(userId); //dosyada modeli oluşturduğumzu isim User sonra bu ıdyi veritabbında aratıp kullanıcıyı bulacağız
    //artık veritabındaki değişkenleri kullanabiliriz
    if (user.isAccountVerifed) {
      console.log("burda bir hata oluştu"); //şlimdi burda eğerki bu if in içine girerse sorun demekki hesap doğrulamadı
      return res.json({ success: false, message: "hesap doğrulanmıştı" });
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000)); //6 haneli olacak donr aondalığı atarıaz sting,n amcaı her zmn 6 haneli olsun diye başındaki 0 ı korumak için
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();
    const mailOption = {
      from: process.env.SENDER_MAIL,
      to: user.ePosta,
      subject: "hoşgeldiniz",
      text: `
        kayıt olamk için kodunuz:${otp} Bunu kulllnarak hesabınızı doğrulayabilirsiniz.
      `,
    };

    await transporter.sendMail(mailOption);
  } catch (error) {
    res.json({ success: false, message: "hata aldığılandı" });
  }
};

export const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    return res.json({ success: false, message: "Bilgiler eksik" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "KUllanıcı bulunamadı" });
    }

    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      return res.json({
        success: false,
        message: "otp geçersiz",
      });
    }
    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP nin süresi doldu" });
    }
    user.isAccountVerifed = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    await user.save();
    return res.json({
      success: true,
      message: "Email doğrulama başarılı oldu",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//kullanıcı doğrulaması yap cokkie ile çalışır
export const isAuthenticated = async (req, res) => {
  try {
    return res.json({ success: true });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//her yere email yazmışım ama ePOsta olacak veri tabındaki ile aynı yazılmalı
// şifre sıfırlamak içn otp gönder
export const sendResetOtp = async (req, res) => {
  const { ePosta } = req.body;
  if (!ePosta) {
    return res.json({ success: false, message: "email gerekli " });
  }
  //email varsa try catch içine giriyor
  try {
    const user = await User.findOne({ ePosta });
    if (!user) {
      return res.json({ success: false, message: "Kullanıcı bulunmadı" });
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000)); //6 haneli olacak donr aondalığı atarıaz sting,n amcaı her zmn 6 haneli olsun diye başındaki 0 ı korumak için
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;
    await user.save();
    const mailOption = {
      from: process.env.SENDER_MAIL,
      to: user.ePosta,
      subject: "hoşgeldiniz",
      text: `
        Şifre sıfırlamak için kodunuz:${otp} Bunu kulllnarak şifrenizi değiştirebilrisiniz
      `,
    };
    await transporter.sendMail(mailOption);
    return res.json({
      succes: true,
      massage: "Şifre sıfırlamak için OTP kodu gönderildi",
    });
  } catch (error) {
    return res.json({ succes: false, massage: error.message });
  }
};

//şifre sıfırla

export const resetPassword = async (req, res) => {
  const { ePosta, otp, newPassword } = req.body;

  if (!ePosta || !otp || !newPassword) {
    return res.json({
      succes: false,
      massage: "email otp ve şifre gereklidir",
    });
  }

  try {
    const user = await User.findOne({ ePosta });
    if (!user) {
      return res.json({ success: false, message: "kulalnıcı bulunamadı" });
    }
    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.json({ succes: false, massage: "OTP geçersiz" });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({ succes: false, massage: "OTP nin süresi doldu" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.sifre = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;

    await user.save();
    return res.json({
      succes: false,
      massage: "Şifreniz başarılı bir şekilde güncellendi",
    });
  } catch (error) {
    return res.json({ succes: false, massage: error.message });
  }
};

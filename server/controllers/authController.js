/* import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import transporter from "../config/nodemailler.js";

export const kayitOl = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.json({ success: false, message: "eksik bilgi" });
  }

  try {
    const userExists = await User.findOne({ email });
    
    if (userExists) {
      return res.json({ success: false, message: "kullanıcı zaten mevcut" });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
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
      from: `"Step" <${process.env.SENDER_MAIL}>`,
      to: email,
      subject: "hoşgeldiniz",
      text: `
        Merhaba ${name},
        Kayıt olmak için otp gönderiyoruz.
        Giriş yapmak için e-posta doğrulayın. 
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
//req ve res in yeri değişmiş
export const girisYap = async (req, res) => {
  console.log("Headers:", req.headers['content-type']); // Hangi formatta geliyor?
  console.log("Body içeriği:", req.body); // Veri ulaşıyor mu?
 
  const { email, password } = req.body;
  if (!email || !password) {
    return res.json({
      success: false,
      message: "email ve şifreniiz girmelisniz",
    });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "geçersiz mail " });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "geçersiz password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    
    //token'ı JSON içinde de gönder
    return res.json({ 
      success: true, 
      token: token // Frontend artık burayı okuyabilecek
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//fonk namelarını roueterda yazdık
export const cikisYap = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    res.json({ success: true, message: "oturum kapandi" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const sendVerifyOtp = async (req, res) => {
  try {
    const { id: userId } = req.user; //userıd veritabındaki kullanıc ıdsi jwt sayesinde biz bunu biliyoruz
    
    const user = await User.findById(userId); //dosynamea modeli oluşturduğumzu isim User sonra bu ıdyi veritabbında aratıp kullanıcıyı bulacağız
    //artık veritabındaki değişkenleri kullanabiliriz
    if (user.isAccountVerifed) {
      console.log("hesap zaten doğrulanmış"); //şlimdi burda eğerki bu if in içine girerse sorun demekki hesap doğrulamnameı
      return res.json({ success: true, message: "hesap doğrulanmıştı" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000)); //6 haneli olacak donr aondalığı atarıaz sting,n amcaı her zmn 6 haneli olsun diye başındaki 0 ı korumak için
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    const mailOption = {
      from: `"Step" <${process.env.SENDER_MAIL}>`,
      to: user.email,
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
  const {id: userId} = req.user;
  const { otp } = req.body;

  if (!userId || !otp) {
    return res.json({ success: false, message: "Bilgiler eksik" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "KUllanıcı bulunamnameı" });
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

//her yere email yazmışım ama email olacak veri tabındaki ile aynı yazılmalı
// şifre sıfırlamak içn otp gönder
export const sendResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.json({ success: false, message: "email gerekli " });
  }
  //email varsa try catch içine giriyor
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "Kullanıcı bulunmnameı" });
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000)); //6 haneli olacak donr aondalığı atarıaz sting,n amcaı her zmn 6 haneli olsun diye başındaki 0 ı korumak için
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;
    await user.save();
    const mailOption = {
      from: `"Step" <${process.env.SENDER_MAIL}>`,
      to: user.email,
      subject: "hoşgeldiniz",
      text: `
        Şifre sıfırlamak için kodunuz:${otp} Bunu kulllnarak şifrenizi değiştirebilrisiniz
      `,
    };
    await transporter.sendMail(mailOption);
    return res.json({
      success: true,
      massage: "Şifre sıfırlamak için OTP kodu gönderildi",
    });
  } catch (error) {
    return res.json({ success: false, massage: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.json({ success: false, message: "Email, OTP ve şifre gereklidir" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "Kullanıcı bulunamadı" });
    }
    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.json({ success: false, message: "OTP geçersiz" });
    }
    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP'nin süresi doldu" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;

    await user.save();
    
    // DİKKAT: Burası true olmalı!
    return res.json({ success: true, message: "Şifreniz başarılı bir şekilde güncellendi" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
 */

import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import transporter from "../config/nodemailler.js";

export const kayitOl = async (req, res) => {
  // role: "student" | "teacher"  (frontend'den geliyor)
  // dersler: ["Matematik", "Fizik"]  (sadece öğretmen için)
  const { name, email, password, role, dersler } = req.body;

  if (!name || !email || !password) {
    return res.json({ success: false, message: "Eksik bilgi" });
  }

  if (role && !["student", "teacher"].includes(role)) {
    return res.json({ success: false, message: "Geçersiz rol" });
  }

  if (role === "teacher" && (!dersler || dersler.length === 0)) {
    return res.json({ success: false, message: "Öğretmen en az 1 ders seçmelidir" });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.json({ success: false, message: "Bu e-posta zaten kayıtlı" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role:    role    || "student",
      dersler: role === "teacher" ? (dersler || []) : [],
    });

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
      from: `"Step" <${process.env.SENDER_MAIL}>`,
      to: email,
      subject: "Hoşgeldiniz",
      text: `Merhaba ${name}, kayıt olduğunuz için teşekkürler. Hesabınızı doğrulamak için e-postanızı kontrol edin.`,
    };

    await transporter.sendMail(mailOptions);

    return res.json({ success: true, token, message: "Kayıt başarılı" });
  } catch (error) {
    console.error("Kayıt hatası:", error);
    return res.json({ success: false, message: error.message });
  }
};

export const girisYap = async (req, res) => {
  console.log("Headers:", req.headers["content-type"]);
  console.log("Body içeriği:", req.body);

  const { email, password } = req.body;
  if (!email || !password) {
    return res.json({ success: false, message: "Email ve şifrenizi girmelisiniz" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "Geçersiz mail" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Geçersiz şifre" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true, token });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const cikisYap = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    return res.json({ success: true, message: "Oturum kapatıldı" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const sendVerifyOtp = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const user = await User.findById(userId);

    if (user.isAccountVerifed) {
      console.log("Hesap zaten doğrulanmış");
      return res.json({ success: true, message: "Hesap zaten doğrulanmış" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    const mailOption = {
      from: `"Step" <${process.env.SENDER_MAIL}>`,
      to: user.email,
      subject: "E-posta Doğrulama",
      text: `Kayıt olmak için kodunuz: ${otp}. Bu kodu kullanarak hesabınızı doğrulayabilirsiniz.`,
    };

    await transporter.sendMail(mailOption);
    return res.json({ success: true, message: "OTP gönderildi" });
  } catch (error) {
    return res.json({ success: false, message: "Hata oluştu" });
  }
};

export const verifyEmail = async (req, res) => {
  const { id: userId } = req.user;
  const { otp } = req.body;

  if (!userId || !otp) {
    return res.json({ success: false, message: "Bilgiler eksik" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "Kullanıcı bulunamadı" });
    }

    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      return res.json({ success: false, message: "OTP geçersiz" });
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP süresi doldu" });
    }

    user.isAccountVerifed = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    await user.save();

    return res.json({ success: true, message: "Email doğrulama başarılı" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const isAuthenticated = async (req, res) => {
  try {
    return res.json({ success: true });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const sendResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.json({ success: false, message: "Email gerekli" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "Kullanıcı bulunamadı" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;
    await user.save();

    const mailOption = {
      from: `"Step" <${process.env.SENDER_MAIL}>`,
      to: user.email,
      subject: "Şifre Sıfırlama",
      text: `Şifre sıfırlamak için kodunuz: ${otp}`,
    };

    await transporter.sendMail(mailOption);
    return res.json({ success: true, message: "Şifre sıfırlama OTP kodu gönderildi" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.json({ success: false, message: "Email, OTP ve şifre gereklidir" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "Kullanıcı bulunamadı" });
    }

    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.json({ success: false, message: "OTP geçersiz" });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP süresi doldu" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;
    await user.save();

    return res.json({ success: true, message: "Şifreniz başarıyla güncellendi" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
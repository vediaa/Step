import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verifyOtp: { type: String, default: "" }, //one time pasword doğrulama
    verifyOtpExpireAt: { type: Number, default: 0 }, //geçerlilik süresi
    isAccountVerified: { type: Boolean, default: false }, //hesap doğrulandı mı
    resetOtp: { type: String, default: "" },
    resetOtpExpireAt: { type: Number, default: 0 },
    newPassword: { type: String, default: "" },

    aktif: { type: Boolean, default: false },
    aktivasyonKodu: { type: String },
    kodSonTarih: { type: Date },
    sifreSifirlaKodu: { type: String },
    sifreSifirlaSonTarih: { type: Date },
  },
  { timestamps: true }
  //Bir verinin ne zaman oluşturulduğunu ve ne zaman değiştirildiğini otomatik bilmek
);

//Eğer mongoose.models içinde "user" (veya "Kullanici") modeli zaten varsa, yeniden oluşturma → onu kullan.
const User = mongoose.models.user || mongoose.model("user", UserSchema); //mongo baş harfi kü.ültüp sonuna s ekleyecek
export default User;

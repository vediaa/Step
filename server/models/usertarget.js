import mongoose from "mongoose";

const UserTargetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Her kullanıcının tek bir hedef kaydı olur
    },
    hedefTYT: {
      type: Number,
      default: 0,
      min: 0,
      max: 120, // TYT maksimum net
    },
    hedefAYT: {
      type: Number,
      default: 0,
      min: 0,
      max: 80, // AYT maksimum net (Alan sınavına göre değişebilir)
    },
    hedefBolum: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true, // createdAt ve updatedAt otomatik eklenir
  }
);

// Index - hızlı sorgular için
UserTargetSchema.index({ userId: 1 });

const UserTarget =
  mongoose.models.UserTarget ||
  mongoose.model("UserTarget", UserTargetSchema);

export default UserTarget;
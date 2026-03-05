import mongoose from "mongoose";

// Görev Schema'si
const TaskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    date: {
      type: String, // "YYYY-MM-DD" formatında
      required: true,
      index: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    // Bildirim için (opsiyonel - mobilde var)
    notificationId: {
      type: String,
      default: null,
    },
    notificationDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt ve updatedAt
  }
);

// Compound index - kullanıcının belirli tarihteki görevlerini hızlı getirmek için
TaskSchema.index({ userId: 1, date: 1 });

// Tamamlanmamış görevleri bulmak için
TaskSchema.index({ userId: 1, completed: 1, date: 1 });

const Task = mongoose.models.Task || mongoose.model("Task", TaskSchema);

export default Task;
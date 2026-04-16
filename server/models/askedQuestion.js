import mongoose from "mongoose";
import { atlasConnection } from "../config/db.js";

const AskedQuestionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Öğrencinin soru hazinesindeki soruyla bağlantı (opsiyonel)
    sourceQuestionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      default: null,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    extractedText: {
      type: String,
      default: "",
    },
    embedding: {
      type: [Number],
      default: [],
    },
    ders: {
      type: String,
      default: "Genel",
    },
    status: {
      type: String,
      enum: ["pending", "answered"],
      default: "pending",
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    answer: {
      text: { type: String, default: "" },
      imageUrl: { type: String, default: "" },
      answeredAt: { type: Date, default: null },
    },
    isDuplicate: {
      type: Boolean,
      default: false,
    },
    linkedQuestionId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  { timestamps: true }
);

const AskedQuestion = atlasConnection.model(
  "AskedQuestion",
  AskedQuestionSchema
);

export default AskedQuestion;
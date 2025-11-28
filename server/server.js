import express from "express"; //burada başlıyor her şey
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongoDB.js"; //modül içi boşken hata vermişti

import authRoutes from "./routes/authRoutes.js";
//import soruRoutes from "./routes/soruRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

//güvenlik sağlar
const allowedOrigins = [process.env.FRONTEND_URL]; //sadece izin verilen domainler

// Middleware'ler
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, //cokkie için
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true })); //sonradan  ekledim dennem
app.use(cookieParser());

// API Uç Noktaları
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
//app.use("/api/soru", soruRoutes);

app.get("/", (req, res) => {
  res.send("API çalışıyor (harikasın)");
});

app.listen(PORT, () =>
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`)
);

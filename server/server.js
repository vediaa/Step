import express from "express"; //burada başlıyor her şey
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongoDB.js"; //modül içi boşken hata vermişti

import authRoutes from "./routes/authRoutes.js";
//import soruRoutes from "./routes/soruRoutes.js";
import userRoutes from "./routes/userRoutes.js";

import examRoutes from "./routes/examRoutes.js";
import targetRoutes from "./routes/targetRoutes.js"; 
import taskRoutes from "./routes/taskRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import questionRoutes from "./routes/questionRoutes.js"


dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5001;

//güvenlik sağlar
const allowedOrigins = [process.env.FRONTEND_URL]; //sadece izin verilen domainler

// Middleware'ler
app.use(
  cors({
    origin:'http://localhost:5173' ,//allowedOrigins
    credentials: true, //cokkie için
  })
);

// ⚠️ ÖNEMLİ: Body parser limitleri ARTIRMA
// Base64 fotoğraflar için 10MB limit (gerekirse 20MB'a çıkarabilirsiniz)
app.use(express.json({ 
  limit: '10mb',           // JSON body limiti
  parameterLimit: 50000    // Parametre limiti
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',           // URL encoded limiti
  parameterLimit: 50000 
}));

/* app.use(express.json());
app.use(express.urlencoded({ extended: true })); //sonradan  ekledim dennem */
app.use(cookieParser());

// API route grubu ve endpointler
// /api/auth ile başlayan istekleri authRoutese gönderecek
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
//yeni
app.use("/api/exams", examRoutes);  // Deneme işlemleri
app.use("/api/targets", targetRoutes); 
app.use("/api/tasks", taskRoutes); 
app.use("/api/progress", progressRoutes);
app.use("/api/questions", questionRoutes);



//app.use("/api/soru", soruRoutes);

app.get("/", (req, res) => {
  res.send("API çalışıyor (harikasın)");
});

app.listen(PORT, () =>
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`)
);

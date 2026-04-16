import mongoose from "mongoose";


// Atlas için ayrı, Local için ayrı bağlantı değişkenleri oluşturuyoruz
export let localConnection;
export let atlasConnection;

const connectDB = async () => {
  try {
    localConnection = await mongoose.createConnection(process.env.MONGO_URI);
    console.log(`MongoDB Bağlandı: ${localConnection.host}`);

    // 2. YENİ ATLAS (VEKTÖR) BAĞLANTIN
    // .env dosyana ATLAS_URI = mongodb+srv://vedia:sifre@cluster0... eklemelisin
    atlasConnection = await mongoose.createConnection(process.env.ATLAS_URI);
    console.log(`Atlas Vektör Veritabanı Hazır: ${atlasConnection.host}`);
    
  } catch (error) {
    console.error(`MongoDB Bağlantı Hatası: ${error.message}`);
    process.exit(1);
  }
};
export default connectDB;

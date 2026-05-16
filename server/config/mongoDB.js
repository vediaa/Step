/* import mongoose from "mongoose";


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
 */

import mongoose from "mongoose";

export let atlasConnection;

const connectDB = async () => {
try {


// ANA DATABASE
await mongoose.connect(process.env.MONGO_URI);

console.log("Main MongoDB Connected");


// VECTOR DATABASE
atlasConnection = mongoose.createConnection(process.env.ATLAS_URI);

await atlasConnection.asPromise();

console.log("Atlas Vector DB Connected");


} catch (error) {
console.log(error);
process.exit(1);
}
};

export default connectDB;


const cleanExtractedText = (rawText) => {
  let lines = rawText.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  
  let startIdx = 0;
  let endIdx = lines.length - 1;

  // A) ALT KISKAÇ: Son şıkkı bul, sonrasını (sayfa no, yayınevi) tamamen kes!
  for (let i = lines.length - 1; i >= 0; i--) {
    if (/^[A-E][)\.]\s/.test(lines[i]) || /^[A-E]\)/.test(lines[i])) {
      endIdx = i;
      break; 
    }
  }

  // B) ÜST KISKAÇ: Soru numarasını veya ilk uzun cümleyi bul
  for (let i = 0; i < lines.length; i++) {
    if (/^\d+[\.\)]/.test(lines[i]) || lines[i].length > 15) {
      startIdx = i;
      break;
    }
  }

  // Sadece ortadaki soruyu alıyoruz
  let coreQuestion = lines.slice(startIdx, endIdx + 1);

  // C) SENİN KISITLAMALARIN (Güvenli hale getirilmiş)
  return coreQuestion.filter((l) => {
      // Şıkları veya kısa matematik terimlerini koru, ama anlamsız 1-2 harfleri at
      if (l.length < 3 && !/^[A-E]\)/.test(l) && !/\d/.test(l)) return false; 
      
      // Senin TYT/AYT yayıncı filtren (Soru gövdesi içinde geçerse sil)
      if (/yayın|yayıncı|test\s*\d+|deneme\s*\d+|TYT|AYT|soru\s*bankası|HiperZeka/i.test(l)) return false;
      
      return true;
  }).join("\n").trim();
};

// 2. SENİN EFSANE GEOMETRİ GÜÇLENDİRİCİN (Aynen korundu!)
const enhanceGeometry = (text) => {
  const geometryTerms =
    /üçgen|kare|dikdörtgen|daire|çember|açı|kenar|alan|çevre|hacim|koordinat|grafik|fonksiyon|parabol|hipotenüs|sinüs|kosinüs|tanjant|vektör|matris/gi;
  const matches = text.match(geometryTerms);
  if (matches) {
    const unique = [...new Set(matches.map((m) => m.toLowerCase()))];
    return `${text} [geometri_terimleri: ${unique.join(", ")}]`;
  }
  return text;
};


export const extractTextFromImage = async (imageBuffer) => {
  try {
    const base64Image = imageBuffer.toString("base64");

    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [
            {
              image: { content: base64Image },
              features: [
                { type: "DOCUMENT_TEXT_DETECTION" }, 
                { type: "OBJECT_LOCALIZATION" },      
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    const result = data.responses[0];
    const rawText = result.fullTextAnnotation?.text || "";
    const shapes = result.localizedObjectAnnotations?.map((obj) => obj.name).join(", ") || "";

    // Önce Kıskaçla temizle, sonra Geometri ile güçlendir!
    const cleanText = cleanExtractedText(rawText);
    const enhancedText = enhanceGeometry(cleanText);

    const combined = shapes ? `${enhancedText} | shapes: ${shapes}` : enhancedText;

    console.log("🔍 Vision API Ham Metin Uzunluğu:", rawText.length);
    console.log("✨ Temizlenmiş ve Güçlendirilmiş Metin:\n", combined);
    
    return combined;

  } catch (error) {
    console.error("❌ Vision API Hatası:", error.message);
    throw new Error("Görsel okunamadı");
  }
};
/* //çalışan kod
// export const extractTextFromImage = async (imageBuffer) => {
  try {
    const base64Image = imageBuffer.toString("base64");

    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [
            {
              image: { content: base64Image },
              features: [
                { type: "DOCUMENT_TEXT_DETECTION" },
                { type: "OBJECT_LOCALIZATION" },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    const result = data.responses[0];
    const text = result.fullTextAnnotation?.text || "";
    const shapes = result.localizedObjectAnnotations
      ?.map((obj) => obj.name)
      .join(", ") || "";

    const combined = `${text} | shapes: ${shapes}`.trim();
    console.log("Vision API çıktı:", combined);
    return combined;

  } catch (error) {
    console.error("Vision API Hatası:", error.message);
    throw new Error("Görsel okunamadı");
  }
}; */



/* import vision from "@google-cloud/vision";

const client = new vision.ImageAnnotatorClient({
  apiKey: process.env.GOOGLE_API_KEY,
});

export const extractTextFromImage = async (imageBuffer) => {
  try {
    const [result] = await client.annotateImage({
      image: { content: imageBuffer.toString("base64") },
      features: [
        { type: "DOCUMENT_TEXT_DETECTION" }, // metin okuma
        { type: "OBJECT_LOCALIZATION" },      // şekil tanıma (geometri için)
      ],
    });

    const text = result.fullTextAnnotation?.text || "";
    
    const shapes = result.localizedObjectAnnotations
      ?.map((obj) => obj.name)
      .join(", ") || "";

    const combined = `${text} | shapes: ${shapes}`.trim();

    console.log("Vision API çıktı:", combined);
    return combined;
    
  } catch (error) {
    console.error("Vision API Hatası:", error.message);
    throw new Error("Görsel okunamadı");
  }
}; */
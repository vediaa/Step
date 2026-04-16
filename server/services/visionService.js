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
};



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
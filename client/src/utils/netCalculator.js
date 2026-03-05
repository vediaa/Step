
 /* export const hesaplaNet = (dogru, yanlis) =>
  Number((dogru - yanlis * 0.25).toFixed(2)); */

 /**
 * Net Hesaplama Yardımcı Fonksiyonları
 * Mobil koddaki hesaplama mantığının birebir aynısı
 */

/**
 * Verilen doğru ve yanlış sayılarına göre neti hesaplar.
 * Formül: Doğru - (Yanlış / 4)
 * @param {number|string} correct - Doğru sayısı
 * @param {number|string} wrong - Yanlış sayısı
 * @returns {number} Hesaplanan net değeri (2 ondalık basamak)
 */
export const calculateNet = (correct, wrong) => {
  const numCorrect = isNaN(Number(correct)) ? 0 : Number(correct);
  const numWrong = isNaN(Number(wrong)) ? 0 : Number(wrong);
  return parseFloat((numCorrect - numWrong / 4).toFixed(2));
};

/**
 * TYT deneme derslerinin netlerini toplayarak toplam TYT netini hesaplar.
 * @param {object} tytScores - TYT derslerinin correct ve wrong sayılarını içeren obje
 * @returns {number} Toplam TYT neti
 * 
 * Örnek tytScores:
 * {
 *   turkce: { correct: 30, wrong: 10 },
 *   matematik: { correct: 28, wrong: 12 },
 *   sosyal: { correct: 15, wrong: 5 },
 *   fen: { correct: 18, wrong: 2 }
 * }
 */
export const calculateTYTTotalNet = (tytScores) => {
  const turkceNet = calculateNet(
    tytScores?.turkce?.correct,
    tytScores?.turkce?.wrong
  );
  const matematikNet = calculateNet(
    tytScores?.matematik?.correct,
    tytScores?.matematik?.wrong
  );
  const sosyalNet = calculateNet(
    tytScores?.sosyal?.correct,
    tytScores?.sosyal?.wrong
  );
  const fenNet = calculateNet(
    tytScores?.fen?.correct,
    tytScores?.fen?.wrong
  );

  const nets = [turkceNet, matematikNet, sosyalNet, fenNet];
  return parseFloat(nets.reduce((sum, net) => sum + net, 0).toFixed(2));
};

/**
 * AYT deneme derslerinin netlerini ve kullanıcının bölümünü dikkate alarak toplam AYT netini hesaplar.
 * @param {object} aytScores - AYT derslerinin correct ve wrong sayılarını içeren obje
 * @param {string} targetBranch - Kullanıcının hedef bölümü ('Sayısal', 'Eşit Ağırlık', 'Sözel')
 * @returns {number} Toplam AYT neti
 * 
 * Bölüm Bazlı Hesaplama:
 * - Sayısal: AYT Matematik + AYT Fen
 * - Eşit Ağırlık: AYT Matematik + AYT Edebiyat
 * - Sözel: AYT Edebiyat + AYT Sosyal 1 + AYT Sosyal 2
 * - Belirtilmemişse: Tüm dersler
 * 
 * Örnek aytScores:
 * {
 *   aytMatematik: { correct: 25, wrong: 15 },
 *   aytFen: { correct: 20, wrong: 10 },
 *   aytEdebiyat: { correct: 18, wrong: 6 },
 *   aytSosyal1: { correct: 12, wrong: 8 },
 *   aytSosyal2: { correct: 10, wrong: 5 }
 * }
 */
export const calculateAYTTotalNet = (aytScores, targetBranch) => {
  const aytMatematikNet = calculateNet(
    aytScores?.aytMatematik?.correct,
    aytScores?.aytMatematik?.wrong
  );
  const aytFenNet = calculateNet(
    aytScores?.aytFen?.correct,
    aytScores?.aytFen?.wrong
  );
  const aytEdebiyatNet = calculateNet(
    aytScores?.aytEdebiyat?.correct,
    aytScores?.aytEdebiyat?.wrong
  );
  const aytSosyal1Net = calculateNet(
    aytScores?.aytSosyal1?.correct,
    aytScores?.aytSosyal1?.wrong
  );
  const aytSosyal2Net = calculateNet(
    aytScores?.aytSosyal2?.correct,
    aytScores?.aytSosyal2?.wrong
  );

  let nets = [];

  if (targetBranch === "Sayısal") {
    nets = [aytMatematikNet, aytFenNet];
  } else if (targetBranch === "Eşit Ağırlık") {
    nets = [aytMatematikNet, aytEdebiyatNet];
  } else if (targetBranch === "Sözel") {
    nets = [aytEdebiyatNet, aytSosyal1Net, aytSosyal2Net];
  } else {
    // Bölüm belirlenmediyse veya geçersizse, tüm AYT derslerini dahil et
    nets = [
      aytMatematikNet,
      aytFenNet,
      aytEdebiyatNet,
      aytSosyal1Net,
      aytSosyal2Net,
    ];
  }

  return parseFloat(nets.reduce((sum, net) => sum + net, 0).toFixed(2));
};

/**
 * Ders adlarını Türkçe karşılıklarına çevirir
 * @param {string} subject - Ders kodu (turkce, matematik, vb.)
 * @returns {string} Türkçe ders adı
 */
export const getSubjectName = (subject) => {
  const subjectNames = {
    turkce: "Türkçe",
    matematik: "Matematik",
    sosyal: "Sosyal Bilimler",
    fen: "Fen Bilimleri",
    aytMatematik: "AYT Matematik",
    aytFen: "AYT Fen Bilimleri",
    aytEdebiyat: "AYT Edebiyat",
    aytSosyal1: "AYT Sosyal 1",
    aytSosyal2: "AYT Sosyal 2",
  };

  return subjectNames[subject] || subject;
};
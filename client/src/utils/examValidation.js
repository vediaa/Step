// utils/examValidation.js
// Frontend validasyon fonksiyonları

// Soru limitleri (Backend ile aynı)
export const EXAM_LIMITS = {
  TYT: {
    turkce: { max: 40, name: "Türkçe" },
    matematik: { max: 40, name: "Matematik" },
    sosyal: { max: 20, name: "Sosyal Bilimler" },
    fen: { max: 20, name: "Fen Bilimleri" },
  },
  AYT: {
    aytMatematik: { max: 40, name: "Matematik" },
    aytFizik: { max: 14, name: "Fizik" },
    aytKimya: { max: 13, name: "Kimya" },
    aytBiyoloji: { max: 13, name: "Biyoloji" },
    aytEdebiyat: { max: 24, name: "Edebiyat" },
    aytTarih1: { max: 10, name: "Tarih-1" },
    aytCografya1: { max: 6, name: "Coğrafya-1" },
    aytTarih2: { max: 11, name: "Tarih-2" },
    aytCografya2: { max: 11, name: "Coğrafya-2" },
    aytFelsefe: { max: 12, name: "Felsefe" },
    aytDin: { max: 6, name: "Din Kültürü" },
    aytDil: { max: 80, name: "Yabancı Dil" },
  },
};

/**
 * Tek bir ders için input validasyonu
 * @param {String} examType - TYT veya AYT
 * @param {String} subject - Ders adı
 * @param {Number} dogru - Doğru sayısı
 * @param {Number} yanlis - Yanlış sayısı
 * @param {Number} bos - Boş sayısı
 * @returns {Object} { valid, error, warning, autoCalculated }
 */
export const validateSubjectInput = (
  examType,
  subject,
  dogru,
  yanlis,
  bos = null
) => {
  const limit = EXAM_LIMITS[examType]?.[subject];

  if (!limit) {
    return {
      valid: false,
      error: "Geçersiz ders",
    };
  }

  // Sayıya çevir
  const d = parseInt(dogru) || 0;
  const y = parseInt(yanlis) || 0;
  const b = bos !== null ? parseInt(bos) || 0 : null;

  // Negatif kontrol
  if (d < 0 || y < 0 || (b !== null && b < 0)) {
    return {
      valid: false,
      error: "Negatif değer girilemez",
    };
  }

  // Tek başına doğru/yanlış kontrolü
  if (d > limit.max) {
    return {
      valid: false,
      error: `${limit.name} için maksimum ${limit.max} doğru girilebilir`,
    };
  }

  if (y > limit.max) {
    return {
      valid: false,
      error: `${limit.name} için maksimum ${limit.max} yanlış girilebilir`,
    };
  }

  // YENİ HALİ: Frontend'den gelen gecikmeli "bos" verisini validasyona katmıyoruz!
  // Sadece Doğru ve Yanlışın toplamı Maksimum soruyu geçiyor mu diye bakıyoruz.
  const total = d + y; 

  if (total > limit.max) {
    return {
      valid: false,
      error: `${limit.name}: Doğru ve yanlışların toplamı ${limit.max}'ı geçemez (Girilen: ${total})`,
    };
  }

  // Otomatik boş hesaplama
  let autoCalculatedBos = null;
  if (b === null || b === "") {
    autoCalculatedBos = limit.max - d - y;
  }

  // Uyarılar
  let warning = null;
  if (total === 0) {
    warning = "Hiç soru girilmedi";
  } else if (d === 0 && y === 0) {
    warning = "Tüm sorular boş";
  }

  return {
    valid: true,
    error: null,
    warning,
    autoCalculatedBos,
    remaining: limit.max - total,
  };
};

/**
 * Tüm deneme validasyonu
 * @param {String} examType - TYT veya AYT
 * @param {Object} scores - Tüm skorlar
 * @returns {Object} { valid, errors }
 */
export const validateExam = (examType, scores) => {
  const errors = [];

  Object.entries(scores).forEach(([subject, data]) => {
    if (!data) return;

    const { dogru, yanlis, bos } = data;
    const validation = validateSubjectInput(
      examType,
      subject,
      dogru,
      yanlis,
      bos
    );

    if (!validation.valid) {
      errors.push(`${EXAM_LIMITS[examType][subject]?.name}: ${validation.error}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Deneme adı validasyonu
 * @param {String} name - Deneme adı
 * @returns {Object} { valid, error }
 */
export const validateExamName = (name) => {
  if (!name || name.trim() === "") {
    return {
      valid: false,
      error: "Deneme adı gereklidir",
    };
  }

  if (name.length > 100) {
    return {
      valid: false,
      error: "Deneme adı 100 karakterden uzun olamaz",
    };
  }

  return { valid: true, error: null };
};

/**
 * Hedef net validasyonu
 * @param {Number} tytNet - TYT hedef net
 * @param {Number} aytNet - AYT hedef net
 * @returns {Object} { valid, errors }
 */
export const validateTargets = (tytNet, aytNet) => {
  const errors = [];

  if (tytNet !== null && tytNet !== "" && tytNet !== undefined) {
    const tyt = parseFloat(tytNet);
    if (isNaN(tyt)) {
      errors.push("TYT neti sayısal bir değer olmalıdır");
    } else if (tyt < 0 || tyt > 120) {
      errors.push("TYT neti 0-120 arasında olmalıdır");
    }
  }

  if (aytNet !== null && aytNet !== "" && aytNet !== undefined) {
    const ayt = parseFloat(aytNet);
    if (isNaN(ayt)) {
      errors.push("AYT neti sayısal bir değer olmalıdır");
    } else if (ayt < 0 || ayt > 80) {
      errors.push("AYT neti 0-80 arasında olmalıdır");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Input değerini sadece sayılara filtrele
 * @param {String} value - Input değeri
 * @returns {String} Filtrelenmiş değer
 */
export const filterNumericInput = (value) => {
  return value.replace(/[^0-9]/g, "");
};

/**
 * Float input (ondalıklı) filtrele
 * @param {String} value - Input değeri
 * @returns {String} Filtrelenmiş değer
 */
export const filterFloatInput = (value) => {
  // Sadece sayı ve tek nokta
  return value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
};

/**
 * Boş değeri otomatik hesapla
 * @param {Number} dogru - Doğru sayısı
 * @param {Number} yanlis - Yanlış sayısı
 * @param {Number} max - Maksimum soru sayısı
 * @returns {Number} Boş sayısı
 */
export const calculateEmpty = (dogru, yanlis, max) => {
  const d = parseInt(dogru) || 0;
  const y = parseInt(yanlis) || 0;
  const remaining = max - d - y;
  return remaining >= 0 ? remaining : 0;
};

/**
 * Real-time validation (Her input değişikliğinde)
 * @param {String} examType - TYT veya AYT
 * @param {String} subject - Ders adı
 * @param {String} field - dogru/yanlis/bos
 * @param {String} value - Yeni değer
 * @param {Object} currentData - Mevcut ders verisi
 * @returns {Object} { valid, value, error, warning }
 */
export const validateInputChange = (
  examType,
  subject,
  field,
  value,
  currentData
) => {
  // Sadece sayılara filtrele
  const filtered = filterNumericInput(value);

  // Boş değer kontrolü
  if (filtered === "") {
    return {
      valid: true,
      value: "",
      error: null,
      warning: null,
    };
  }

  const num = parseInt(filtered);
  const limit = EXAM_LIMITS[examType]?.[subject];

  if (!limit) {
    return {
      valid: false,
      value: filtered,
      error: "Geçersiz ders",
    };
  }

  // Tek başına max kontrolü
  if (num > limit.max) {
    return {
      valid: false,
      value: filtered,
      error: `Maksimum ${limit.max}`,
    };
  }

  // Toplam kontrolü
  const newData = { ...currentData, [field]: num };
  const total =
    (parseInt(newData.dogru) || 0) +
    (parseInt(newData.yanlis) || 0) +
    (parseInt(newData.bos) || 0);

  if (total > limit.max) {
    return {
      valid: false,
      value: filtered,
      error: `Toplam ${limit.max}'ı geçemez`,
    };
  }

  return {
    valid: true,
    value: filtered,
    error: null,
    warning: null,
  };
};

// Export helper objesi
export default {
  EXAM_LIMITS,
  validateSubjectInput,
  validateExam,
  validateExamName,
  validateTargets,
  filterNumericInput,
  filterFloatInput,
  calculateEmpty,
  validateInputChange,
};
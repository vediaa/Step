// pages/Exams/components/SubjectRow/SubjectRow.jsx
import { useState, useEffect } from "react";
import { calculateNet } from "../../../../utils/netCalculator";
import {
  validateInputChange,
  calculateEmpty,
  EXAM_LIMITS,
} from "../../../../utils/examValidation";
import "./SubjectRow.css";

const SubjectRow = ({
  label,
  examType,
  subject,
  dogru,
  yanlis,
  bos,
  onDogruChange,
  onYanlisChange,
  onBosChange,
  showAutoEmpty = true, // Otomatik boş hesaplansın mı?
}) => {
  const [errors, setErrors] = useState({
    dogru: null,
    yanlis: null,
    bos: null,
  });
  const [autoEmpty, setAutoEmpty] = useState(null);

  const limit = EXAM_LIMITS[examType]?.[subject];
  const max = limit?.max || 0;

  // Otomatik boş hesaplama (Kesin Çözüm)
  useEffect(() => {
    if (showAutoEmpty) {
      // 1. Doğru ve Yanlış değerlerini sayıya çevir (Boş bırakılırsa 0 say)
      const numDogru = Number(dogru) || 0;
      const numYanlis = Number(yanlis) || 0;

      // 2. Kalan boş sayısını hesapla
      const calculatedBos = max - (numDogru + numYanlis);

      // 3. Eğer hesaplanan değer mantıklıysa (eksiye düşmüyorsa) state'i güncelle
      if (calculatedBos >= 0 && calculatedBos <= max) {
        setAutoEmpty(calculatedBos);

        // Parent bileşene (forma) yeni boş sayısını gönder
        if (onBosChange) {
          onBosChange(calculatedBos.toString());
        }
      }
    }
  }, [dogru, yanlis, max, showAutoEmpty]);
  // DİKKAT: 'bos' state'ini bağımlılık (dependency) dizisinden ÇIKARDIK!
  // Çünkü bos değiştikçe değil, SADECE dogru ve yanlis değiştikçe çalışmasını istiyoruz.

  // Net hesaplama
  const net = calculateNet(parseInt(dogru) || 0, parseInt(yanlis) || 0).toFixed(
    2,
  );

  // Input değişikliği
  const handleInputChange = (field, value) => {
    const currentData = {
      dogru: dogru || "",
      yanlis: yanlis || "",
      // İŞTE SİHİRLİ DOKUNUŞ: Eğer boş otomatik hesaplanıyorsa,
      // validasyon sırasında boş'u 0 kabul et ki Doğru/Yanlış girişini engellemesin!
      bos: showAutoEmpty ? "0" : bos || "",
    };

    const validation = validateInputChange(
      examType,
      subject,
      field,
      value,
      currentData,
    );

    // Hata durumu
    setErrors((prev) => ({
      ...prev,
      [field]: validation.error,
    }));

    // Valid ise parent'a bildir
    if (validation.valid) {
      if (field === "dogru") onDogruChange(validation.value);
      if (field === "yanlis") onYanlisChange(validation.value);
      if (field === "bos") onBosChange(validation.value);
    }
  };

  // Toplam girilen (ÇÖZÜLEN) soru: Boşları saymıyoruz ki Progress Bar dolsun!
  const total = (parseInt(dogru) || 0) + (parseInt(yanlis) || 0);

  // Kalan soru (Çözülmeyi bekleyen)
  const remaining = max - total;

  // Progress yüzdesi
  const progressPercentage = (total / max) * 100;

  return (
    <div className="subject-row">
      {/* Ders Adı */}
      <div className="subject-label-container">
        <span className="subject-label">{label}</span>
        <span className="subject-max">/{max}</span>
      </div>

      {/* Input'lar */}
      <div className="subject-inputs">
        {/* Doğru */}
        <div className="input-wrapper">
          <input
            type="text"
            inputMode="numeric"
            className={`subject-input ${errors.dogru ? "error" : ""}`}
            value={dogru}
            onChange={(e) => handleInputChange("dogru", e.target.value)}
            placeholder="D"
            maxLength="3"
          />
          <label className="input-label">D</label>
          {errors.dogru && <span className="input-error">{errors.dogru}</span>}
        </div>

        {/* Yanlış */}
        <div className="input-wrapper">
          <input
            type="text"
            inputMode="numeric"
            className={`subject-input ${errors.yanlis ? "error" : ""}`}
            value={yanlis}
            onChange={(e) => handleInputChange("yanlis", e.target.value)}
            placeholder="Y"
            maxLength="3"
          />
          <label className="input-label">Y</label>
          {errors.yanlis && (
            <span className="input-error">{errors.yanlis}</span>
          )}
        </div>

        {/* Boş */}
        <div className="input-wrapper">
          <input
            type="text"
            inputMode="numeric"
            readOnly={true} // KULLANICI BURAYA TIKLAYAMAZ, SADECE GÖRÜR
            className={`subject-input ${
              autoEmpty !== null ? "auto-filled" : ""
            } ${errors.bos ? "error" : ""}`}
            value={autoEmpty !== null ? autoEmpty : bos}
            onChange={(e) => handleInputChange("bos", e.target.value)}
            placeholder="B"
            maxLength="3"
            disabled={showAutoEmpty && autoEmpty !== null}
          />
          <label className="input-label">B</label>
          {errors.bos && <span className="input-error">{errors.bos}</span>}
        </div>

        {/* Net Sonucu */}
        <div className="net-result-container">
          <span className="net-result">{net}</span>
          <span className="net-label-small">net</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="subject-progress">
        <div className="progress-bar-container">
          <div
            className={`progress-bar ${
              progressPercentage > 100 ? "over-limit" : ""
            }`}
            style={{
              width: `${Math.min(progressPercentage, 100)}%`,
            }}
          />
        </div>
        <div className="progress-info">
          <span className={`progress-text ${remaining < 0 ? "error" : ""}`}>
            {remaining >= 0
              ? `${remaining} kaldı`
              : `${Math.abs(remaining)} fazla!`}
          </span>
          <span className="progress-percentage">
            {total}/{max}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SubjectRow;

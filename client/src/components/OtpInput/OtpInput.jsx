import React, { useState, useRef, useEffect } from "react";
import "./OtpInput.css";

const OtpInput = ({ length = 6, onOtpSubmit }) => {
  const [otp, setOtp] = useState(new Array(length).fill(""));
  const inputRefs = useRef([]);

  // Sayfa açıldığında ilk kutuya otomatik odaklansın
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, e) => {
    const value = e.target.value;
    if (isNaN(value)) return; // Sadece rakam girilmesine izin ver

    const newOtp = [...otp];
    // Sadece son girilen karakteri al (kutuya birden fazla rakam yazılmasın)
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Bütün kutular dolduysa üst bileşene (sayfaya) şifreyi gönder
    const combinedOtp = newOtp.join("");
    if (combinedOtp.length === length) {
      onOtpSubmit(combinedOtp);
    }

    // Değer girildiyse ve son kutuda değilsek, bir sonraki kutuya geç
    if (value && index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Backspace (Silme) tuşuna basıldığında ve kutu boşsa bir öncekine geri dön
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0 &&
      inputRefs.current[index - 1]
    ) {
      inputRefs.current[index - 1].focus();
    }
  };

  return (
    <div className="otp-group">
      {otp.map((value, index) => (
        <input
          key={index}
          type="text"
          ref={(input) => (inputRefs.current[index] = input)}
          value={value}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className="otp-input"
        />
      ))}
    </div>
  );
};

export default OtpInput;

import React, { useState, useEffect, useRef } from "react";
import "./FlipCountdown.scss";

// --- TEK BİR RAKAM KUTUCUĞU ---
const FlipCard = ({ label, value }) => {
  const [current, setCurrent] = useState(value);
  const [previous, setPrevious] = useState(value);
  const cardRef = useRef(null);

  useEffect(() => {
    if (value !== current) {
      setPrevious(current);
      setCurrent(value);

      // Orijinal CodePen'deki "Kusursuz Kayma" Hilesi (DOM Reflow)
      if (cardRef.current) {
        cardRef.current.classList.remove("flip");
        void cardRef.current.offsetWidth; // Tarayıcıyı animasyonu sıfırlamaya zorlar
        cardRef.current.classList.add("flip");
      }
    }
  }, [value, current]);

  const format = (val) => (val < 10 ? `0${val}` : val);
  const currStr = format(current);
  const prevStr = format(previous);

  return (
    <div className="flip-clock__piece">
      <div ref={cardRef} className="flip-clock__card flip-card">
        <b className="flip-card__top">{currStr}</b>
        <b className="flip-card__bottom" data-value={currStr}></b>
        <b className="flip-card__back" data-value={prevStr}></b>
        <b className="flip-card__back-bottom" data-value={prevStr}></b>
      </div>
      <span className="flip-clock__slot">{label}</span>
    </div>
  );
};

// --- ANA SAYAÇ BİLEŞENİ ---
const FlipCountdown = () => {
  const [activeExam, setActiveExam] = useState("TYT");

  const examDates = {
    TYT: new Date("2026-06-20T10:15:00").getTime(),
    AYT: new Date("2026-06-21T10:15:00").getTime(),
  };

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = examDates[activeExam] - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
          ),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeExam]);

  return (
    <div className="countdown-container">
      <div className="countdown-row">
        {/* SOL BUTON: TYT */}
        <button
          className={`side-btn ${activeExam === "TYT" ? "active" : ""}`}
          onClick={() => setActiveExam("TYT")}
        >
          TYT
        </button>

        {/* ORTA: DEV YAPRAK SAAT */}
        <div className="flip-clock">
          <FlipCard label="GÜN" value={timeLeft.days} />
          <FlipCard label="SAAT" value={timeLeft.hours} />
          <FlipCard label="DAKİKA" value={timeLeft.minutes} />
          <FlipCard label="SANİYE" value={timeLeft.seconds} />
        </div>

        {/* SAĞ BUTON: AYT */}
        <button
          className={`side-btn ${activeExam === "AYT" ? "active" : ""}`}
          onClick={() => setActiveExam("AYT")}
        >
          AYT
        </button>
      </div>
    </div>
  );
};

export default FlipCountdown;

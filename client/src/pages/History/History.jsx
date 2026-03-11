import { useState, useEffect } from "react";
import "./History.css";

const History = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
        
        // Backend'den kullanıcının denemelerini çekiyoruz
        const res = await fetch(`${API_URL}/exams`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        const data = await res.json();
        
        if (data.success) {
          setExams(data.data); // Gelen 4 denemeyi state'e atıyoruz
        }
      } catch (error) {
        console.error("Geçmiş denemeler çekilemedi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return <div className="loading-text">Deneme verileriniz yükleniyor...</div>;
  }

  if (exams.length === 0) {
    return (
      <div className="empty-history">
        <p>Henüz hiç deneme girmemişsiniz.</p>
        <button className="add-exam-btn" onClick={() => window.location.href = '/add-exam'}>
          İlk Denemeni Ekle
        </button>
      </div>
    );
  }

  return (
    <div className="history-container">
      <div className="history-header">
        <h2>Geçmiş Denemelerim</h2>
        <p>Gelişimini renklerden takip et! (Yeşil: Hedef Geçildi, Kırmızı: Hedefin Altında)</p>
      </div>

      <div className="exam-list">
        {exams.map((exam) => {
          // Backend'deki modeline göre burayı uyarlayabilirsin. 
          // Eğer backend'den boolean dönmüyorsa, frontend'de user.targetNet ile exam.totalNet'i de kıyaslayabiliriz.
          // Şimdilik backend'in "isTargetReached" gönderdiğini varsayıyoruz.
          const isSuccess = exam.isTargetReached; 

          return (
            <div key={exam._id} className={`exam-card ${isSuccess ? "target-success" : "target-fail"}`}>
              
              {/* Sol Kısım: Sınav Bilgileri */}
              <div className="exam-info">
                <div className="exam-tags">
                  <span className={`badge ${exam.type.toLowerCase()}`}>
                    {exam.type} {exam.branch ? `- ${exam.branch}` : ""}
                  </span>
                  <span className="exam-date">
                    {new Date(exam.createdAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                <h3 className="exam-name">{exam.name || "İsimsiz Deneme"}</h3>
              </div>

              {/* Sağ Kısım: Puan (Net) */}
              <div className="exam-score">
                <p className="score-label">Toplam Net</p>
                <div className="score-value">
                  {exam.totalNet}
                  {/* Hedefi geçtiyse yukarı ok, geçemediyse aşağı ok ikonu koyuyoruz */}
                  {isSuccess ? <span className="arrow up">↑</span> : <span className="arrow down">↓</span>}
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default History;
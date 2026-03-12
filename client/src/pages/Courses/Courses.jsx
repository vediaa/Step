import { useState, useEffect } from "react";
import Card from "../../components/Card/Card";
import "./Courses.scss";

const Dersler = () => {
  const [openSections, setOpenSections] = useState(["tyt", "ayt"]);
  const [activeSection, setActiveSection] = useState(null);
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [progress, setProgress] = useState({});
  const [curriculum, setCurriculum] = useState({ tyt: [], ayt: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem("token");

      console.log("📥 Veri yükleniyor...");

      // 1. Curriculum'u getir
      const curriculumRes = await fetch(
        "http://localhost:5001/api/progress/curriculum",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const curriculumData = await curriculumRes.json();
      console.log("📚 Curriculum yüklendi:", curriculumData);
      setCurriculum(curriculumData);

      // 2. Kullanıcının ilerlemesini getir
      const progressRes = await fetch("http://localhost:5001/api/progress", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const progressData = await progressRes.json();
      console.log("📊 Progress yüklendi:", progressData.progress);
      setProgress(progressData.progress || {});

      setLoading(false);
    } catch (error) {
      console.error("❌ Veri yükleme hatası:", error);
      setLoading(false);
    }
  };

  // 🎯 DÜZELTİLMİŞ TOGGLE FONKSİYONU
  const toggleTopic = async (subjectId, topicId) => {
    try {
      const token = localStorage.getItem("token");

      console.log(`🔄 Toggle başlatıldı: Ders ${subjectId}, Konu ${topicId}`);
      console.log("📋 Önceki progress:", progress);

      // 1️⃣ ÖNCELİKLE STATE'İ GÜNCELLE (Optimistic Update)
      setProgress((prevProgress) => {
        // Derin kopya oluştur
        const newProgress = JSON.parse(JSON.stringify(prevProgress));

        // Ders yoksa oluştur
        if (!newProgress[subjectId]) {
          newProgress[subjectId] = {};
        }

        // 🎯 Mevcut değeri al ve toggle yap
        const currentValue = newProgress[subjectId][topicId] === true;
        newProgress[subjectId][topicId] = !currentValue;

        console.log(
          `✓ UI güncellendi: ${subjectId}.${topicId} = ${currentValue} → ${!currentValue}`,
        );
        console.log("📋 Yeni progress:", newProgress);

        return newProgress;
      });

      // 2️⃣ BACKEND'E İSTEK AT
      const response = await fetch(
        "http://localhost:5001/api/progress/toggle",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            subjectId: String(subjectId),
            topicId: String(topicId),
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Backend yanıtı:", data);

        // 3️⃣ Backend'den gelen gerçek veriyle state'i senkronize et
        setProgress((prevProgress) => {
          const syncedProgress = { ...prevProgress };
          if (!syncedProgress[subjectId]) {
            syncedProgress[subjectId] = {};
          }
          syncedProgress[subjectId][topicId] = data.completed;
          return syncedProgress;
        });
      } else {
        console.error("❌ Backend hatası, veriler yeniden yükleniyor...");
        // Hata varsa tüm verileri yeniden yükle
        await loadData();
      }
    } catch (error) {
      console.error("❌ Toggle hatası:", error);
      // Hata durumunda verileri yeniden yükle
      await loadData();
    }
  };

  const handleSectionToggle = (sectionName) => {
    setActiveSection((prev) => (prev === sectionName ? null : sectionName));
    setExpandedSubject(null);
  };

  const toggleSubject = (subjectId) => {
    setExpandedSubject((prev) => (prev === subjectId ? null : subjectId));
  };

  const getCompletionPercentage = (subjectId, topics) => {
    if (!progress[subjectId]) return 0;
    const completed = topics.filter(
      (topic) => progress[subjectId]?.[topic.id] === true,
    ).length;
    return Math.round((completed / topics.length) * 100);
  };

  const getSubjectColor = (type) => {
    return type === "tyt" ? "#9E9E9E" : "#424242";
  };

  if (loading) {
    return (
      <div className="dersler-container">
        <p className="loading-text">Dersler yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="dersler-container">
      <div className="tyt-content">
        {/* <h1 className="page-title">Derslerim</h1> */}

        {/* Debug bilgisi (geliştirme için) */}
        <div
          style={{
            fontSize: "12px",
            color: "#999",
            marginBottom: "10px",
            display: "none", // Production'da gizle
          }}
        >
          Toplam işaretli konu:{" "}
          {Object.values(progress).reduce(
            (total, subject) =>
              total + Object.values(subject || {}).filter(Boolean).length,
            0,
          )}
        </div>

        {/* TYT Dersleri */}
        <button
          className="section-header-button tyt"
          onClick={() => handleSectionToggle("tyt")}
        >
          <span className="section-title-text">TYT Dersleri</span>
          <span className="arrow-icon">
            {activeSection === "tyt" ? "▲" : "▼"}
          </span>
        </button>

        {activeSection === "tyt" && (
          <div className="section-content">
            {curriculum.tyt.map((subject) => (
              <Card key={subject.id} className="subject-card">
                <button
                  className="subject-header"
                  style={{ backgroundColor: getSubjectColor("tyt") }}
                  onClick={() => toggleSubject(subject.id)}
                >
                  <span className="subject-title">{subject.name}</span>
                  <div className="progress-container">
                    <div className="progress-bar-background">
                      <div
                        className="progress-bar-fill tyt"
                        style={{
                          width: `${getCompletionPercentage(
                            subject.id,
                            subject.topics,
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="progress-text">
                      {getCompletionPercentage(subject.id, subject.topics)}%
                    </span>
                    <span className="arrow-icon">
                      {expandedSubject === subject.id ? "▲" : "▼"}
                    </span>
                  </div>
                </button>

                {expandedSubject === subject.id && (
                  <div className="topics-container">
                    {subject.topics.map((topic) => (
                      <div key={topic.id} className="topic-row">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            className="topic-checkbox tyt"
                            checked={progress[subject.id]?.[topic.id] === true}
                            onChange={() => toggleTopic(subject.id, topic.id)}
                          />
                          <span
                            className={`topic-text ${
                              progress[subject.id]?.[topic.id] === true
                                ? "completed"
                                : ""
                            }`}
                          >
                            {topic.name}
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="ayt-content">
        {/* AYT Dersleri */}
        <button
          className="section-header-button ayt"
          onClick={() => handleSectionToggle("ayt")}
        >
          <span className="section-title-text">AYT Dersleri</span>
          <span className="arrow-icon">
            {activeSection === "ayt" ? "▲" : "▼"}
          </span>
        </button>

        {activeSection === "ayt" && (
          <div className="section-content">
            {curriculum.ayt.map((subject) => (
              <Card key={subject.id} className="subject-card">
                <button
                  className="subject-header"
                  style={{ backgroundColor: getSubjectColor("ayt") }}
                  onClick={() => toggleSubject(subject.id)}
                >
                  <span className="subject-title">{subject.name}</span>
                  <div className="progress-container">
                    <div className="progress-bar-background">
                      <div
                        className="progress-bar-fill ayt"
                        style={{
                          width: `${getCompletionPercentage(
                            subject.id,
                            subject.topics,
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="progress-text">
                      {getCompletionPercentage(subject.id, subject.topics)}%
                    </span>
                    <span className="arrow-icon">
                      {expandedSubject === subject.id ? "▲" : "▼"}
                    </span>
                  </div>
                </button>

                {expandedSubject === subject.id && (
                  <div className="topics-container">
                    {subject.topics.map((topic) => (
                      <div key={topic.id} className="topic-row">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            className="topic-checkbox ayt"
                            checked={progress[subject.id]?.[topic.id] === true}
                            onChange={() => toggleTopic(subject.id, topic.id)}
                          />
                          <span
                            className={`topic-text ${
                              progress[subject.id]?.[topic.id] === true
                                ? "completed"
                                : ""
                            }`}
                          >
                            {topic.name}
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dersler;

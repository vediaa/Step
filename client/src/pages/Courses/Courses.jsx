import { useState } from "react";
import { FiChevronDown, FiChevronUp, FiCheck } from "react-icons/fi";
import Card from "../../components/Card/Card";
import ProgressBar from "../../components/ProgressBar/ProgressBar";
import "./Courses.css";

const Courses = () => {
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [activeExam, setActiveExam] = useState("TYT");

  const coursesData = {
    TYT: [
      {
        id: "turkce",
        name: "Türkçe",
        progress: 21,
        color: "primary",
        topics: ["Sözcükte Anlam", "Cümlede Anlam", "Paragraf"],
      },
      {
        id: "matematik",
        name: "Matematik",
        progress: 35,
        color: "primary",
        topics: ["Temel Kavramlar", "Sayılar", "Geometri"],
      },
      {
        id: "fizik",
        name: "Fizik",
        progress: 17,
        color: "primary",
        topics: ["Hareket", "Kuvvet", "Enerji"],
      },
      {
        id: "biyoloji",
        name: "Biyoloji",
        progress: 50,
        color: "primary",
        topics: ["Hücre", "Genetik", "Ekosistem"],
      },
      {
        id: "kimya",
        name: "Kimya",
        progress: 36,
        color: "primary",
        topics: ["Atom", "Periyodik Tablo", "Kimyasal Bağlar"],
      },
    ],
    AYT: [
      {
        id: "matematik-ayt",
        name: "Matematik",
        progress: 75,
        color: "accent",
        topics: ["Kümeler", "Kartezyen Çarpım", "Mantık", "Fonksiyonlar"],
      },
      {
        id: "fizik-ayt",
        name: "Fizik",
        progress: 67,
        color: "accent",
        topics: ["Çembersel Hareket", "Dalga Mekaniği", "Atom Fiziği"],
      },
      {
        id: "kimya-ayt",
        name: "Kimya",
        progress: 29,
        color: "accent",
        topics: ["Asit-Baz", "Çözünürlük", "Elektrokimya"],
      },
      {
        id: "biyoloji-ayt",
        name: "Biyoloji",
        progress: 0,
        color: "accent",
        topics: ["Sinir Sistemi", "Dolaşım", "Solunum"],
      },
    ],
  };

  const toggleCourse = (courseId) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
  };

  return (
    <div className="courses-page">
      <div className="courses-header">
        <h1 className="page-title">Derslerim</h1>
      </div>

      <div className="exam-tabs">
        <button
          className={`exam-tab ${activeExam === "TYT" ? "active primary" : ""}`}
          onClick={() => setActiveExam("TYT")}
        >
          TYT Dersleri
        </button>
        <button
          className={`exam-tab ${activeExam === "AYT" ? "active accent" : ""}`}
          onClick={() => setActiveExam("AYT")}
        >
          AYT Dersleri
        </button>
      </div>

      <div className="courses-list">
        {coursesData[activeExam].map((course) => (
          <div key={course.id} className="course-item">
            <Card
              variant={expandedCourse === course.id ? "dark" : "secondary"}
              onClick={() => toggleCourse(course.id)}
              className="course-card"
            >
              <div className="course-header-content">
                <h3 className="course-name">{course.name}</h3>
                <div className="course-stats">
                  <ProgressBar
                    percentage={course.progress}
                    color={course.color}
                  />
                  {expandedCourse === course.id ? (
                    <FiChevronUp />
                  ) : (
                    <FiChevronDown />
                  )}
                </div>
              </div>
            </Card>

            {expandedCourse === course.id && (
              <div className="topics-list">
                {course.topics.map((topic, index) => (
                  <div key={index} className="topic-item">
                    <div
                      className={`topic-checkbox ${index < 2 ? "checked" : ""}`}
                    >
                      {index < 2 && <FiCheck />}
                    </div>
                    <span
                      className={`topic-name ${index < 2 ? "completed" : ""}`}
                    >
                      {topic}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Courses;

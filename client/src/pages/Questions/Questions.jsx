import { useState } from "react";
import { FiCamera, FiEdit2, FiTrash2 } from "react-icons/fi";
import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import "./Questions.css";

const Questions = () => {
  const [activeFilter, setActiveFilter] = useState("Kolay");

  const filters = ["Çözülmemiş", "Kolay", "Orta", "Zor"];

  const questions = [
    {
      id: 1,
      title: "Fotoğraflı Soru (08.04.2025 02:36:21)",
      date: "08.04.2025 02:36:21",
      image: "https://via.placeholder.com/400x300",
      difficulty: "Kolay",
    },
    {
      id: 2,
      title: "Fotoğraflı Soru (08.04.2025 02:38:15)",
      date: "08.04.2025 02:38:15",
      image: "https://via.placeholder.com/400x300",
      difficulty: "Kolay",
    },
  ];

  const filteredQuestions = questions.filter(
    (q) => q.difficulty === activeFilter
  );

  return (
    <div className="questions-page">
      <div className="questions-header">
        <h1 className="page-title">Sorular</h1>
        <Button variant="primary" icon={<FiCamera />}>
          Yeni Soru Ekle
        </Button>
      </div>

      <div className="filter-tabs">
        {filters.map((filter) => (
          <button
            key={filter}
            className={`filter-tab ${activeFilter === filter ? "active" : ""}`}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="questions-grid">
        {filteredQuestions.map((question) => (
          <Card key={question.id} className="question-card">
            <div className="question-image">
              <img src={question.image} alt={question.title} />
            </div>
            <div className="question-info">
              <h3 className="question-title">{question.title}</h3>
              <p className="question-date">{question.date}</p>
            </div>
            <div className="question-actions">
              <button className="action-button edit">
                <FiEdit2 />
                Düzenle
              </button>
              <button className="action-button delete">
                <FiTrash2 />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {filteredQuestions.length === 0 && (
        <div className="empty-state">
          <p>Bu kategoride henüz soru bulunmuyor.</p>
        </div>
      )}
    </div>
  );
};

export default Questions;

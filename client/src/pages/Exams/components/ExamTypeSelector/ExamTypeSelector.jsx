// pages/Exams/components/ExamTypeSelector/ExamTypeSelector.jsx
import "./ExamTypeSelector.css";

const ExamTypeSelector = ({ selectedType, onTypeChange }) => {
  const types = [
    { value: "TYT", label: "TYT", description: "Temel Yeterlilik Testi" },
    { value: "AYT", label: "AYT", description: "Alan Yeterlilik Testi" },
  ];

  return (
    <div className="exam-type-selector">
      {types.map((type) => (
        <button
          key={type.value}
          className={`type-button ${
            selectedType === type.value ? "active" : ""
          }`}
          onClick={() => onTypeChange(type.value)}
        >
          <span className="type-label">{type.label}</span>
          <span className="type-description">{type.description}</span>
        </button>
      ))}
    </div>
  );
};

export default ExamTypeSelector;

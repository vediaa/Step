import { useState } from "react";
import Card from "../../components/Card/Card";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import "./Exams.css";

const Exams = () => {
  const [examType, setExamType] = useState("AYT");
  const [examName, setExamName] = useState("");
  const [showNewExam, setShowNewExam] = useState(false);

  const [examScores, setExamScores] = useState({
    edebiyat: { correct: 25, wrong: 9 },
    sosyal1: { correct: 15, wrong: 5 },
    sosyal2: { correct: 12, wrong: 6 },
  });

  const calculateNet = (correct, wrong) => {
    return correct - wrong / 4;
  };

  const totalNet = Object.values(examScores).reduce((sum, score) => {
    return sum + calculateNet(score.correct, score.wrong);
  }, 0);

  const previousExams = [
    {
      name: "Bilgi sarmal - TYT",
      date: "28.05.2025",
      field: "Eşit Ağırlık",
      totalNet: 39,
      details: "Türkçe: D:10 Y:9 Net:7.75\nMatematik: D:25 Y:5 Net:23.75",
      goal: 60,
      difference: -21,
    },
    {
      name: "Apotemi - AYT",
      date: "28.05.2025",
      field: "Eşit Ağırlık",
      totalNet: 48.5,
      details:
        "AYT Matematik: D:25 Y:5 Net:23.75\nAYT Edebiyat: D:26 Y:5 Net:24.75",
      goal: 40,
      difference: 8.5,
    },
  ];

  return (
    <div className="exams-page">
      <div className="exams-header">
        <h1 className="page-title">Netler</h1>
      </div>

      <div className="exam-sections">
        <Card className="new-exam-section">
          <h2 className="section-title">Deneme Adı</h2>
          <Input
            type="text"
            placeholder="Deneme adını gir"
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
          />

          <h3 className="subsection-title">Deneme Türü:</h3>
          <div className="exam-type-buttons">
            <button
              className={`type-button ${examType === "TYT" ? "active" : ""}`}
              onClick={() => setExamType("TYT")}
            >
              TYT
            </button>
            <button
              className={`type-button ${examType === "AYT" ? "active" : ""}`}
              onClick={() => setExamType("AYT")}
            >
              AYT
            </button>
          </div>

          <h3 className="subsection-title">AYT Dersleri</h3>

          <div className="score-inputs">
            <div className="score-row">
              <span className="subject-name">AYT Edebiyat</span>
              <div className="score-fields">
                <Input
                  type="number"
                  placeholder="D"
                  value={examScores.edebiyat.correct}
                  onChange={(e) =>
                    setExamScores({
                      ...examScores,
                      edebiyat: {
                        ...examScores.edebiyat,
                        correct: Number(e.target.value),
                      },
                    })
                  }
                />
                <Input
                  type="number"
                  placeholder="Y"
                  value={examScores.edebiyat.wrong}
                  onChange={(e) =>
                    setExamScores({
                      ...examScores,
                      edebiyat: {
                        ...examScores.edebiyat,
                        wrong: Number(e.target.value),
                      },
                    })
                  }
                />
                <span className="net-value">
                  {calculateNet(
                    examScores.edebiyat.correct,
                    examScores.edebiyat.wrong
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="score-row">
              <span className="subject-name">AYT Sosyal 1</span>
              <div className="score-fields">
                <Input
                  type="number"
                  placeholder="D"
                  value={examScores.sosyal1.correct}
                  onChange={(e) =>
                    setExamScores({
                      ...examScores,
                      sosyal1: {
                        ...examScores.sosyal1,
                        correct: Number(e.target.value),
                      },
                    })
                  }
                />
                <Input
                  type="number"
                  placeholder="Y"
                  value={examScores.sosyal1.wrong}
                  onChange={(e) =>
                    setExamScores({
                      ...examScores,
                      sosyal1: {
                        ...examScores.sosyal1,
                        wrong: Number(e.target.value),
                      },
                    })
                  }
                />
                <span className="net-value">
                  {calculateNet(
                    examScores.sosyal1.correct,
                    examScores.sosyal1.wrong
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="score-row">
              <span className="subject-name">AYT Sosyal 2</span>
              <div className="score-fields">
                <Input
                  type="number"
                  placeholder="D"
                  value={examScores.sosyal2.correct}
                  onChange={(e) =>
                    setExamScores({
                      ...examScores,
                      sosyal2: {
                        ...examScores.sosyal2,
                        correct: Number(e.target.value),
                      },
                    })
                  }
                />
                <Input
                  type="number"
                  placeholder="Y"
                  value={examScores.sosyal2.wrong}
                  onChange={(e) =>
                    setExamScores({
                      ...examScores,
                      sosyal2: {
                        ...examScores.sosyal2,
                        wrong: Number(e.target.value),
                      },
                    })
                  }
                />
                <span className="net-value">
                  {calculateNet(
                    examScores.sosyal2.correct,
                    examScores.sosyal2.wrong
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="total-net">
            <strong>AYT Toplam Net:</strong>
            <span className="total-value">{totalNet.toFixed(2)}</span>
          </div>

          <Button variant="primary" fullWidth>
            Denemeyi Kaydet
          </Button>
        </Card>
      </div>

      <h2 className="section-title" style={{ marginTop: "48px" }}>
        Geçmiş Denemeler
      </h2>

      <div className="previous-exams">
        {previousExams.map((exam, index) => (
          <Card key={index} className="exam-card">
            <div className="exam-card-header">
              <h3 className="exam-name">
                {exam.name} ({exam.date})
              </h3>
              <button className="delete-button">Sil</button>
            </div>
            <p className="exam-field">Bölüm: {exam.field}</p>
            <p className="exam-total">
              <strong>Toplam Net:</strong> {exam.totalNet}
            </p>
            <p className="exam-details">{exam.details}</p>
            <p
              className={`exam-goal ${
                exam.difference > 0 ? "success" : "error"
              }`}
            >
              Hedef {examType} netine ({exam.goal}) ulaşmak için{" "}
              {Math.abs(exam.difference)} net
              {exam.difference > 0
                ? " daha yaptınız. Tebrikler!"
                : " daha yapmalısın."}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Exams;

import { useState } from "react";
import Card from "../../components/Card/Card";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import "./Goals.css";

const Goals = () => {
  const [selectedField, setSelectedField] = useState("Sözel");
  const [tytGoal, setTytGoal] = useState("98");
  const [aytGoal, setAytGoal] = useState("65");

  const fields = ["Sayısal", "Eşit Ağırlık", "Sözel"];

  return (
    <div className="goals-page">
      <div className="goals-header">
        <h1 className="page-title">Hedef Netlerini Belirle</h1>
      </div>

      <Card className="goals-card">
        <h2 className="section-title">Alan Seçin:</h2>
        <div className="field-selection">
          {fields.map((field) => (
            <button
              key={field}
              className={`field-button ${
                selectedField === field ? "active" : ""
              }`}
              onClick={() => setSelectedField(field)}
            >
              {field}
            </button>
          ))}
        </div>

        <h2 className="section-title">Hedef TYT Netiniz</h2>
        <Input
          type="number"
          placeholder="TYT hedef net"
          value={tytGoal}
          onChange={(e) => setTytGoal(e.target.value)}
        />

        <h2 className="section-title">Hedef AYT Netiniz</h2>
        <Input
          type="number"
          placeholder="AYT hedef net"
          value={aytGoal}
          onChange={(e) => setAytGoal(e.target.value)}
        />

        <Button variant="primary" fullWidth>
          Hedefleri Kaydet
        </Button>
      </Card>

      <h2 className="section-title" style={{ marginTop: "48px" }}>
        Yeni Deneme Ekle
      </h2>
      <Card className="new-exam-card">
        <h3 className="subsection-title">Deneme Adı</h3>
        <Input type="text" placeholder="Örn: 3D Yayınları TYT Denemesi" />
      </Card>
    </div>
  );
};

export default Goals;

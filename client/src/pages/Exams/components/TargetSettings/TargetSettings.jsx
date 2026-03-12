// pages/Exams/components/TargetSettings/TargetSettings.jsx
import { useState } from "react";
import Card from "../../../../components/Card/Card";
import Button from "../../../../components/Button/Button";
import {
  validateTargets,
  filterFloatInput,
} from "../../../../utils/examValidation";
import "./TargetSettings.css";

const TargetSettings = ({ initialTargets, onSave }) => {
  const [branch, setBranch] = useState(initialTargets?.branch || "");
  const [tytNet, setTytNet] = useState(initialTargets?.tytNet || "");
  const [aytNet, setAytNet] = useState(initialTargets?.aytNet || "");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const branches = ["Sayısal", "Eşit Ağırlık", "Sözel", "Dil"];

  const handleSave = async () => {
    // Validasyon
    const validation = validateTargets(tytNet, aytNet);

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    if (!branch) {
      setErrors(["Lütfen alan seçiniz"]);
      return;
    }

    setErrors([]);
    setLoading(true);

    try {
      await onSave({
        branch,
        tytNet: tytNet ? parseFloat(tytNet) : null,
        aytNet: aytNet ? parseFloat(aytNet) : null,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="target-settings-card">
      <h3 className="target-settings-title">🎯 Hedef Netlerini Belirle</h3>

      {/* Alan Seçimi */}
      <div className="form-group">
        <label className="form-label">Alan Seçin</label>
        <div className="branch-buttons">
          {branches.map((b) => (
            <button
              key={b}
              className={`branch-button ${branch === b ? "active" : ""}`}
              onClick={() => setBranch(b)}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* TYT Net */}
      <div className="form-group">
        <label className="form-label">
          Hedef TYT Net <span className="label-hint">(Maksimum 120)</span>
        </label>
        <input
          type="text"
          inputMode="decimal"
          className="form-input"
          value={tytNet}
          onChange={(e) => setTytNet(filterFloatInput(e.target.value))}
          placeholder="Örn: 90.5"
        />
      </div>

      {/* AYT Net */}
      <div className="form-group">
        <label className="form-label">
          Hedef AYT Net <span className="label-hint">(Maksimum 80)</span>
        </label>
        <input
          type="text"
          inputMode="decimal"
          className="form-input"
          value={aytNet}
          onChange={(e) => setAytNet(filterFloatInput(e.target.value))}
          placeholder="Örn: 65.75"
        />
      </div>

      {/* Hata Mesajları */}
      {errors.length > 0 && (
        <div className="error-box">
          {errors.map((error, index) => (
            <p key={index} className="error-message">
              ❌ {error}
            </p>
          ))}
        </div>
      )}

      {/* Kaydet Butonu */}
      <Button
        variant="logoblue"
        fullWidth
        onClick={handleSave}
        disabled={loading}
      >
        {loading ? "Kaydediliyor..." : "Hedefleri Kaydet"}
      </Button>
    </Card>
  );
};

export default TargetSettings;

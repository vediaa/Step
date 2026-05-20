// pages/History/components/FilterBar/FilterBar.jsx
import "./FilterBar.css";

const FilterBar = ({ filters, onFilterChange, examCounts }) => {
  const { type, branch, sortBy } = filters;

  return (
    <div className="filter-bar">
      {/* Deneme Türü */}
      <div className="filter-group">
        <label className="filter-label">Deneme Türü</label>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${!type ? "active" : ""}`}
            onClick={() => onFilterChange("type", null)}
          >
            Hepsi ({examCounts.total})
          </button>
          <button
            className={`filter-btn ${type === "TYT" ? "active" : ""}`}
            onClick={() => onFilterChange("type", "TYT")}
          >
            TYT ({examCounts.tyt})
          </button>
          <button
            className={`filter-btn ${type === "AYT" ? "active" : ""}`}
            onClick={() => onFilterChange("type", "AYT")}
          >
            AYT ({examCounts.ayt})
          </button>
        </div>
      </div>

      {/* Alan (Sadece AYT seçiliyse) */}
      {type === "AYT" && (
        <div className="filter-group">
          <label className="filter-label">Alan</label>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${!branch ? "active" : ""}`}
              onClick={() => onFilterChange("branch", null)}
            >
              Hepsi
            </button>
            <button
              className={`filter-btn ${branch === "Sayısal" ? "active" : ""}`}
              onClick={() => onFilterChange("branch", "Sayısal")}
            >
              Sayısal
            </button>
            <button
              className={`filter-btn ${
                branch === "Eşit Ağırlık" ? "active" : ""
              }`}
              onClick={() => onFilterChange("branch", "Eşit Ağırlık")}
            >
              EA
            </button>
            <button
              className={`filter-btn ${branch === "Sözel" ? "active" : ""}`}
              onClick={() => onFilterChange("branch", "Sözel")}
            >
              Sözel
            </button>
            <button
              className={`filter-btn ${branch === "Dil" ? "active" : ""}`}
              onClick={() => onFilterChange("branch", "Dil")}
            >
              Dil
            </button>
          </div>
        </div>
      )}

      {/* Sıralama */}
      <div className="filter-group">
        <label className="filter-label">Sıralama</label>
        <select
          className="filter-select"
          value={sortBy}
          onChange={(e) => onFilterChange("sortBy", e.target.value)}
        >
          <option value="date-desc">En Yeni → Eski</option>
          <option value="date-asc">En Eski → Yeni</option>
          <option value="net-desc">En Yüksek Net → Düşük</option>
          <option value="net-asc">En Düşük Net → Yüksek</option>
        </select>
      </div>
    </div>
  );
};

export default FilterBar;

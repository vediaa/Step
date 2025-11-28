import "./ProgressBar.css";

const ProgressBar = ({
  percentage,
  color = "primary",
  showPercentage = true,
}) => {
  return (
    <div className="progress-bar-container">
      <div className="progress-bar-track">
        <div
          className={`progress-bar-fill ${color}`}
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>
      {showPercentage && (
        <span className="progress-percentage">{Math.round(percentage)}%</span>
      )}
    </div>
  );
};

export default ProgressBar;

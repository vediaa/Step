import "./Logo.css";

const Logo = ({ size = "medium" }) => {
  return (
    <div className={`logo ${size}`}>
      <div className="logo-icon">
        <div className="steps">
          <div className="step step1"></div>
          <div className="step step2"></div>
          <div className="step step3"></div>
        </div>
      </div>
      <span className="logo-text">ExamApp</span>
    </div>
  );
};

export default Logo;

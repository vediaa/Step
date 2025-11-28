import "./Card.css";
import "../../color/Colors.css";

const Card = ({ children, className = "", onClick, variant = "default" }) => {
  return (
    <div
      className={`card ${variant} ${className} ${onClick ? "clickable" : ""}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;

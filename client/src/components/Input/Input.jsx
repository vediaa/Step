import "./Input.css";

const Input = ({
  type = "text",
  placeholder,
  value,
  onChange,
  icon,
  label,
  error,
  name,
  required = false,
}) => {
  return (
    <div className="input-wrapper">
      {label && <label className="input-label">{label}</label>}
      <div className="input-container">
        {icon && <span className="input-icon">{icon}</span>}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`custom-input ${icon ? "with-icon" : ""} ${
            error ? "error" : ""
          }`}
          name={name}
          required={required}
        />
      </div>
      {error && <span className="input-error">{error}</span>}
    </div>
  );
};

export default Input;

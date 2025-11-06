import './ui-components.css';

export const Input = ({
  type = 'text',
  placeholder = '',
  value,
  onChange,
  disabled = false,
  error = false,
  icon = null,
  className = '',
  ...props
}) => {
  return (
    <div className={`input-wrapper ${error ? 'input-wrapper--error' : ''}`}>
      {icon && <span className="input-icon">{icon}</span>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`input ${icon ? 'input--with-icon' : ''} ${className}`}
        {...props}
      />
    </div>
  );
};

export const Textarea = ({
  placeholder = '',
  value,
  onChange,
  disabled = false,
  error = false,
  rows = 4,
  className = '',
  ...props
}) => {
  return (
    <div className={`input-wrapper ${error ? 'input-wrapper--error' : ''}`}>
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        rows={rows}
        className={`input textarea ${className}`}
        {...props}
      />
    </div>
  );
};

export const Select = ({
  options = [],
  value,
  onChange,
  disabled = false,
  error = false,
  placeholder = 'Chọn một tùy chọn',
  className = '',
  ...props
}) => {
  return (
    <div className={`input-wrapper ${error ? 'input-wrapper--error' : ''}`}>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`input select ${className}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

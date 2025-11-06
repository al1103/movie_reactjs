import './ui-components.css';

export const Badge = ({ children, variant = 'default', className = '', ...props }) => (
  <span className={`badge badge--${variant} ${className}`} {...props}>
    {children}
  </span>
);

export const Alert = ({ children, variant = 'info', className = '', icon = null, ...props }) => (
  <div className={`alert alert--${variant} ${className}`} {...props}>
    {icon && <span className="alert-icon">{icon}</span>}
    <div className="alert-content">{children}</div>
  </div>
);

export const Tag = ({ children, removable = false, onRemove, variant = 'default', ...props }) => (
  <div className={`tag tag--${variant}`} {...props}>
    {children}
    {removable && (
      <button className="tag-remove" onClick={onRemove} aria-label="Xóa">
        ✕
      </button>
    )}
  </div>
);

export const Spinner = ({ size = 'md', className = '' }) => (
  <div className={`spinner spinner--${size} ${className}`} />
);

export const Divider = ({ className = '' }) => <div className={`divider ${className}`} />;

export const Container = ({ children, size = 'lg', className = '' }) => (
  <div className={`container container--${size} ${className}`}>{children}</div>
);

export const Grid = ({ children, cols = 3, gap = 'md', className = '', ...props }) => (
  <div className={`grid grid--${cols} gap-${gap} ${className}`} {...props}>
    {children}
  </div>
);

export const Row = ({ children, gap = 'md', className = '', ...props }) => (
  <div className={`flex gap-${gap} ${className}`} {...props}>
    {children}
  </div>
);

export const Column = ({ children, className = '', ...props }) => (
  <div className={`flex-col ${className}`} {...props}>
    {children}
  </div>
);

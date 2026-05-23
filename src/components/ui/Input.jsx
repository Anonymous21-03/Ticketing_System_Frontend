import './Input.css';

export default function Input({
  label, error, icon: Icon, rightElement, type = 'text', className = '', ...props
}) {
  const hasRightElement = !!rightElement;
  
  return (
    <div className={`input-group ${error ? 'input-error' : ''} ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <div className={`input-wrapper ${hasRightElement ? 'input-wrapper-has-right' : ''}`}>
        {Icon && <Icon size={16} className="input-icon" />}
        {type === 'textarea' ? (
          <textarea className="input-field input-textarea" {...props} />
        ) : type === 'select' ? (
          <select className="input-field input-select" {...props} />
        ) : (
          <input type={type} className="input-field" {...props} />
        )}
        {rightElement && (
          <div className="input-right-element">
            {rightElement}
          </div>
        )}
      </div>
      {error && <span className="input-error-msg">{error}</span>}
    </div>
  );
}


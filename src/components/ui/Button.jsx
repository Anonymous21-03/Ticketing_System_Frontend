import { Loader2 } from 'lucide-react';
import './Button.css';

export default function Button({
  children, variant = 'primary', size = 'md', loading = false,
  disabled = false, icon: Icon, className = '', ...props
}) {
  return (
    <button
      className={`btn btn-${variant} btn-${size} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 size={16} className="btn-spinner" /> : Icon && <Icon size={16} />}
      {children && <span>{children}</span>}
    </button>
  );
}

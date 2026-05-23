import './Badge.css';

export default function Badge({ variant, children, className = '' }) {
  // Normalize variable types (e.g. low, high, open, resolved, user, etc.)
  const badgeClass = `badge badge-${variant.toLowerCase().replace(' ', '_')} ${className}`;
  return (
    <span className={badgeClass}>
      {children || variant}
    </span>
  );
}

import Button from './Button';
import './EmptyState.css';

export default function EmptyState({
  title = 'No records found',
  description = 'Try adjusting your search filters or add a new record.',
  icon: Icon,
  actionText,
  onActionClick,
  className = ''
}) {
  return (
    <div className={`empty-state-card glass-card ${className}`}>
      {Icon && (
        <div className="empty-state-icon-wrapper">
          <Icon className="empty-state-icon" size={40} />
        </div>
      )}
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {actionText && onActionClick && (
        <Button variant="primary" onClick={onActionClick} className="empty-state-action">
          {actionText}
        </Button>
      )}
    </div>
  );
}

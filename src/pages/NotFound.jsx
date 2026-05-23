import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Home, AlertCircle } from 'lucide-react';
import './NotFound.css';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="not-found-container fade-in">
      <div className="not-found-card glass-card">
        <div className="not-found-icon">
          <AlertCircle size={48} />
        </div>
        <h2 className="not-found-title">Page Not Found</h2>
        <p className="not-found-message">
          The page you are looking for doesn't exist or has been relocated to another workspace.
        </p>
        <Button
          variant="primary"
          icon={Home}
          onClick={() => navigate('/dashboard')}
          className="not-found-btn"
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}

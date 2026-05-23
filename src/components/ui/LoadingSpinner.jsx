import { Loader2 } from 'lucide-react';
import './LoadingSpinner.css';

export default function LoadingSpinner({ message = 'Loading content...', fullPage = false }) {
  return (
    <div className={`spinner-container ${fullPage ? 'full-page' : ''}`}>
      <Loader2 className="spinner-icon animate-spin" size={32} />
      {message && <p className="spinner-message">{message}</p>}
    </div>
  );
}

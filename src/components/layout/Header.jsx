import { Menu, User, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

export default function Header({ onMenuClick }) {
  const { user } = useAuth();

  return (
    <header className="app-header">
      <button className="menu-toggle-btn" onClick={onMenuClick} aria-label="Toggle Navigation">
        <Menu size={24} />
      </button>

      <div className="header-left">
        <h1 className="header-title">Console</h1>
      </div>

      <div className="header-right">
        <button className="header-action-btn" aria-label="Notifications">
          <Bell size={20} />
          <span className="notification-badge"></span>
        </button>

        <div className="header-divider"></div>

        <div className="header-user-info">
          <span className="header-username">{user?.username}</span>
          <span className="header-user-avatar">
            <User size={16} />
          </span>
        </div>
      </div>
    </header>
  );
}

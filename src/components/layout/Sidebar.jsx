import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Ticket, Users, Network, User, LogOut, X } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'agent', 'employee'] },
    { to: '/tickets', label: 'Tickets', icon: Ticket, roles: ['admin', 'agent', 'employee'] },
    { to: '/users', label: 'Users', icon: Users, roles: ['admin'] },
    { to: '/teams', label: 'Teams', icon: Network, roles: ['admin'] },
    // Dynamic "My Team" link for non-admins who belong to a team
    ...(user?.team_id && user?.role !== 'admin'
      ? [{ to: `/teams/${user.team_id}`, label: 'My Team', icon: Network, roles: ['agent', 'employee'] }]
      : []),
    { to: '/profile', label: 'Profile', icon: User, roles: ['admin', 'agent', 'employee'] },
  ];

  const allowedItems = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={toggleSidebar}></div>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-section">
            <span className="logo-icon">🎟️</span>
            <span className="logo-text">SupportFlow</span>
          </div>
          <button className="sidebar-close-btn" onClick={toggleSidebar} aria-label="Close sidebar">
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {allowedItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => {
                  if (window.innerWidth < 1024) toggleSidebar();
                }}
              >
                <Icon size={20} className="link-icon" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          {user && (
            <div className="user-profile-summary">
              <div className="user-avatar">
                {user.username.substring(0, 2).toUpperCase()}
              </div>
              <div className="user-details truncate">
                <p className="user-name truncate">{user.username}</p>
                <p className="user-role-lbl">{user.role}</p>
              </div>
            </div>
          )}
          <button className="sidebar-logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

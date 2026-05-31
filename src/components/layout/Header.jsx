import { useState, useEffect, useRef } from 'react';
import { Menu, User, Bell, AlertTriangle, UserPlus, MessageSquare, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ticketApi } from '../../services/ticketApi';
import { useNavigate } from 'react-router-dom';
import './Header.css';

export default function Header({ onMenuClick }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load and merge notifications
  useEffect(() => {
    if (!user) return;

    const storageKey = `tickets_notifications_${user.username}`;
    let saved = [];
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        saved = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading notifications from localStorage:', e);
    }

    // Default notifications if none exist
    if (saved.length === 0) {
      const isAdmin = user.role === 'admin';
      const isAgent = user.role === 'agent';
      
      if (isAdmin) {
        saved = [
          {
            id: 'default-1',
            title: 'SLA Breach Alert',
            description: 'Ticket #4 ("Database Connection Timeout") has breached its SLA deadline.',
            type: 'sla',
            unread: true,
            timestamp: '10 mins ago',
            link: '/tickets/4'
          },
          {
            id: 'default-2',
            title: 'Unassigned Ticket Warning',
            description: 'New Ticket #12 ("API Gateway 502 Bad Gateway") requires assignment.',
            type: 'info',
            unread: true,
            timestamp: '1 hour ago',
            link: '/tickets/12'
          },
          {
            id: 'default-3',
            title: 'Team Roster Update',
            description: 'New agent Vikram Singh was added to Team DevOps.',
            type: 'assignment',
            unread: false,
            timestamp: 'Yesterday',
            link: '/teams'
          }
        ];
      } else if (isAgent) {
        saved = [
          {
            id: 'default-1',
            title: 'New Ticket Assigned',
            description: 'You have been assigned to Ticket #5 ("UI alignment bug on login page").',
            type: 'assignment',
            unread: true,
            timestamp: '15 mins ago',
            link: '/tickets/5'
          },
          {
            id: 'default-2',
            title: 'SLA Breach Warning',
            description: 'Ticket #5 deadline is approaching (less than 4 hours remaining).',
            type: 'sla',
            unread: true,
            timestamp: '1 hour ago',
            link: '/tickets/5'
          },
          {
            id: 'default-3',
            title: 'New Comment',
            description: 'Pooja Desai left a comment on Ticket #5: "Still fails on Safari."',
            type: 'comment',
            unread: false,
            timestamp: '3 hours ago',
            link: '/tickets/5'
          }
        ];
      } else {
        // Employee
        saved = [
          {
            id: 'default-1',
            title: 'Ticket Resolved',
            description: 'Your Ticket #5 ("UI alignment bug on login page") is marked as Resolved.',
            type: 'info',
            unread: true,
            timestamp: '2 hours ago',
            link: '/tickets/5'
          },
          {
            id: 'default-2',
            title: 'New Comment on Ticket',
            description: 'Agent Rohan Gupta commented: "Fixed in latest deploy. Please check."',
            type: 'comment',
            unread: true,
            timestamp: '2 hours ago',
            link: '/tickets/5'
          }
        ];
      }
    }

    // Fetch dynamic notifications from actual API
    const fetchDynamic = async () => {
      try {
        let ticketsData;
        if (user.role === 'admin') {
          ticketsData = await ticketApi.getTickets({ limit: 10 });
        } else if (user.role === 'agent') {
          ticketsData = await ticketApi.getAssignedToMe({ limit: 10 });
        } else {
          ticketsData = await ticketApi.getCreatedByMe({ limit: 10 });
        }

        const tickets = ticketsData?.items || [];
        const dynamicList = [];

        tickets.forEach(ticket => {
          // If SLA is breached
          if (ticket.sla_breached) {
            dynamicList.push({
              id: `sla-breach-${ticket.id}`,
              title: 'SLA Breached',
              description: `Ticket #${ticket.id} (${ticket.title}) has exceeded its resolution SLA.`,
              type: 'sla',
              unread: true,
              timestamp: 'Just now',
              link: `/tickets/${ticket.id}`
            });
          }
          // If resolved
          if (ticket.status === 'resolved') {
            dynamicList.push({
              id: `resolved-${ticket.id}`,
              title: 'Ticket Resolved',
              description: `Ticket #${ticket.id} (${ticket.title}) has been resolved.`,
              type: 'info',
              unread: true,
              timestamp: 'Recently',
              link: `/tickets/${ticket.id}`
            });
          }
          // If urgent priority & open
          if (ticket.priority === 'urgent' && ticket.status === 'open') {
            dynamicList.push({
              id: `urgent-open-${ticket.id}`,
              title: 'Urgent Action Required',
              description: `Ticket #${ticket.id} (${ticket.title}) is urgent and unassigned.`,
              type: 'sla',
              unread: true,
              timestamp: 'Recently',
              link: `/tickets/${ticket.id}`
            });
          }
        });

        // Merge dynamic notifications into list, putting them at the beginning.
        // Filter out default notifications if a matching dynamic one exists
        let merged = [...saved];
        dynamicList.forEach(dyn => {
          if (!merged.some(item => item.id === dyn.id)) {
            merged = [dyn, ...merged];
          }
        });

        // Cap at 10 items
        const finalNotifications = merged.slice(0, 10);
        setNotifications(finalNotifications);
        localStorage.setItem(storageKey, JSON.stringify(finalNotifications));
      } catch (err) {
        console.error('Error fetching dynamic notifications:', err);
        setNotifications(saved);
      }
    };

    fetchDynamic();
  }, [user]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllRead = () => {
    if (!user) return;
    const updated = notifications.map(n => ({ ...n, unread: false }));
    setNotifications(updated);
    localStorage.setItem(`tickets_notifications_${user.username}`, JSON.stringify(updated));
  };

  const handleNotificationClick = (notification) => {
    if (!user) return;
    // Mark as read
    const updated = notifications.map(n => 
      n.id === notification.id ? { ...n, unread: false } : n
    );
    setNotifications(updated);
    localStorage.setItem(`tickets_notifications_${user.username}`, JSON.stringify(updated));
    setIsOpen(false);
    navigate(notification.link);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'sla':
        return <AlertTriangle size={16} />;
      case 'assignment':
        return <UserPlus size={16} />;
      case 'comment':
        return <MessageSquare size={16} />;
      default:
        return <Info size={16} />;
    }
  };

  return (
    <header className="app-header">
      <button className="menu-toggle-btn" onClick={onMenuClick} aria-label="Toggle Navigation">
        <Menu size={24} />
      </button>

      <div className="header-left">
        <h1 className="header-title">Console</h1>
      </div>

      <div className="header-right">
        <div className="notifications-wrapper" ref={dropdownRef}>
          <button 
            className={`header-action-btn ${isOpen ? 'active' : ''}`} 
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>

          {isOpen && (
            <div className="notifications-dropdown">
              <div className="notifications-header">
                <h3>Notifications</h3>
                {unreadCount > 0 && (
                  <button className="mark-all-read-btn" onClick={markAllRead}>
                    Mark all read
                  </button>
                )}
              </div>

              <div className="notifications-list">
                {notifications.length === 0 ? (
                  <div className="notifications-empty">
                    <Bell size={24} style={{ opacity: 0.5 }} />
                    <p>No new notifications</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`notification-item ${notification.unread ? 'unread' : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className={`notification-icon-container ${notification.type}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="notification-content">
                        <div className="notification-title">{notification.title}</div>
                        <div className="notification-desc">{notification.description}</div>
                        <div className="notification-time">{notification.timestamp}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

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

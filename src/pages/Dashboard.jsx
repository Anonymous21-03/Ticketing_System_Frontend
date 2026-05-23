import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ticketApi } from '../services/ticketApi';
import { teamApi } from '../services/teamApi';
import { userApi } from '../services/userApi';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Ticket, Users, Network, Clock, CheckCircle2, AlertCircle,
  PlusCircle, UserCheck, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './Dashboard.css';

export default function Dashboard() {
  const { user, isAdmin, isAgent, isEmployee } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [usersCount, setUsersCount] = useState(0);
  const [teamsCount, setTeamsCount] = useState(0);

  // Modal control for quick ticket creation
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch role-scoped stats server-side
      const statsData = await ticketApi.getStats();
      setStats(statsData);

      // Fetch recent tickets (only the 5 most recent tickets shown in the UI)
      const ticketsData = await ticketApi.getTickets({ limit: 5 });
      setTickets(ticketsData.items || []);

      if (isAdmin) {
        // Fetch users & teams count (Admin only)
        const usersData = await userApi.getUsers({ limit: 1 });
        const teamsData = await teamApi.getTeams({ limit: 1 });
        setUsersCount(usersData.total || 0);
        setTeamsCount(teamsData.total || 0);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Assembling your dashboard..." />;
  }

  // Prepping Chart Data
  const statusColors = {
    open: 'hsl(210, 100%, 60%)',
    in_progress: 'hsl(35, 100%, 55%)',
    resolved: 'hsl(140, 100%, 55%)',
    closed: 'hsl(220, 10%, 60%)'
  };

  const priorityColors = {
    low: 'hsl(220, 15%, 60%)',
    medium: 'hsl(45, 100%, 55%)',
    high: 'hsl(15, 100%, 55%)',
    urgent: 'hsl(340, 100%, 55%)'
  };

  const statusPieData = stats?.by_status
    ? Object.entries(stats.by_status).map(([key, val]) => ({
        name: key.replace('_', ' ').toUpperCase(),
        value: val,
        color: statusColors[key] || '#ccc'
      })).filter(item => item.value > 0)
    : [];

  const priorityBarData = stats?.by_priority
    ? Object.entries(stats.by_priority).map(([key, val]) => ({
        name: key.toUpperCase(),
        Tickets: val,
        color: priorityColors[key] || '#ccc'
      }))
    : [];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header-row">
        <div>
          <h2 className="page-title">Welcome back, {user?.username}!</h2>
          <p className="page-subtitle">Here is what is happening with the ticket queue today.</p>
        </div>
        {isEmployee && (
          <Button
            variant="primary"
            icon={PlusCircle}
            onClick={() => navigate('/tickets?create=true')}
          >
            Create Ticket
          </Button>
        )}
      </div>

      {/* ── Admin Dashboard ── */}
      {isAdmin && (
        <>
          <div className="stats-grid">
            <div className="stat-card glass-card">
              <div className="stat-icon-wrapper text-accent">
                <Ticket size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-label">Total Tickets</span>
                <span className="stat-value">{stats?.total || 0}</span>
              </div>
            </div>

            <div className="stat-card glass-card">
              <div className="stat-icon-wrapper text-warning">
                <Clock size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-label">Unassigned</span>
                <span className="stat-value">{stats?.unassigned || 0}</span>
              </div>
            </div>

            <div className="stat-card glass-card">
              <div className="stat-icon-wrapper text-success">
                <CheckCircle2 size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-label">Open / In Progress</span>
                <span className="stat-value">
                  {(stats?.by_status?.open || 0) + (stats?.by_status?.in_progress || 0)}
                </span>
              </div>
            </div>

            <div className="stat-card glass-card">
              <div className="stat-icon-wrapper text-secondary">
                <Users size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-label">Total Users</span>
                <span className="stat-value">{usersCount}</span>
              </div>
            </div>
          </div>

          <div className="charts-grid">
            <div className="chart-card glass-card">
              <h3 className="chart-title">Status Distribution</h3>
              <div className="chart-wrapper">
                {statusPieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={statusPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {statusPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--bg-secondary)',
                          borderColor: 'var(--border)',
                          borderRadius: '8px',
                          color: 'var(--text-primary)'
                        }}
                      />
                      <Legend formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>{value}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="no-chart-data">No tickets in system yet</div>
                )}
              </div>
            </div>

            <div className="chart-card glass-card">
              <h3 className="chart-title">Priority Breakdown</h3>
              <div className="chart-wrapper">
                {priorityBarData.some(b => b.Tickets > 0) ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={priorityBarData}>
                      <XAxis dataKey="name" stroke="var(--text-tertiary)" fontSize={10} />
                      <YAxis stroke="var(--text-tertiary)" fontSize={10} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--bg-secondary)',
                          borderColor: 'var(--border)',
                          borderRadius: '8px',
                          color: 'var(--text-primary)'
                        }}
                      />
                      <Bar dataKey="Tickets" radius={[4, 4, 0, 0]}>
                        {priorityBarData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="no-chart-data">No priority metrics yet</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Agent Dashboard ── */}
      {isAgent && (
        <div className="stats-grid">
          <div className="stat-card glass-card">
            <div className="stat-icon-wrapper text-accent">
              <Ticket size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Accessible Tickets</span>
              <span className="stat-value">{stats?.total || 0}</span>
            </div>
          </div>

          <div className="stat-card glass-card">
            <div className="stat-icon-wrapper text-success">
              <UserCheck size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Assigned to Me</span>
              <span className="stat-value">{stats?.assignedToMe || 0}</span>
            </div>
          </div>

          <div className="stat-card glass-card">
            <div className="stat-icon-wrapper text-warning">
              <Clock size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Active (Open/In Progress)</span>
              <span className="stat-value">
                {(stats?.by_status?.open || 0) + (stats?.by_status?.in_progress || 0)}
              </span>
            </div>
          </div>

          <div className="stat-card glass-card">
            <div className="stat-icon-wrapper text-secondary">
              <CheckCircle2 size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Resolved / Closed</span>
              <span className="stat-value">
                {(stats?.by_status?.resolved || 0) + (stats?.by_status?.closed || 0)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Employee Dashboard ── */}
      {isEmployee && (
        <div className="stats-grid">
          <div className="stat-card glass-card">
            <div className="stat-icon-wrapper text-accent">
              <Ticket size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Total Tickets Created</span>
              <span className="stat-value">{stats?.total || 0}</span>
            </div>
          </div>

          <div className="stat-card glass-card">
            <div className="stat-icon-wrapper text-warning">
              <Clock size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Pending Help</span>
              <span className="stat-value">{stats?.active || 0}</span>
            </div>
          </div>

          <div className="stat-card glass-card">
            <div className="stat-icon-wrapper text-success">
              <CheckCircle2 size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Closed / Resolved</span>
              <span className="stat-value">{stats?.resolved || 0}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Recent Tickets Table/List ── */}
      <div className="recent-tickets-section glass-card">
        <div className="section-header">
          <h3 className="section-title">
            {isAdmin ? 'Recent Ticket Queue' : isAgent ? 'Assigned & Team Tickets' : 'My Ticket History'}
          </h3>
          <Button variant="secondary" size="sm" onClick={() => navigate('/tickets')} icon={ArrowRight}>
            View All
          </Button>
        </div>

        {tickets.length > 0 ? (
          <div className="recent-list">
            {tickets.slice(0, 5).map((ticket) => (
              <div
                key={ticket.id}
                className="recent-ticket-row"
                onClick={() => navigate(`/tickets/${ticket.id}`)}
              >
                <div className="recent-ticket-details">
                  <span className="recent-ticket-id">#{ticket.id}</span>
                  <span className="recent-ticket-title truncate">{ticket.title}</span>
                </div>
                <div className="recent-ticket-meta">
                  <Badge variant={ticket.priority}>{ticket.priority}</Badge>
                  <Badge variant={ticket.status}>{ticket.status}</Badge>
                  <span className="recent-ticket-date">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-tickets-state">
            <AlertCircle size={32} />
            <p>No tickets available in this view.</p>
          </div>
        )}
      </div>
    </div>
  );
}

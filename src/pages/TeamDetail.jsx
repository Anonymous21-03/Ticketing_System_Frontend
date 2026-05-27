import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { teamApi } from '../services/teamApi';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Table from '../components/ui/Table';
import { Network, ArrowLeft, Users, Ticket, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend
} from 'recharts';
import toast from 'react-hot-toast';
import './TeamDetail.css';

export default function TeamDetail() {
  const { id } = useParams();
  const teamId = parseInt(id);
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [stats, setStats] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeamProfile();
  }, [teamId]);

  const loadTeamProfile = async () => {
    setLoading(true);
    try {
      const teamData = await teamApi.getTeam(teamId);
      setTeam(teamData);

      const [statsData, membersData] = await Promise.all([
        teamApi.getStats(teamId).catch(() => null),
        teamApi.getMembers(teamId, { limit: 100 }).catch(() => ({ items: [] }))
      ]);

      setStats(statsData);
      setMembers(membersData?.items || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load team details.');
      navigate('/teams');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading team profile..." />;
  if (!team) return null;

  // Chart Data
  const statusColors = {
    open: 'hsl(210, 100%, 60%)',
    in_progress: 'hsl(35, 100%, 55%)',
    resolved: 'hsl(140, 100%, 55%)',
    closed: 'hsl(220, 10%, 60%)'
  };

  const statusPieData = stats?.by_status
    ? Object.entries(stats.by_status)
        .map(([key, val]) => ({
          name: key.replace('_', ' ').toUpperCase(),
          value: val,
          color: statusColors[key] || '#ccc'
        }))
        .filter((item) => item.value > 0)
    : [];

  return (
    <div className="team-detail-container">
      <div className="detail-navigation">
        <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={() => navigate('/teams')}>
          Back to Teams
        </Button>
      </div>

      <div className="team-header-card glass-card">
        <div className="team-header-content">
          <div className="team-icon-wrapper text-accent">
            <Network size={32} />
          </div>
          <div>
            <h2 className="page-title">{team.name}</h2>
            <p className="page-subtitle">{team.description}</p>
          </div>
        </div>
        <Badge variant={team.is_active ? 'resolved' : 'closed'}>
          {team.is_active ? 'active' : 'inactive'}
        </Badge>
      </div>

      <div className="team-grid">
        {/* Statistics Pane */}
        <div className="team-stats-pane glass-card">
          <h3 className="pane-title">Team Performance</h3>
          {stats ? (
            <div className="stats-content">
              <div className="mini-stats-grid">
                <div className="mini-stat-box">
                  <Ticket className="text-accent" />
                  <span className="mini-stat-val">{stats.total || 0}</span>
                  <span className="mini-stat-label">Total Tickets</span>
                </div>
                <div className="mini-stat-box">
                  <AlertCircle className="text-warning" />
                  <span className="mini-stat-val">
                    {(stats.by_status?.open || 0) + (stats.by_status?.in_progress || 0)}
                  </span>
                  <span className="mini-stat-label">Active Tickets</span>
                </div>
                <div className="mini-stat-box">
                  <CheckCircle2 className="text-success" />
                  <span className="mini-stat-val">
                    {(stats.by_status?.resolved || 0) + (stats.by_status?.closed || 0)}
                  </span>
                  <span className="mini-stat-label">Resolved/Closed</span>
                </div>
              </div>

              <div className="chart-wrapper mt-4">
                <h4 className="chart-title">Status Breakdown</h4>
                {statusPieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={statusPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {statusPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="no-chart-data">No tickets assigned to this team yet.</div>
                )}
              </div>
            </div>
          ) : (
            <div className="no-chart-data">Statistics not available.</div>
          )}
        </div>

        {/* Roster Pane */}
        <div className="team-roster-pane glass-card">
          <div className="pane-header">
            <h3 className="pane-title">Team Roster</h3>
            <span className="roster-count"><Users size={16}/> {members.length} Members</span>
          </div>

          <div className="table-responsive">
            <Table headers={['Member Name', 'Username', 'Role', 'Status']}>
              {members.map(member => (
                <tr key={member.id}>
                  <td className="font-medium">{member.name}</td>
                  <td>@{member.username}</td>
                  <td><Badge variant={member.role}>{member.role}</Badge></td>
                  <td>
                    <Badge variant={member.is_active ? 'resolved' : 'closed'}>
                      {member.is_active ? 'active' : 'inactive'}
                    </Badge>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center text-tertiary py-4">
                    No members assigned to this team.
                  </td>
                </tr>
              )}
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}

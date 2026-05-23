import { useState, useEffect } from 'react';
import { teamApi } from '../services/teamApi';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Pagination from '../components/ui/Pagination';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import CreateTeamModal from '../components/CreateTeamModal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { Network, Search, Edit2, Trash2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import './TeamList.css';

export default function TeamList() {
  const [teams, setTeams] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modals state
  const [createOpen, setCreateOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);

  // Deletion Confirm Dialog
  const [deleteConfirmTeam, setDeleteConfirmTeam] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Reactivate Confirm Dialog
  const [reactivateConfirmTeam, setReactivateConfirmTeam] = useState(null);
  const [reactivateLoading, setReactivateLoading] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, [q, page]);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const offset = (page - 1) * limit;
      const params = { limit, offset };
      if (q) params.search = q;

      const data = await teamApi.getTeams(params);
      setTeams(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
      toast.error('Failed to retrieve teams directory.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!deleteConfirmTeam) return;
    setDeleteLoading(true);
    try {
      await teamApi.deleteTeam(deleteConfirmTeam.id);
      toast.success(`Team ${deleteConfirmTeam.name} deactivated.`);
      fetchTeams();
    } catch (err) {
      console.error(err);
      toast.error('Failed to deactivate team.');
    } finally {
      setDeleteLoading(false);
      setDeleteConfirmTeam(null);
    }
  };

  const handleReactivateTeam = async () => {
    if (!reactivateConfirmTeam) return;
    setReactivateLoading(true);
    try {
      await teamApi.reactivateTeam(reactivateConfirmTeam.id);
      toast.success(`Team ${reactivateConfirmTeam.name} reactivated.`);
      fetchTeams();
    } catch (err) {
      console.error(err);
      toast.error('Failed to reactivate team.');
    } finally {
      setReactivateLoading(false);
      setReactivateConfirmTeam(null);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="team-list-container">
      <div className="list-header">
        <div>
          <h2 className="page-title">Teams Management</h2>
          <p className="page-subtitle">Group agents into teams to coordinate, delegate, and resolve ticket categories.</p>
        </div>
        <Button
          variant="primary"
          icon={Network}
          onClick={() => {
            setEditingTeam(null);
            setCreateOpen(true);
          }}
        >
          Create Team
        </Button>
      </div>

      {/* Search Toolbar */}
      <div className="team-filter-bar glass-card">
        <Input
          type="text"
          placeholder="Search by team name or description..."
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          icon={Search}
          className="search-field"
        />
      </div>

      {loading ? (
        <LoadingSpinner message="Scanning team networks..." />
      ) : teams.length > 0 ? (
        <>
          <div className="table-responsive">
            <Table headers={['ID', 'Team Name', 'Description', 'Status', 'Actions']}>
              {teams.map((t) => (
                <tr key={t.id}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>#{t.id}</td>
                  <td style={{ fontWeight: 500 }}>{t.name}</td>
                  <td style={{ color: 'var(--text-secondary)', maxWidth: '300px' }} className="truncate">
                    {t.description}
                  </td>
                  <td>
                    <Badge variant={t.is_active ? 'resolved' : 'closed'}>
                      {t.is_active ? 'active' : 'inactive'}
                    </Badge>
                  </td>
                  <td>
                    <div className="row-action-buttons">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Edit2}
                        onClick={() => {
                          setEditingTeam(t);
                          setCreateOpen(true);
                        }}
                        title="Edit Team"
                      />
                      {t.is_active ? (
                        <Button
                          variant="danger"
                          size="sm"
                          icon={Trash2}
                          onClick={() => setDeleteConfirmTeam(t)}
                          title="Deactivate Team"
                        />
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={ShieldCheck}
                          onClick={() => setReactivateConfirmTeam(t)}
                          title="Reactivate Team"
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          </div>

          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      ) : (
        <EmptyState
          title="No teams found"
          description="We couldn't find any teams. Set up a support team to start assigning ticket queues."
          icon={Network}
          actionText="Create Team"
          onActionClick={() => setCreateOpen(true)}
        />
      )}

      {/* Modals & Dialogs */}
      <CreateTeamModal
        isOpen={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setEditingTeam(null);
        }}
        onSuccess={fetchTeams}
        teamToEdit={editingTeam}
      />

      <ConfirmDialog
        isOpen={deleteConfirmTeam !== null}
        onClose={() => setDeleteConfirmTeam(null)}
        onConfirm={handleDeleteTeam}
        title="Deactivate Support Team"
        message={`Are you sure you want to deactivate team "${deleteConfirmTeam?.name}"? You will not be able to assign tickets to this team.`}
        confirmText="Deactivate Team"
        loading={deleteLoading}
      />

      <ConfirmDialog
        isOpen={reactivateConfirmTeam !== null}
        onClose={() => setReactivateConfirmTeam(null)}
        onConfirm={handleReactivateTeam}
        title="Reactivate Support Team"
        message={`Are you sure you want to reactivate team "${reactivateConfirmTeam?.name}"? This restores ticket routing for them.`}
        confirmText="Restore Team"
        variant="info"
        loading={reactivateLoading}
      />
    </div>
  );
}

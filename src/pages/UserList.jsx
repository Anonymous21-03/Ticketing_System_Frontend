import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../services/userApi';
import { teamApi } from '../services/teamApi';
import { ticketApi } from '../services/ticketApi';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Pagination from '../components/ui/Pagination';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import CreateUserModal from '../components/CreateUserModal';
import ResetPasswordModal from '../components/ResetPasswordModal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { UserPlus, Search, Edit2, Key, Trash2, ShieldCheck, Ticket, ArrowUp, ArrowDown } from 'lucide-react';
import toast from 'react-hot-toast';
import './UserList.css';

export default function UserList() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState('desc');
  const limit = 10;

  // Modals state
  const [createOpen, setCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [resetPwUser, setResetPwUser] = useState(null);

  // Deletion Confirm Dialog
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Reactivate Confirm Dialog
  const [reactivateConfirmUser, setReactivateConfirmUser] = useState(null);
  const [reactivateLoading, setReactivateLoading] = useState(false);

  // Assigned Tickets Modal
  const [assignedTicketsUser, setAssignedTicketsUser] = useState(null);
  const [assignedTickets, setAssignedTickets] = useState([]);
  const [assignedTicketsLoading, setAssignedTicketsLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    loadTeams();
  }, [q, roleFilter, teamFilter, activeFilter, page, sortBy, order]);

  const loadTeams = async () => {
    try {
      const data = await teamApi.getTeams({ limit: 100 });
      setTeams(data.items || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const offset = (page - 1) * limit;
      const params = { limit, offset, sort_by: sortBy, order };
      if (q) params.search = q;
      if (roleFilter) params.role = roleFilter;
      if (teamFilter) params.team_id = parseInt(teamFilter);
      if (activeFilter !== '') params.is_active = activeFilter === 'true';

      const data = await userApi.getUsers(params);
      setUsers(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
      toast.error('Failed to retrieve user directory.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirmUser) return;
    setDeleteLoading(true);
    try {
      await userApi.deleteUser(deleteConfirmUser.id);
      toast.success(`User ${deleteConfirmUser.username} deactivated.`);
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error('Failed to deactivate user.');
    } finally {
      setDeleteLoading(false);
      setDeleteConfirmUser(null);
    }
  };

  const handleReactivateUser = async () => {
    if (!reactivateConfirmUser) return;
    setReactivateLoading(true);
    try {
      await userApi.reactivateUser(reactivateConfirmUser.id);
      toast.success(`User ${reactivateConfirmUser.username} reactivated.`);
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error('Failed to reactivate user.');
    } finally {
      setReactivateLoading(false);
      setReactivateConfirmUser(null);
    }
  };

  const handleViewAssignedTickets = async (u) => {
    setAssignedTicketsUser(u);
    setAssignedTicketsLoading(true);
    try {
      const data = await ticketApi.getUserAssigned(u.id, { limit: 50 });
      setAssignedTickets(data.items || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load assigned tickets.');
    } finally {
      setAssignedTicketsLoading(false);
    }
  };

  const getTeamName = (teamId) => {
    const t = teams.find((x) => x.id === teamId);
    return t ? t.name : '—';
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setOrder('asc');
    }
  };

  const SortableHeader = ({ field, label }) => {
    const isActive = sortBy === field;
    return (
      <div
        className="sortable-header"
        onClick={() => handleSort(field)}
      >
        <span>{label}</span>
        {isActive && (
          <span className="sort-icon">
            {order === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
          </span>
        )}
      </div>
    );
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="user-list-container">
      <div className="list-header">
        <div>
          <h2 className="page-title">User Directory</h2>
          <p className="page-subtitle">Provision employees, edit roles, assign teams, and manage credentials.</p>
        </div>
        <Button
          variant="primary"
          icon={UserPlus}
          onClick={() => {
            setEditingUser(null);
            setCreateOpen(true);
          }}
        >
          Add User
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="user-filter-bar glass-card">
        <Input
          type="text"
          placeholder="Search by name, username, or email..."
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          icon={Search}
          className="search-field"
        />

        <Input
          type="select"
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="role-select"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="agent">Agent</option>
          <option value="employee">Employee</option>
        </Input>

        <Input
          type="select"
          value={teamFilter}
          onChange={(e) => {
            setTeamFilter(e.target.value);
            setPage(1);
          }}
          className="role-select"
        >
          <option value="">All Teams</option>
          <option value="0">Unassigned</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </Input>

        <Input
          type="select"
          value={activeFilter}
          onChange={(e) => {
            setActiveFilter(e.target.value);
            setPage(1);
          }}
          className="role-select"
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </Input>
      </div>

      {loading ? (
        <LoadingSpinner message="Scanning directories..." />
      ) : users.length > 0 ? (
        <>
          <div className="table-responsive">
            <Table headers={[
              'ID',
              <SortableHeader field="name" label="Name" />,
              <SortableHeader field="username" label="Username" />,
              <SortableHeader field="email" label="Email" />,
              <SortableHeader field="role" label="Role" />,
              'Assigned Team',
              'Status',
              'Actions'
            ]}>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>#{u.id}</td>
                  <td style={{ fontWeight: 500 }}>{u.name}</td>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>
                    <Badge variant={u.role}>{u.role}</Badge>
                  </td>
                  <td>{getTeamName(u.team_id)}</td>
                  <td>
                    <Badge variant={u.is_active ? 'resolved' : 'closed'}>
                      {u.is_active ? 'active' : 'inactive'}
                    </Badge>
                  </td>
                  <td>
                    <div className="row-action-buttons">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Ticket}
                        onClick={() => handleViewAssignedTickets(u)}
                        title="View Assigned Tickets"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Edit2}
                        onClick={() => {
                          setEditingUser(u);
                          setCreateOpen(true);
                        }}
                        title="Edit User"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Key}
                        onClick={() => setResetPwUser(u)}
                        title="Reset Password"
                      />
                      {u.is_active ? (
                        <Button
                          variant="danger"
                          size="sm"
                          icon={Trash2}
                          onClick={() => setDeleteConfirmUser(u)}
                          title="Deactivate User"
                        />
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={ShieldCheck}
                          onClick={() => setReactivateConfirmUser(u)}
                          title="Reactivate User"
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
          title="No users found"
          description="Try removing search filters or add a new user manually."
          icon={UserPlus}
          actionText="Add User"
          onActionClick={() => setCreateOpen(true)}
        />
      )}

      {/* Modals & Dialogs */}
      <CreateUserModal
        isOpen={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setEditingUser(null);
        }}
        onSuccess={fetchUsers}
        userToEdit={editingUser}
      />

      <ResetPasswordModal
        isOpen={resetPwUser !== null}
        onClose={() => setResetPwUser(null)}
        targetUser={resetPwUser}
      />

      <ConfirmDialog
        isOpen={deleteConfirmUser !== null}
        onClose={() => setDeleteConfirmUser(null)}
        onConfirm={handleDeleteUser}
        title="Deactivate User Account"
        message={`Are you sure you want to deactivate ${deleteConfirmUser?.username}? They will no longer be able to log in or create/manage tickets.`}
        confirmText="Deactivate Account"
        loading={deleteLoading}
      />

      <ConfirmDialog
        isOpen={reactivateConfirmUser !== null}
        onClose={() => setReactivateConfirmUser(null)}
        onConfirm={handleReactivateUser}
        title="Reactivate User Account"
        message={`Are you sure you want to restore ${reactivateConfirmUser?.username}? This will re-enable their login permissions.`}
        confirmText="Restore Account"
        variant="info"
        loading={reactivateLoading}
      />

      {/* Assigned Tickets Modal */}
      <Modal
        isOpen={assignedTicketsUser !== null}
        onClose={() => {
          setAssignedTicketsUser(null);
          setAssignedTickets([]);
        }}
        title={`Tickets Assigned to ${assignedTicketsUser?.username || ''}`}
        size="lg"
      >
        {assignedTicketsLoading ? (
          <LoadingSpinner message="Loading assigned tickets..." />
        ) : assignedTickets.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto' }}>
            {assignedTickets.map((t) => (
              <div
                key={t.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
                onClick={() => navigate(`/tickets/${t.id}`)}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-secondary)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '200px' }}>
                  <span style={{ fontFamily: 'monospace', color: 'var(--text-tertiary)', fontWeight: 600, fontSize: '0.85rem' }}>#{t.id}</span>
                  <span style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.9rem' }} className="truncate">{t.title}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Badge variant={t.priority}>{t.priority}</Badge>
                  <Badge variant={t.status}>{t.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)' }}>
            <p>No tickets currently assigned to this user.</p>
          </div>
        )}
      </Modal>
    </div>
  );
}

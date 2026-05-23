import { useState, useEffect } from 'react';
import { userApi } from '../services/userApi';
import { teamApi } from '../services/teamApi';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Pagination from '../components/ui/Pagination';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import CreateUserModal from '../components/CreateUserModal';
import ResetPasswordModal from '../components/ResetPasswordModal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { UserPlus, Search, Edit2, Key, Trash2, ShieldCheck, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import './UserList.css';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
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

  useEffect(() => {
    fetchUsers();
    loadTeams();
  }, [q, roleFilter, page]);

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
      const params = { limit, offset };
      if (q) params.search = q;
      if (roleFilter) params.role = roleFilter;

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

  const getTeamName = (teamId) => {
    const t = teams.find((x) => x.id === teamId);
    return t ? t.name : '—';
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
      </div>

      {loading ? (
        <LoadingSpinner message="Scanning directories..." />
      ) : users.length > 0 ? (
        <>
          <div className="table-responsive">
            <Table headers={['ID', 'Name', 'Username', 'Email', 'Role', 'Assigned Team', 'Status', 'Actions']}>
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
    </div>
  );
}

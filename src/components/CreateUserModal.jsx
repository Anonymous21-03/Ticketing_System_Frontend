import { useState, useEffect } from 'react';
import { authApi } from '../services/authApi';
import { userApi } from '../services/userApi';
import { teamApi } from '../services/teamApi';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Button from './ui/Button';
import toast from 'react-hot-toast';

export default function CreateUserModal({ isOpen, onClose, onSuccess, userToEdit = null }) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [teamId, setTeamId] = useState('');
  
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const isEditMode = !!userToEdit;

  useEffect(() => {
    if (isOpen) {
      loadTeams();
      if (userToEdit) {
        setName(userToEdit.name || '');
        setUsername(userToEdit.username || '');
        setEmail(userToEdit.email || '');
        setRole(userToEdit.role || 'employee');
        setTeamId(userToEdit.team_id || '');
        setPassword(''); // Clear password in edit
      } else {
        setName('');
        setUsername('');
        setEmail('');
        setPassword('');
        setRole('employee');
        setTeamId('');
      }
      setErrors({});
    }
  }, [isOpen, userToEdit]);

  const loadTeams = async () => {
    try {
      const data = await teamApi.getTeams({ limit: 100 });
      setTeams(data.items || []);
    } catch (err) {
      console.error(err);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Full Name is required';
    if (!username.trim()) newErrors.username = 'Username is required';
    else if (username.length < 3) newErrors.username = 'Username must be at least 3 characters';
    
    if (!email.trim()) newErrors.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email address is invalid';

    if (!isEditMode) {
      if (!password) newErrors.password = 'Password is required';
      else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      else {
        // Password strength regex
        if (!/[A-Z]/.test(password)) newErrors.password = 'Password must have an uppercase letter';
        else if (!/[a-z]/.test(password)) newErrors.password = 'Password must have a lowercase letter';
        else if (!/\d/.test(password)) newErrors.password = 'Password must have a digit';
        else if (!/[@$!%*?&#]/.test(password)) newErrors.password = 'Password must contain a special character (@$!%*?&#)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        name,
        username,
        email,
        role,
        team_id: teamId ? parseInt(teamId) : null
      };

      if (isEditMode) {
        await userApi.updateUser(userToEdit.id, payload);
        toast.success('User updated successfully!');
      } else {
        payload.password = password;
        await authApi.register(payload);
        toast.success('User registered successfully!');
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail;
      const errorMsg = typeof detail === 'string' ? detail : 'Failed to save user details.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? `Edit User: ${userToEdit.username}` : 'Register New User'}
      size="md"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <Input
          label="Full Name"
          type="text"
          placeholder="e.g. Jane Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          required
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            label="Username"
            type="text"
            placeholder="e.g. janedoe"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={errors.username}
            required
            disabled={isEditMode} // Cannot rename username
          />

          <Input
            label="Email"
            type="email"
            placeholder="e.g. jane@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            required
          />
        </div>

        {!isEditMode && (
          <div className="password-field-wrapper">
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              required
            />
            <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '4px', lineHeight: '1.4' }}>
              Requirements: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, and 1 special symbol (@$!%*?&#).
            </p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            label="Role"
            type="select"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="admin">Admin</option>
            <option value="agent">Agent</option>
            <option value="employee">Employee</option>
          </Input>

          <Input
            label="Assigned Team"
            type="select"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
          >
            <option value="">No Team</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Input>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={loading}>
            {isEditMode ? 'Save User' : 'Register User'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

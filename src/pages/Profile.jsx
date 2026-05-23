import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../services/userApi';
import { teamApi } from '../services/teamApi';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { User, KeyRound, ShieldAlert, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import './Profile.css';

export default function Profile() {
  const { user } = useAuth();
  
  // States
  const [teamName, setTeamName] = useState('—');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user?.team_id) {
      teamApi.getTeam(user.team_id)
        .then((t) => setTeamName(t.name))
        .catch(() => setTeamName('—'));
    }
  }, [user]);

  const validate = () => {
    const newErrors = {};
    if (!currentPassword) newErrors.currentPassword = 'Current password is required';
    
    if (!newPassword) newErrors.newPassword = 'New password is required';
    else if (newPassword.length < 8) newErrors.newPassword = 'Password must be at least 8 characters';
    else {
      if (!/[A-Z]/.test(newPassword)) newErrors.newPassword = 'Password must contain an uppercase letter';
      else if (!/[a-z]/.test(newPassword)) newErrors.newPassword = 'Password must contain a lowercase letter';
      else if (!/\d/.test(newPassword)) newErrors.newPassword = 'Password must contain a digit';
      else if (!/[@$!%*?&#]/.test(newPassword)) newErrors.newPassword = 'Password must contain a special character (@$!%*?&#)';
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await userApi.changePassword(user.id, {
        current_password: currentPassword,
        new_password: newPassword
      });
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail;
      toast.error(typeof detail === 'string' ? detail : 'Failed to change password. Check current credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div>
        <h2 className="page-title">My Account</h2>
        <p className="page-subtitle">Manage your support profile settings and security configurations.</p>
      </div>

      <div className="profile-grid">
        {/* Profile Card */}
        <div className="profile-card glass-card fade-in">
          <div className="profile-card-header">
            <div className="large-avatar">
              {user?.username.substring(0, 2).toUpperCase()}
            </div>
            <h3 className="profile-name">{user?.name || user?.username}</h3>
            <p className="profile-username">@{user?.username}</p>
          </div>

          <div className="profile-details-list">
            <div className="detail-item">
              <span className="detail-label">Email Address</span>
              <span className="detail-value">{user?.email}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Access Level</span>
              <span className="detail-value text-accent" style={{ textTransform: 'capitalize' }}>
                {user?.role}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Assigned Team</span>
              <span className="detail-value">{teamName}</span>
            </div>
          </div>
        </div>

        {/* Password Reset Section */}
        <div className="security-card glass-card fade-in">
          <h3 className="card-heading">
            <KeyRound size={20} className="text-accent" />
            <span>Update Password</span>
          </h3>
          <p className="card-subheading">Change your login credentials. Make sure you use a complex layout.</p>

          <form onSubmit={handlePasswordChange} className="password-form">
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              error={errors.currentPassword}
              required
            />

            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={errors.newPassword}
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              required
            />

            <div className="password-rules-box">
              <span className="rules-heading">Security Guidelines</span>
              <ul>
                <li>At least 8 characters long</li>
                <li>At least one uppercase and lowercase letter</li>
                <li>At least one digit and special symbol (@$!%*?&#)</li>
              </ul>
            </div>

            <Button variant="primary" type="submit" loading={loading} className="save-pw-btn">
              Update Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

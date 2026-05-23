import { useState, useEffect } from 'react';
import { userApi } from '../services/userApi';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Button from './ui/Button';
import toast from 'react-hot-toast';

export default function ResetPasswordModal({ isOpen, onClose, targetUser }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
    }
  }, [isOpen]);

  const validate = () => {
    if (!password) {
      setError('Password is required');
      return false;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter');
      return false;
    }
    if (!/[a-z]/.test(password)) {
      setError('Password must contain at least one lowercase letter');
      return false;
    }
    if (!/\d/.test(password)) {
      setError('Password must contain at least one digit');
      return false;
    }
    if (!/[@$!%*?&#]/.test(password)) {
      setError('Password must contain at least one special character (@, $, !, %, *, ?, &, #)');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await userApi.resetPassword(targetUser.id, password);
      toast.success(`Password for ${targetUser.username} has been reset successfully.`);
      onClose();
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail;
      toast.error(typeof detail === 'string' ? detail : 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Reset Password: ${targetUser?.username}`} size="sm">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <Input
          label="New Password"
          type="password"
          placeholder="Enter strong password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error}
          required
          autoFocus
        />
        <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', lineHeight: '1.4' }}>
          Requirements: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, and 1 special symbol (@$!%*?&#).
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" type="submit" loading={loading}>
            Reset Password
          </Button>
        </div>
      </form>
    </Modal>
  );
}

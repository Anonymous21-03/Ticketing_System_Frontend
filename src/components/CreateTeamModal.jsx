import { useState, useEffect } from 'react';
import { teamApi } from '../services/teamApi';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Button from './ui/Button';
import toast from 'react-hot-toast';

export default function CreateTeamModal({ isOpen, onClose, onSuccess, teamToEdit = null }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const isEditMode = !!teamToEdit;

  useEffect(() => {
    if (isOpen) {
      if (teamToEdit) {
        setName(teamToEdit.name || '');
        setDescription(teamToEdit.description || '');
      } else {
        setName('');
        setDescription('');
      }
      setErrors({});
    }
  }, [isOpen, teamToEdit]);

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Team Name is required';
    else if (name.length > 100) newErrors.name = 'Team Name cannot exceed 100 characters';
    
    if (!description.trim()) newErrors.description = 'Description is required';
    else if (description.length > 500) newErrors.description = 'Description cannot exceed 500 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = { name, description };

      if (isEditMode) {
        await teamApi.updateTeam(teamToEdit.id, payload);
        toast.success('Team updated successfully!');
      } else {
        await teamApi.createTeam(payload);
        toast.success('Team created successfully!');
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail;
      const errorMsg = typeof detail === 'string' ? detail : 'Failed to save team details.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? `Edit Team: ${teamToEdit.name}` : 'Create New Team'}
      size="md"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <Input
          label="Team Name"
          type="text"
          placeholder="e.g. Cloud Security Team"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          required
        />

        <Input
          label="Description"
          type="textarea"
          placeholder="Describe team domains, queue focus, or alert priorities..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
          rows={4}
          required
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={loading}>
            {isEditMode ? 'Save Team' : 'Create Team'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

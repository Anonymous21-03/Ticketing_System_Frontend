import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ticketApi } from '../services/ticketApi';
import { teamApi } from '../services/teamApi';
import { userApi } from '../services/userApi';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Button from './ui/Button';
import toast from 'react-hot-toast';

export default function CreateTicketModal({ isOpen, onClose, onSuccess }) {
  const { user, isAdmin, isAgent } = useAuth();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [teamId, setTeamId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  
  const [teams, setTeams] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && (isAdmin || isAgent)) {
      loadTeamsAndAgents();
    }
  }, [isOpen]);

  const loadTeamsAndAgents = async () => {
    try {
      if (isAdmin) {
        const [teamsData, usersData] = await Promise.all([
          teamApi.getTeams({ limit: 100 }),
          userApi.getUsers({ limit: 100 })
        ]);
        setTeams(teamsData.items || []);
        const staff = (usersData.items || []).filter(u => u.role === 'admin' || u.role === 'agent');
        setAgents(staff);
      } else if (isAgent && user?.team_id) {
        const [myTeam, membersData] = await Promise.all([
          teamApi.getTeam(user.team_id),
          teamApi.getMembers(user.team_id, { limit: 100 })
        ]);
        setTeams([myTeam]);
        const staff = (membersData.items || []).filter(u => u.role === 'admin' || u.role === 'agent');
        setAgents(staff);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load teams or agents for assignment.');
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    else if (title.length > 150) newErrors.title = 'Title cannot exceed 150 characters';
    
    if (!description.trim()) newErrors.description = 'Description is required';
    else if (description.length > 2000) newErrors.description = 'Description cannot exceed 2000 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        title,
        description,
        priority,
        team_id: teamId ? parseInt(teamId) : null,
        assigned_to: assignedTo ? parseInt(assignedTo) : null
      };

      await ticketApi.createTicket(payload);
      toast.success('Ticket created successfully!');
      
      // Reset form
      setTitle('');
      setDescription('');
      setPriority('medium');
      setTeamId('');
      setAssignedTo('');
      
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail;
      const errorMsg = typeof detail === 'string' ? detail : 'Failed to create ticket. Check your fields.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Support Ticket" size="md">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <Input
          label="Ticket Title"
          type="text"
          placeholder="e.g. Printer offline on 3rd floor"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          required
        />

        <Input
          label="Detailed Description"
          type="textarea"
          placeholder="Describe the issue, steps to reproduce, or requested help details..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
          rows={5}
          required
        />

        <Input
          label="Priority"
          type="select"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </Input>

        {(isAdmin || isAgent) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Assign to Team"
              type="select"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
            >
              <option value="">Select Team</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Input>

            <Input
              label="Assign to Agent"
              type="select"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            >
              <option value="">Select Agent</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.username} ({a.role})
                </option>
              ))}
            </Input>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={loading}>
            Submit Ticket
          </Button>
        </div>
      </form>
    </Modal>
  );
}

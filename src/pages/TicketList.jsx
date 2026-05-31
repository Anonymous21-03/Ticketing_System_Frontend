import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ticketApi } from '../services/ticketApi';
import SearchFilter from '../components/ui/SearchFilter';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Pagination from '../components/ui/Pagination';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import CreateTicketModal from '../components/CreateTicketModal';
import Button from '../components/ui/Button';
import { PlusCircle, Ticket, ArrowUp, ArrowDown } from 'lucide-react';
import toast from 'react-hot-toast';
import './TicketList.css';

export default function TicketList() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // State
  const [tickets, setTickets] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  // Filters State from URL or defaults
  const q = searchParams.get('q') || '';
  const status = searchParams.get('status') || '';
  const priority = searchParams.get('priority') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const activeTab = searchParams.get('tab') || 'all';
  const sort_by = searchParams.get('sort_by') || 'created_at';
  const order = searchParams.get('order') || 'desc';
  const limit = 10;

  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setCreateOpen(true);
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('create');
      setSearchParams(newParams);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchTickets();
  }, [q, status, priority, page, activeTab, sort_by, order]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const offset = (page - 1) * limit;
      const params = {
        limit,
        offset,
        sort_by,
        order
      };

      if (q) params.search = q;
      if (status) params.status = status;
      if (priority) params.priority = priority;

      let data;
      if (activeTab === 'assigned') {
        data = await ticketApi.getAssignedToMe(params);
      } else if (activeTab === 'created') {
        data = await ticketApi.getCreatedByMe(params);
      } else if (activeTab === 'team') {
        if (user?.team_id) {
          data = await ticketApi.getTeamTickets(user.team_id, params);
        } else {
          data = { items: [], total: 0 };
        }
      } else {
        data = await ticketApi.getTickets(params);
      }

      setTickets(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load tickets.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    const nextParams = new URLSearchParams(searchParams);
    if (newFilters.q) nextParams.set('q', newFilters.q);
    else nextParams.delete('q');
    
    if (newFilters.status) nextParams.set('status', newFilters.status);
    else nextParams.delete('status');
    
    if (newFilters.priority) nextParams.set('priority', newFilters.priority);
    else nextParams.delete('priority');
    
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  const handleResetFilters = () => {
    const nextParams = new URLSearchParams();
    nextParams.set('tab', activeTab);
    setSearchParams(nextParams);
  };

  const handlePageChange = (newPage) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', newPage.toString());
    setSearchParams(nextParams);
  };

  const handleTabChange = (tab) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', tab);
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  const handleSort = (field) => {
    const nextParams = new URLSearchParams(searchParams);
    if (sort_by === field) {
      nextParams.set('order', order === 'asc' ? 'desc' : 'asc');
    } else {
      nextParams.set('sort_by', field);
      nextParams.set('order', 'asc');
    }
    setSearchParams(nextParams);
  };

  const SortableHeader = ({ field, label }) => {
    const isActive = sort_by === field;
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

  // SLA helper: returns a friendly label for the SLA status
  const getSlaInfo = (ticket) => {
    if (ticket.sla_breached) return { label: 'Breached', variant: 'breached' };
    const isActive = ticket.status === 'open' || ticket.status === 'in_progress';
    if (!isActive) return { label: 'On Track', variant: 'on_track' };
    if (!ticket.due_at) return { label: '—', variant: 'on_track' };
    const now = new Date();
    const due = new Date(ticket.due_at);
    const diff = due - now;
    if (diff <= 0) return { label: 'Breached', variant: 'breached' };
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      return { label: `${days}d ${hours % 24}h left`, variant: 'within_sla' };
    }
    if (hours > 0) return { label: `${hours}h ${minutes}m left`, variant: 'within_sla' };
    return { label: `${minutes}m left`, variant: 'within_sla' };
  };

  return (
    <div className="ticket-list-container">
      <div className="list-header">
        <div>
          <h2 className="page-title">Tickets Queue</h2>
          <p className="page-subtitle">Track, filter, and manage technical support requests.</p>
        </div>
        <Button variant="primary" icon={PlusCircle} onClick={() => setCreateOpen(true)}>
          Create Ticket
        </Button>
      </div>

      <div className="ticket-tabs">
        <button className={`ticket-tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => handleTabChange('all')}>All Tickets</button>
        <button className={`ticket-tab ${activeTab === 'assigned' ? 'active' : ''}`} onClick={() => handleTabChange('assigned')}>Assigned to Me</button>
        <button className={`ticket-tab ${activeTab === 'created' ? 'active' : ''}`} onClick={() => handleTabChange('created')}>Created by Me</button>
        {user?.team_id && (
          <button className={`ticket-tab ${activeTab === 'team' ? 'active' : ''}`} onClick={() => handleTabChange('team')}>Team Tickets</button>
        )}
      </div>

      <SearchFilter
        filters={{ q, status, priority }}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {loading ? (
        <LoadingSpinner message="Searching queue..." />
      ) : tickets.length > 0 ? (
        <>
          <div className="table-responsive">
            <Table
              headers={[
                'ID',
                <SortableHeader field="title" label="Title" />,
                <SortableHeader field="priority" label="Priority" />,
                <SortableHeader field="status" label="Status" />,
                'SLA',
                'Team',
                'Assigned Agent',
                'Created By',
                <SortableHeader field="created_at" label="Created At" />
              ]}
            >
              {tickets.map((t) => (
                <tr key={t.id} onClick={() => navigate(`/tickets/${t.id}`)}>
                  <td className="ticket-id-cell">#{t.id}</td>
                  <td className="ticket-title-cell truncate">{t.title}</td>
                  <td>
                    <Badge variant={t.priority}>{t.priority}</Badge>
                  </td>
                  <td>
                    <Badge variant={t.status}>{t.status}</Badge>
                  </td>
                  <td>
                    {(() => {
                      const sla = getSlaInfo(t);
                      return <Badge variant={sla.variant}>{sla.label}</Badge>;
                    })()}
                  </td>
                  <td className="text-secondary truncate">
                    {t.team_name || <span className="unassigned-lbl">Unassigned</span>}
                  </td>
                  <td className="text-secondary truncate">
                    {t.assigned_to_username || <span className="unassigned-lbl">Unassigned</span>}
                  </td>
                  <td className="text-secondary truncate">
                    {t.created_by_username || 'System'}
                  </td>
                  <td className="text-tertiary">
                    {new Date(t.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </Table>
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <EmptyState
          title="No tickets found"
          description="We couldn't find any tickets matching your search or filters. Create a new support ticket to begin."
          icon={Ticket}
          actionText="Create Ticket"
          onActionClick={() => setCreateOpen(true)}
        />
      )}

      <CreateTicketModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={fetchTickets}
      />
    </div>
  );
}

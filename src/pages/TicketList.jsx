import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ticketApi } from '../services/ticketApi';
import SearchFilter from '../components/ui/SearchFilter';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Pagination from '../components/ui/Pagination';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import CreateTicketModal from '../components/CreateTicketModal';
import Button from '../components/ui/Button';
import { PlusCircle, Ticket, Calendar, User, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import './TicketList.css';

export default function TicketList() {
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
  const limit = 10;

  // Sync create param from Dashboard shortcuts
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setCreateOpen(true);
      // Clean up param
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('create');
      setSearchParams(newParams);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchTickets();
  }, [q, status, priority, page]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const offset = (page - 1) * limit;
      const params = {
        limit,
        offset,
        sort_by: 'created_at',
        order: 'desc'
      };

      if (q) params.search = q;
      if (status) params.status = status;
      if (priority) params.priority = priority;

      const data = await ticketApi.getTickets(params);
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
    const nextParams = new URLSearchParams();
    if (newFilters.q) nextParams.set('q', newFilters.q);
    if (newFilters.status) nextParams.set('status', newFilters.status);
    if (newFilters.priority) nextParams.set('priority', newFilters.priority);
    nextParams.set('page', '1'); // reset to page 1
    setSearchParams(nextParams);
  };

  const handleResetFilters = () => {
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', newPage.toString());
    setSearchParams(nextParams);
  };

  const totalPages = Math.ceil(total / limit);

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
                'Title',
                'Priority',
                'Status',
                'Team',
                'Assigned Agent',
                'Created By',
                'Created At'
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

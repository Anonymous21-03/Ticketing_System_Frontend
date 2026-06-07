import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ticketApi } from '../services/ticketApi';
import { commentApi } from '../services/commentApi';
import { teamApi } from '../services/teamApi';
import { userApi } from '../services/userApi';
import { attachmentApi } from '../services/attachmentApi';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import {
  Calendar, User, ShieldAlert, ArrowLeft, Trash2, Edit3, MessageSquare,
  History, Send, Trash, Edit, Check, X, ShieldCheck, Paperclip, Download, FileText, RefreshCw,
  AlertTriangle, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useWebSocket } from '../hooks/useWebSocket';
import './TicketDetail.css';

export default function TicketDetail() {
  const { id } = useParams();
  const ticketId = parseInt(id);
  const navigate = useNavigate();
  const { user, isAdmin, isAgent } = useAuth();

  useWebSocket(async (payload) => {
    if (payload.type === 'COMMENT_CREATED' && payload.data.ticket_id === ticketId) {
      if (payload.data.comment.user_id !== user.id) {
        fetchComments();
        fetchHistory();
        toast.success(`New comment from ${payload.data.comment.username}`);
      }
    } else if (payload.type === 'COMMENT_DELETED') {
      fetchComments();
      fetchHistory();
    } else if (payload.type === 'TICKET_UPDATED' && payload.data.id === ticketId) {
      try {
        const ticketData = await ticketApi.getTicket(ticketId);
        setTicket(ticketData);
        setEditTitle(ticketData.title);
        setEditDescription(ticketData.description);
        fetchHistory();
        toast.info("Ticket properties updated");
      } catch (err) {
        console.error(err);
      }
    }
  });

  // Data State
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [history, setHistory] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [agents, setAgents] = useState([]);

  // Load States
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState('comments'); // 'comments' | 'history' | 'attachments'

  // Edit Ticket Info
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  // Comment Form State
  const [newComment, setNewComment] = useState('');
  const [commentSubmitLoading, setCommentSubmitLoading] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [commentEditLoading, setCommentEditLoading] = useState(false);

  // Dialog States
  const [deleteTicketOpen, setDeleteTicketOpen] = useState(false);
  const [deleteTicketLoading, setDeleteTicketLoading] = useState(false);
  const [deleteCommentId, setDeleteCommentId] = useState(null);
  const [deleteCommentLoading, setDeleteCommentLoading] = useState(false);

  // Attachments State
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Reactivate Loading
  const [reactivateLoading, setReactivateLoading] = useState(false);

  useEffect(() => {
    loadTicketData();
  }, [id]);

  const loadTicketData = async () => {
    setLoading(true);
    try {
      const ticketData = await ticketApi.getTicket(ticketId);
      setTicket(ticketData);
      setEditTitle(ticketData.title);
      setEditDescription(ticketData.description);

      // Load comments & history & attachments in parallel
      fetchComments();
      fetchHistory();
      fetchAttachments();

      // If user is Admin, load all teams & user options globally
      if (isAdmin) {
        try {
          const [teamsData, usersData] = await Promise.all([
            teamApi.getTeams({ limit: 100 }),
            userApi.getUsers({ limit: 100 })
          ]);
          setTeams(teamsData.items || []);
          const staff = (usersData.items || []).filter(u => u.role === 'admin' || u.role === 'agent');
          setAgents(staff);
        } catch (assignErr) {
          console.error('Failed to load assignment options for Admin:', assignErr);
        }
      } 
      // If user is Agent, load only their own team and teammates
      else if (isAgent && user?.team_id) {
        try {
          const [myTeam, membersData] = await Promise.all([
            teamApi.getTeam(user.team_id),
            teamApi.getMembers(user.team_id, { limit: 100 })
          ]);
          setTeams([myTeam]);
          const staff = (membersData.items || []).filter(u => u.role === 'admin' || u.role === 'agent');
          setAgents(staff);
        } catch (assignErr) {
          console.error('Failed to load team assignment options for Agent:', assignErr);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load ticket details.');
      navigate('/tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    setCommentsLoading(true);
    try {
      const data = await commentApi.getComments(ticketId, { limit: 100 });
      setComments(data.items || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch comments.');
    } finally {
      setCommentsLoading(false);
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const data = await ticketApi.getHistory(ticketId, { limit: 100 });
      setHistory(data.items || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch history logs.');
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchAttachments = async () => {
    setAttachmentsLoading(true);
    try {
      const data = await attachmentApi.getAttachments(ticketId);
      setAttachments(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch attachments.');
    } finally {
      setAttachmentsLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be under 10MB');
      return;
    }

    setUploading(true);
    try {
      // 1. Get Presigned URL
      const presignData = await attachmentApi.presignUpload(ticketId, {
        filename: file.name,
        content_type: file.type
      });

      // 2. Upload file to S3 directly
      const uploadRes = await fetch(presignData.upload_url, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to upload file to storage provider');
      }

      // 3. Confirm upload
      await attachmentApi.confirmUpload(ticketId, presignData.attachment_id);
      toast.success('File attached successfully!');
      fetchAttachments();
      fetchHistory();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || err.message || 'Failed to upload attachment.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    if (!window.confirm('Are you sure you want to delete this attachment?')) return;
    try {
      await attachmentApi.deleteAttachment(ticketId, attachmentId);
      toast.success('Attachment deleted.');
      fetchAttachments();
      fetchHistory();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete attachment.');
    }
  };

  // Handle Ticket Field Changes (Status, Priority, Assignee, Team)
  const handleFieldChange = async (fieldName, value) => {
    const parsedValue = ['assigned_to', 'team_id'].includes(fieldName) && value !== ''
      ? parseInt(value)
      : (value === '' ? null : value);

    const prevTicket = { ...ticket };
    // Optimistic update
    setTicket(prev => ({
      ...prev,
      [fieldName]: parsedValue
    }));

    try {
      const updates = { [fieldName]: parsedValue };
      await ticketApi.updateTicket(ticketId, updates);
      toast.success('Ticket updated successfully!');
      // Reload stats & history logs
      fetchHistory();
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail;
      toast.error(typeof detail === 'string' ? detail : 'Permission denied or update failed.');
      // Revert
      setTicket(prevTicket);
    }
  };

  // Inline Ticket Title/Desc Edit
  const handleSaveInfo = async (e) => {
    e.preventDefault();
    if (!editTitle.trim() || !editDescription.trim()) {
      toast.error('Title and description cannot be empty.');
      return;
    }

    setSaveLoading(true);
    try {
      const updated = await ticketApi.updateTicket(ticketId, {
        title: editTitle,
        description: editDescription
      });
      setTicket(updated);
      setIsEditingInfo(false);
      toast.success('Description updated.');
      fetchHistory();
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail;
      toast.error(typeof detail === 'string' ? detail : 'Failed to update ticket content.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Delete Ticket
  const handleDeleteTicket = async () => {
    setDeleteTicketLoading(true);
    try {
      await ticketApi.deleteTicket(ticketId);
      toast.success('Ticket deleted successfully.');
      navigate('/tickets');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete ticket.');
    } finally {
      setDeleteTicketLoading(false);
      setDeleteTicketOpen(false);
    }
  };

  const handleReactivateTicket = async () => {
    if (!window.confirm('Are you sure you want to reactivate this ticket?')) return;
    setReactivateLoading(true);
    try {
      await ticketApi.reactivateTicket(ticketId);
      toast.success('Ticket reactivated successfully.');
      loadTicketData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to reactivate ticket.');
    } finally {
      setReactivateLoading(false);
    }
  };

  // Comment Handlers
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommentSubmitLoading(true);
    try {
      await commentApi.createComment(ticketId, { comment: newComment });
      setNewComment('');
      toast.success('Comment added!');
      fetchComments();
    } catch (err) {
      console.error(err);
      toast.error('Failed to add comment.');
    } finally {
      setCommentSubmitLoading(false);
    }
  };

  const handleEditCommentSave = async (commentId) => {
    if (!editingCommentText.trim()) return;
    setCommentEditLoading(true);
    try {
      await commentApi.updateComment(commentId, { comment: editingCommentText });
      toast.success('Comment updated!');
      setEditingCommentId(null);
      fetchComments();
    } catch (err) {
      console.error(err);
      toast.error('Failed to edit comment.');
    } finally {
      setCommentEditLoading(false);
    }
  };

  const handleDeleteComment = async () => {
    setDeleteCommentLoading(true);
    try {
      await commentApi.deleteComment(deleteCommentId);
      toast.success('Comment deleted.');
      setDeleteCommentId(null);
      fetchComments();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete comment.');
    } finally {
      setDeleteCommentLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Opening ticket file..." />;
  }

  const canModifyMeta = isAdmin || isAgent;
  const isCreator = ticket.created_by === user.id;
  const isOpenStatus = ticket.status === 'open';
  const canEditInfo = isAdmin || isAgent || (isCreator && isOpenStatus);

  // SLA helper
  const getSlaInfo = () => {
    if (ticket.sla_breached) return { label: 'SLA Breached', variant: 'breached' };
    const isActive = ticket.status === 'open' || ticket.status === 'in_progress';
    if (!isActive) return { label: 'Completed On Time', variant: 'on_track' };
    if (!ticket.due_at) return { label: '—', variant: 'on_track' };
    const now = new Date();
    const due = new Date(ticket.due_at);
    const diff = due - now;
    if (diff <= 0) return { label: 'SLA Breached', variant: 'breached' };
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      return { label: `${days}d ${hours % 24}h remaining`, variant: 'within_sla' };
    }
    if (hours > 0) return { label: `${hours}h ${minutes}m remaining`, variant: 'within_sla' };
    return { label: `${minutes}m remaining`, variant: 'within_sla' };
  };

  const slaInfo = getSlaInfo();

  // Filter agents by the ticket's current team
  const filteredAgents = ticket.team_id
    ? agents.filter(a => a.team_id === ticket.team_id)
    : agents;

  // Download attachment with fresh presigned URL
  const handleDownloadAttachment = async (attachmentId) => {
    try {
      const data = await attachmentApi.getDownloadUrl(ticketId, attachmentId);
      window.open(data.download_url, '_blank');
    } catch (err) {
      console.error(err);
      toast.error('Failed to get download link.');
    }
  };

  return (
    <div className="ticket-detail-container">
      {/* Back to list & delete options */}
      <div className="detail-navigation">
        <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={() => navigate('/tickets')}>
          Back to Queue
        </Button>

        <div className="navigation-actions">
          {ticket.is_active === false && isAdmin && (
            <Button variant="primary" size="sm" icon={RefreshCw} onClick={handleReactivateTicket} loading={reactivateLoading}>
              Reactivate Ticket
            </Button>
          )}
          {canEditInfo && !isEditingInfo && ticket.is_active && (
            <Button variant="secondary" size="sm" icon={Edit3} onClick={() => setIsEditingInfo(true)}>
              Edit Info
            </Button>
          )}
          {ticket.is_active && (
            <Button variant="danger" size="sm" icon={Trash2} onClick={() => setDeleteTicketOpen(true)}>
              Delete Ticket
            </Button>
          )}
        </div>
      </div>

      <div className="detail-grid">
        {/* Left Column: Core Ticket Details & Tabs */}
        <div className="detail-main-col">
          {isEditingInfo ? (
            <form onSubmit={handleSaveInfo} className="edit-info-form glass-card">
              <Input
                label="Ticket Title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
              />
              <Input
                label="Description"
                type="textarea"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={6}
                required
              />
              <div className="edit-actions">
                <Button variant="secondary" size="sm" onClick={() => setIsEditingInfo(false)} disabled={saveLoading}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" loading={saveLoading}>
                  Save Changes
                </Button>
              </div>
            </form>
          ) : (
            <div className="ticket-card glass-card">
              <div className="ticket-card-header">
                <span className="ticket-ref-id">Ticket #{ticket.id}</span>
                <h2 className="ticket-main-title">{ticket.title}</h2>
                <div className="ticket-card-subtitle">
                  <span>Created by <strong>{ticket.created_by_username || 'Employee'}</strong></span>
                  <span className="subtitle-divider">•</span>
                  <span>{new Date(ticket.created_at).toLocaleString()}</span>
                </div>
              </div>
              <div className="ticket-card-body">
                <p className="ticket-description-text">{ticket.description}</p>
              </div>
            </div>
          )}

          {/* Tab Selection */}
          <div className="tabs-container">
            <button
              className={`tab-btn ${activeTab === 'comments' ? 'active' : ''}`}
              onClick={() => setActiveTab('comments')}
            >
              <MessageSquare size={16} />
              <span>Comments ({comments.length})</span>
            </button>
            <button
              className={`tab-btn ${activeTab === 'attachments' ? 'active' : ''}`}
              onClick={() => setActiveTab('attachments')}
            >
              <Paperclip size={16} />
              <span>Attachments ({attachments.length})</span>
            </button>
            <button
              className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <History size={16} />
              <span>Audit History</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-pane-wrapper">
            {activeTab === 'comments' ? (
              <div className="comments-pane">
                {/* Comment Editor */}
                <form onSubmit={handleCommentSubmit} className="comment-post-box glass-card">
                  <textarea
                    placeholder="Type your comment, update notes, or answer..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    required
                  ></textarea>
                  <div className="comment-post-actions">
                    <Button variant="primary" size="sm" type="submit" loading={commentSubmitLoading} icon={Send}>
                      Comment
                    </Button>
                  </div>
                </form>

                {/* Comment thread */}
                {commentsLoading ? (
                  <LoadingSpinner message="Fetching notes..." />
                ) : comments.length > 0 ? (
                  <div className="comments-list">
                    {comments.map((c) => {
                      const isOwner = c.user_id === user.id;
                      const isCommentEditing = editingCommentId === c.id;

                      return (
                        <div key={c.id} className="comment-bubble glass-card">
                          <div className="comment-bubble-header">
                            <span className="comment-author">{c.username}</span>
                            <span className="comment-time">
                              {new Date(c.created_at).toLocaleString()}
                              {c.is_edited && <span className="edited-lbl"> (edited)</span>}
                            </span>
                            {!isCommentEditing && (isOwner || isAdmin) && (
                              <div className="comment-bubble-actions">
                                {isOwner && (
                                  <button
                                    onClick={() => {
                                      setEditingCommentId(c.id);
                                      setEditingCommentText(c.comment);
                                    }}
                                    title="Edit Comment"
                                  >
                                    <Edit size={14} />
                                  </button>
                                )}
                                <button onClick={() => setDeleteCommentId(c.id)} title="Delete Comment">
                                  <Trash size={14} className="text-danger" />
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="comment-bubble-body">
                            {isCommentEditing ? (
                              <div className="comment-editing-container">
                                <textarea
                                  value={editingCommentText}
                                  onChange={(e) => setEditingCommentText(e.target.value)}
                                  rows={2}
                                />
                                <div className="editing-actions">
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setEditingCommentId(null)}
                                    icon={X}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => handleEditCommentSave(c.id)}
                                    loading={commentEditLoading}
                                    icon={Check}
                                  >
                                    Save
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <p className="comment-text">{c.comment}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="empty-thread-state">
                    <p>No comments on this ticket yet.</p>
                  </div>
                )}
              </div>
            ) : activeTab === 'attachments' ? (
              /* Attachments Pane */
              <div className="attachments-pane">
                <div className="attachment-upload-box glass-card">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
                  />
                  <Button
                    variant="primary"
                    icon={Paperclip}
                    onClick={() => fileInputRef.current?.click()}
                    loading={uploading}
                  >
                    Upload File
                  </Button>
                  <span className="upload-help-text">Max 10MB. Images and PDFs allowed.</span>
                </div>

                {attachmentsLoading ? (
                  <LoadingSpinner message="Fetching attachments..." />
                ) : attachments.length > 0 ? (
                  <div className="attachments-list">
                    {attachments.map((file) => (
                      <div key={file.id} className="attachment-item glass-card">
                        <div className="attachment-icon">
                          {file.content_type.startsWith('image/') ? <Paperclip size={24} /> : <FileText size={24} />}
                        </div>
                        <div className="attachment-info">
                          <span className="attachment-name">{file.filename}</span>
                          <span className="attachment-meta">
                            {file.uploaded_by_username} • {new Date(file.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="attachment-actions">
                          <button onClick={() => handleDownloadAttachment(file.id)} className="btn-icon" title="Download">
                            <Download size={18} />
                          </button>
                          {(file.uploaded_by === user.id || isAdmin) && (
                            <button onClick={() => handleDeleteAttachment(file.id)} className="btn-icon text-danger">
                              <Trash size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-thread-state">
                    <p>No attachments uploaded yet.</p>
                  </div>
                )}
              </div>
            ) : (
              /* History Log */
              <div className="history-pane">
                {historyLoading ? (
                  <LoadingSpinner message="Fetching history logs..." />
                ) : history.length > 0 ? (
                  <div className="timeline">
                    {history.map((log) => (
                      <div key={log.id} className="timeline-item">
                        <div className="timeline-marker"></div>
                        <div className="timeline-content glass-card">
                          <div className="timeline-header">
                            <strong className="action-tag">{log.action}</strong>
                            <span className="timeline-author">by {log.username || 'System'}</span>
                            <span className="timeline-date">{new Date(log.created_at).toLocaleString()}</span>
                          </div>
                          {log.changes && Object.keys(log.changes).length > 0 && (
                            <div className="timeline-changes">
                              {Object.entries(log.changes).map(([field, change]) => (
                                <div key={field} className="change-row">
                                  <span className="field-name">{field}:</span>
                                  {Array.isArray(change) ? (
                                    <>
                                      <span className="old-val">{String(change[0] ?? 'none')}</span>
                                      <span className="arrow-change">→</span>
                                      <span className="new-val">{String(change[1] ?? 'none')}</span>
                                    </>
                                  ) : (
                                    <span className="new-val">{String(change)}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-thread-state">
                    <p>No audit events logged yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Metadata Pane */}
        <div className="detail-meta-col">
          <div className="meta-card glass-card">
            <h3 className="meta-card-title">Properties</h3>

            <div className="meta-property-list">
              {/* STATUS */}
              <div className="meta-property-row">
                <span className="property-label">Status</span>
                {canModifyMeta ? (
                  <select
                    className="meta-select-input"
                    value={ticket.status}
                    onChange={(e) => handleFieldChange('status', e.target.value)}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                ) : (
                  // Employees can transition open -> closed or resolved -> closed
                  (ticket.status === 'open' || ticket.status === 'resolved') ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleFieldChange('status', 'closed')}
                    >
                      Close Ticket
                    </Button>
                  ) : (
                    <Badge variant={ticket.status}>{ticket.status}</Badge>
                  )
                )}
              </div>

              {/* PRIORITY */}
              <div className="meta-property-row">
                <span className="property-label">Priority</span>
                {canModifyMeta ? (
                  <select
                    className="meta-select-input"
                    value={ticket.priority}
                    onChange={(e) => handleFieldChange('priority', e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                ) : (
                  <Badge variant={ticket.priority}>{ticket.priority}</Badge>
                )}
              </div>

              {/* SLA STATUS */}
              <div className="meta-property-row">
                <span className="property-label">SLA Status</span>
                <Badge variant={slaInfo.variant}>{slaInfo.label}</Badge>
              </div>

              {/* SLA DUE DATE */}
              {ticket.due_at && (
                <div className="meta-property-row">
                  <span className="property-label">SLA Deadline</span>
                  <span className="property-value" style={{ fontSize: '0.8rem' }}>
                    {new Date(ticket.due_at).toLocaleString()}
                  </span>
                </div>
              )}

              {/* TEAM ASSIGNMENT */}
              <div className="meta-property-row">
                <span className="property-label">Team</span>
                {canModifyMeta ? (
                  <select
                    className="meta-select-input"
                    value={ticket.team_id || ''}
                    onChange={(e) => handleFieldChange('team_id', e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="property-value truncate">{ticket.team_name || 'Unassigned'}</span>
                )}
              </div>

              {/* AGENT ASSIGNMENT */}
              <div className="meta-property-row">
                <span className="property-label">Assignee</span>
                {canModifyMeta ? (
                  <select
                    className="meta-select-input"
                    value={ticket.assigned_to || ''}
                    onChange={(e) => handleFieldChange('assigned_to', e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {filteredAgents.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.username}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="property-value truncate">{ticket.assigned_to_username || 'Unassigned'}</span>
                )}
              </div>
            </div>

            <div className="meta-footer">
              <div className="meta-timestamp">
                <Calendar size={14} />
                <span>Opened {new Date(ticket.created_at).toLocaleDateString()}</span>
              </div>
              <div className="meta-timestamp">
                <ShieldCheck size={14} />
                <span>Updated {new Date(ticket.updated_at || ticket.created_at).toLocaleDateString()}</span>
              </div>
              {ticket.resolved_at && (
                <div className="meta-timestamp text-success">
                  <Check size={14} />
                  <span>Resolved {new Date(ticket.resolved_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Ticket Confirmation */}
      <ConfirmDialog
        isOpen={deleteTicketOpen}
        onClose={() => setDeleteTicketOpen(false)}
        onConfirm={handleDeleteTicket}
        title="Delete Support Ticket"
        message="Are you sure you want to delete this ticket? This will soft-delete the ticket and restrict visibility."
        confirmText="Yes, Delete Ticket"
        loading={deleteTicketLoading}
      />

      {/* Delete Comment Confirmation */}
      <ConfirmDialog
        isOpen={deleteCommentId !== null}
        onClose={() => setDeleteCommentId(null)}
        onConfirm={handleDeleteComment}
        title="Delete Comment"
        message="Are you sure you want to remove your comment? This action is permanent."
        confirmText="Delete Comment"
        loading={deleteCommentLoading}
      />
    </div>
  );
}

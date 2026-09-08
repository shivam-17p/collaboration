import React, { useEffect, useState } from 'react';
import { MessageSquare, ThumbsUp, Plus, X, Send, Trash2, Pencil, Check } from 'lucide-react';
import axios from 'axios';

export default function Discussions() {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({ title: '', content: '', tags: '' });

  // For replies
  const [expandedId, setExpandedId] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  // Edit state for discussions
  const [editingDiscId, setEditingDiscId] = useState(null);
  const [editDiscForm, setEditDiscForm] = useState({ title: '', content: '', tags: '' });

  // Edit state for replies
  const [editingReply, setEditingReply] = useState(null); // { discId, replyId }
  const [editReplyContent, setEditReplyContent] = useState('');

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');

  useEffect(() => {
    fetchDiscussions();
  }, []);

  const fetchDiscussions = async () => {
    try {
      const { data } = await axios.get('/api/discussions');
      setDiscussions(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching discussions:', error);
      setLoading(false);
    }
  };

  const canModerate = (authorField) => {
    if (!userInfo || !authorField) return false;
    const authorId = authorField._id || authorField;
    return userInfo._id === authorId.toString() || userInfo.role === 'admin';
  };


  const handleLike = async (id) => {
    if (!userInfo) return alert("Please log in to like.");
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.post(`/api/discussions/${id}/like`, {}, config);
      setDiscussions(discussions.map(d => d._id === id ? { ...d, likes: data.likes, likedBy: data.likedBy } : d));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to like');
    }
  };

  const handleCreateDiscussion = async () => {
    if (!userInfo) return alert("Please log in to post.");
    if (!newDiscussion.title || !newDiscussion.content) return alert("Title and content are required.");

    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const payload = {
        title: newDiscussion.title,
        content: newDiscussion.content,
        tags: newDiscussion.tags.split(',').map(t => t.trim()).filter(t => t)
      };
      const { data } = await axios.post('/api/discussions', payload, config);
      setDiscussions([data, ...discussions]);
      setModalOpen(false);
      setNewDiscussion({ title: '', content: '', tags: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post');
    }
  };

  const handleReply = async (id) => {
    if (!userInfo) return alert("Please log in to reply.");
    if (!replyContent.trim()) return;

    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.post(`/api/discussions/${id}/reply`, { content: replyContent }, config);
      setDiscussions(discussions.map(d => d._id === id ? data : d));
      setReplyContent('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reply');
    }
  };

  const handleDeleteReply = async (discussionId, replyId) => {
    if (!window.confirm("Are you sure you want to delete this reply?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.delete(`/api/discussions/${discussionId}/reply/${replyId}`, config);
      setDiscussions(discussions.map(d => d._id === discussionId ? data : d));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete reply');
    }
  };

  const handleDeleteDiscussion = async (discussionId) => {
    if (!window.confirm("Are you sure you want to delete this discussion?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.delete(`/api/discussions/${discussionId}`, config);
      setDiscussions(discussions.filter(d => d._id !== discussionId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete discussion');
    }
  };

  // ── Edit discussion ──────────────────────────────────────────────
  const startEditDiscussion = (disc) => {
    setEditingDiscId(disc._id);
    setEditDiscForm({
      title: disc.title,
      content: disc.content,
      tags: disc.tags?.join(', ') || ''
    });
  };

  const cancelEditDiscussion = () => {
    setEditingDiscId(null);
    setEditDiscForm({ title: '', content: '', tags: '' });
  };

  const handleEditDiscussion = async (discId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const payload = {
        title: editDiscForm.title,
        content: editDiscForm.content,
        tags: editDiscForm.tags.split(',').map(t => t.trim()).filter(t => t)
      };
      const { data } = await axios.put(`/api/discussions/${discId}`, payload, config);
      setDiscussions(discussions.map(d => d._id === discId ? data : d));
      cancelEditDiscussion();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to edit discussion');
    }
  };

  // ── Edit reply ───────────────────────────────────────────────────
  const startEditReply = (discId, reply) => {
    setEditingReply({ discId, replyId: reply._id });
    setEditReplyContent(reply.content);
  };

  const cancelEditReply = () => {
    setEditingReply(null);
    setEditReplyContent('');
  };

  const handleEditReply = async () => {
    if (!editReplyContent.trim()) return;
    const { discId, replyId } = editingReply;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.put(`/api/discussions/${discId}/reply/${replyId}`, { content: editReplyContent }, config);
      setDiscussions(discussions.map(d => d._id === discId ? data : d));
      cancelEditReply();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to edit reply');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">Discussions</h1>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={18} /> Ask Question
        </button>
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="empty-icon"><MessageSquare size={32} /></div>
          <h3 className="empty-title">Loading Discussions...</h3>
        </div>
      ) : discussions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><MessageSquare size={32} /></div>
          <h3 className="empty-title">No Discussions Yet</h3>
          <p className="empty-desc">Be the first to ask a question!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {discussions.map(disc => (
            <div key={disc._id} style={{ padding: '20px', backgroundColor: 'var(--bg-surface)', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>


              {/* ── Discussion header / edit mode ── */}
              {editingDiscId === disc._id ? (
                <div style={{ marginBottom: '12px' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={editDiscForm.title}
                    onChange={e => setEditDiscForm({ ...editDiscForm, title: e.target.value })}
                    placeholder="Question title"
                    style={{ marginBottom: '8px' }}
                  />
                  <textarea
                    className="form-input"
                    rows="3"
                    value={editDiscForm.content}
                    onChange={e => setEditDiscForm({ ...editDiscForm, content: e.target.value })}
                    placeholder="Details"
                    style={{ marginBottom: '8px' }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    value={editDiscForm.tags}
                    onChange={e => setEditDiscForm({ ...editDiscForm, tags: e.target.value })}
                    placeholder="Tags (comma separated)"
                    style={{ marginBottom: '8px' }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-primary" onClick={() => handleEditDiscussion(disc._id)}>
                      <Check size={14} /> Save
                    </button>
                    <button className="btn-secondary" onClick={cancelEditDiscussion}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>{disc.title}</h3>
                    {/* Edit + Delete — author or admin */}
                    {canModerate(disc.author) && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => startEditDiscussion(disc)}
                          style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          title="Edit discussion"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteDiscussion(disc._id)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          title="Delete discussion"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    {disc.tags?.map(tag => (
                      <span key={tag} className="tag-chip">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {editingDiscId !== disc._id && (
                <p style={{ color: 'var(--text-light)', marginBottom: '16px', lineHeight: '1.5' }}>{disc.content}</p>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-light)', fontSize: '14px' }}>
                  <img src={disc.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${disc.author?.name}`} alt="avatar" style={{ width: 24, height: 24, borderRadius: '50%' }} />
                  {disc.author?.name}
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <button
                    onClick={() => handleLike(disc._id)}
                    style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', color: disc.likedBy?.includes(userInfo?._id) ? 'var(--primary)' : 'var(--text-light)', cursor: 'pointer', fontWeight: disc.likedBy?.includes(userInfo?._id) ? 'bold' : '500' }}>
                    <ThumbsUp size={16} /> {disc.likes}
                  </button>
                  <button
                    onClick={() => setExpandedId(expandedId === disc._id ? null : disc._id)}
                    style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-light)', cursor: 'pointer' }}>
                    <MessageSquare size={16} /> {disc.replies?.length || 0} Replies
                  </button>
                </div>
              </div>

              {/* ── Replies Section ── */}
              {expandedId === disc._id && (
                <div style={{ marginTop: '20px', backgroundColor: 'var(--bg-main)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>

                  {disc.replies?.length > 0 ? (
                    disc.replies.map((reply, idx) => (
                      <div key={reply._id || idx} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: idx !== disc.replies.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', fontSize: '12px', color: 'var(--text-light)', fontWeight: 'bold' }}>
                            <img src={reply.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.author?.name}`} alt="avatar" style={{ width: 20, height: 20, borderRadius: '50%' }} />
                            {reply.author?.name}
                          </div>
                          {/* Edit + Delete reply — author or admin */}
                          {canModerate(reply.author) && (
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                onClick={() => startEditReply(disc._id, reply)}
                                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
                                title="Edit reply"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteReply(disc._id, reply._id)}
                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                title="Delete reply"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Inline edit mode for reply */}
                        {editingReply?.replyId === reply._id ? (
                          <div style={{ marginLeft: '28px', display: 'flex', gap: '8px', marginTop: '4px' }}>
                            <input
                              type="text"
                              className="form-input"
                              value={editReplyContent}
                              onChange={e => setEditReplyContent(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') handleEditReply(); if (e.key === 'Escape') cancelEditReply(); }}
                              style={{ flex: 1, backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px' }}
                              autoFocus
                            />

                            <button className="btn-primary" onClick={handleEditReply} title="Save">
                              <Check size={14} />
                            </button>
                            <button className="btn-secondary" onClick={cancelEditReply} style={{ padding: '6px 10px' }}>
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <p style={{ fontSize: '14px', color: 'var(--text-dark)', marginLeft: '28px' }}>{reply.content}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '12px' }}>No replies yet. Be the first!</p>
                  )}

                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Write a reply..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      style={{ flex: 1, backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleReply(disc._id); }}
                    />

                    <button className="btn-primary" onClick={() => handleReply(disc._id)}>
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Discussion Modal */}
      {modalOpen && (
        <div className="modal-overlay open">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Ask a Question</h2>
              <button className="close-btn" onClick={() => setModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Question Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="What is your question?"
                  value={newDiscussion.title}
                  onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Details</label>
                <textarea
                  className="form-input"
                  rows="4"
                  placeholder="Provide more context..."
                  value={newDiscussion.content}
                  onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
                ></textarea>
              </div>
              <div className="form-group">
                <label className="form-label">Tags (comma separated)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. placements, guidance, dsa"
                  value={newDiscussion.tags}
                  onChange={(e) => setNewDiscussion({ ...newDiscussion, tags: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleCreateDiscussion}>Post Question</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

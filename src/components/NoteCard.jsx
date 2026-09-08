import React, { useState } from 'react';
import { User, Download, ThumbsUp, Trash2, Bookmark, BookmarkCheck, ExternalLink } from 'lucide-react';
import { SUBJECT_COLORS } from '../data/mockData';
import axios from 'axios';

export default function NoteCard({ note, currentUser, onDelete, showSave = false, isSaved = false, onSaveToggle, downloadDate }) {
  const [upvotes, setUpvotes] = useState(note.upvotes || 0);
  const [isLiked, setIsLiked] = useState(note.upvotedBy?.some(id => id.toString() === currentUser?._id?.toString()));

  const subjectKey = Object.keys(SUBJECT_COLORS).find(k => SUBJECT_COLORS[k].label === note.subject) || 'cs';
  const subjectConfig = SUBJECT_COLORS[subjectKey] || { bg: '#e0f2fe', text: '#0284c7', label: note.subject };

  const handleDownload = async () => {
    if (note.fileUrl && note.fileUrl !== '#') {
      window.open(note.fileUrl, '_blank');
    } else {
      alert(`Downloading ${note.title}...`);
    }
    if (currentUser?.token) {
      try {
        await axios.post(
          `/api/notes/${note._id}/download`,
          {},
          { headers: { Authorization: `Bearer ${currentUser.token}` } }
        );
      } catch (_) { /* silently ignore */ }
    }
  };

  const handleUpvote = async (e) => {
    e.stopPropagation();
    if (!currentUser?.token) return;

    // Optimistic update
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setUpvotes(prev => wasLiked ? prev - 1 : prev + 1);

    try {
      const config = { headers: { Authorization: `Bearer ${currentUser.token}` } };
      const { data } = await axios.post(`/api/notes/${note._id}/upvote`, {}, config);
      setUpvotes(data.upvotes);
      setIsLiked(data.isUpvoted);
    } catch (err) {
      // Revert on error
      setIsLiked(wasLiked);
      setUpvotes(prev => wasLiked ? prev + 1 : prev - 1);
    }
  };

  const handleSaveToggle = async (e) => {
    e.stopPropagation();
    if (!currentUser?.token) return;
    try {
      await axios.post(
        `/api/notes/${note._id}/save`,
        {},
        { headers: { Authorization: `Bearer ${currentUser.token}` } }
      );
      if (onSaveToggle) onSaveToggle(note._id);
    } catch (_) { /* silently ignore */ }
  };

  return (
    <div className="note-card">
      <div className="note-header">
        <span className="note-subject" style={{ backgroundColor: subjectConfig.bg, color: subjectConfig.text }}>
          {note.subject}
        </span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            onClick={handleUpvote}
            className={`note-rating ${isLiked ? 'active' : ''}`}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px',
              color: isLiked ? 'var(--primary)' : '#64748b',
              padding: '4px 8px',
              borderRadius: '6px',
              transition: 'all 0.2s'
            }}
          >
            <ThumbsUp size={14} fill={isLiked ? 'currentColor' : 'none'} /> {upvotes}
          </button>
          
          {showSave && currentUser && (
            <button
              onClick={handleSaveToggle}
              style={{ background: 'none', border: 'none', color: isSaved ? '#f59e0b' : '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              title={isSaved ? 'Unsave' : 'Save'}
            >
              {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            </button>
          )}
          
          {currentUser && note.uploadedBy && (
            currentUser._id?.toString() === (note.uploadedBy._id ?? note.uploadedBy)?.toString() ||
            currentUser.role === 'admin'
          ) && (
            <button
              onClick={() => onDelete(note._id)}
              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              title="Delete Note"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <h3 className="note-title">{note.title}</h3>

      <div className="note-meta">
        <User size={14} /> {note.uploadedBy ? note.uploadedBy.name : 'Unknown User'} &bull; {new Date(note.createdAt).toLocaleDateString()}
      </div>

      {downloadDate && (
        <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>
          Downloaded: {new Date(downloadDate).toLocaleDateString()}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {note.tags && note.tags.map(tag => (
          <span key={tag} className="tag-chip" style={{ fontSize: '11px', padding: '2px 8px' }}>
            {tag}
          </span>
        ))}
      </div>

      <div className="note-footer" style={{ display: 'flex', gap: '8px' }}>
        <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleDownload}>
          <Download size={16} /> Download
        </button>
        {note.fileUrl && note.fileUrl !== '#' && (
          <button
            onClick={() => window.open(note.fileUrl, '_blank')}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-primary)' }}
            title="Quick Open"
          >
            <ExternalLink size={15} />
          </button>

        )}
      </div>
    </div>
  );
}

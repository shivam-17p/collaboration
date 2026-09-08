import React, { useState, useEffect } from 'react';
import { Plus, X, UploadCloud, FileText, TrendingUp, Clock } from 'lucide-react';
import NoteCard from '../components/NoteCard';
import axios from 'axios';

export default function Notes({ searchQuery }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState(null);
  
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
  
  // Filters
  const [subjectFilter, setSubjectFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [activeTag, setActiveTag] = useState('All');

  // Form states
  const [newNote, setNewNote] = useState({ title: '', subject: '', tags: '' });
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, [subjectFilter, yearFilter, searchQuery]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const params = {};
      if (subjectFilter) params.subject = subjectFilter;
      if (yearFilter) params.semester = yearFilter; // Assuming semester maps to year in backend
      if (searchQuery) params.search = searchQuery;

      const { data } = await axios.get('/api/notes', { params });
      setNotes(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch notes');
      setLoading(false);
    }
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    
    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      await axios.delete(`/api/notes/${noteId}`, config);
      setNotes(notes.filter(note => note._id !== noteId));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete note');
    }
  };

  const handleUpload = async () => {
    if (!newNote.title || !newNote.subject || !file) {
      alert("Please fill in the title, subject, and select a file.");
      return;
    }
    
    // Check if user is logged in (using a simple check for token in localStorage)
    if (!userInfo || !userInfo.token) {
      alert("You must be logged in to upload a note. (Authentication needed)");
      return;
    }

    const formData = new FormData();
    formData.append('title', newNote.title);
    formData.append('description', 'Uploaded via UI');
    formData.append('subject', newNote.subject);
    formData.append('semester', 'Semester 1'); // Hardcoded or get from state
    formData.append('tags', JSON.stringify([newNote.tags || 'General']));
    formData.append('file', file);

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.post('/api/notes', formData, config);
      setNotes([data, ...notes]);
      setModalOpen(false);
      setNewNote({ title: '', subject: '', tags: '' });
      setFile(null);
      alert("Note uploaded successfully!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to upload note');
    }
  };

  // Filter notes (Client-side tag filtering for now since backend doesn't have tag filter yet)
  const filteredNotes = notes.filter(note => {
    if (activeTag === 'All') return true;
    return note.tags && note.tags.includes(activeTag);
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Study Notes</h1>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

      {/* Filters Bar */}
      <div className="filters-container">
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <select className="filter-select" value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
            <option value="">All Subjects</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Physics">Physics</option>
            <option value="DBMS">DBMS</option>
            <option value="DSA">DSA</option>
          </select>
          
          <select className="filter-select" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
            <option value="">All Semesters</option>
            <option value="Semester 1">Semester 1</option>
            <option value="Semester 2">Semester 2</option>
            <option value="Semester 3">Semester 3</option>
            <option value="Semester 4">Semester 4</option>
          </select>
        </div>
        
        <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-color)', margin: '0 8px' }}></div>
        
        <div className="tags-container">
          {['All', 'Exams', 'Cheat Sheets', 'Assignments', 'Lectures'].map(tag => (
            <span 
              key={tag}
              className={`tag-chip ${activeTag === tag ? 'active' : ''}`}
              onClick={() => setActiveTag(tag)}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Sections */}
      {loading ? (
        <div className="notes-grid">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="skeleton skeleton-card"></div>
          ))}
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <FileText size={32} />
          </div>
          <h3 className="empty-title">No notes found</h3>
          <p className="empty-desc">There are no notes matching your current filters. Be the first to upload one!</p>
          <button className="btn-primary" onClick={() => setModalOpen(true)}>
            <UploadCloud size={18} /> Upload Notes
          </button>
        </div>
      ) : (
        <>
          {!subjectFilter && !yearFilter && activeTag === 'All' && !searchQuery ? (
            <>
              <div className="section">
                <h2 className="section-title"><TrendingUp size={24} color="var(--primary)" /> Trending Notes</h2>
                <div className="notes-grid">
                  {filteredNotes.slice(0, 3).map(note => (
                    <NoteCard key={`trend-${note._id}`} note={note} currentUser={userInfo} onDelete={handleDelete} />
                  ))}
                </div>
              </div>
              
              <div className="section">
                <h2 className="section-title"><Clock size={24} color="var(--secondary)" /> Recently Uploaded</h2>
                <div className="notes-grid">
                  {filteredNotes.slice(3, 6).map(note => (
                    <NoteCard key={`recent-${note._id}`} note={note} currentUser={userInfo} onDelete={handleDelete} />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="section">
              <h2 className="section-title">Search Results ({filteredNotes.length})</h2>
              <div className="notes-grid">
                {filteredNotes.map(note => (
                  <NoteCard key={`filter-${note._id}`} note={note} currentUser={userInfo} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Floating Action Button */}
      <button className="fab" onClick={() => setModalOpen(true)} title="Upload Notes">
        <Plus size={28} />
      </button>

      {/* Upload Modal */}
      <div className={`modal-overlay ${modalOpen ? 'open' : ''}`}>
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title">Upload Notes</h2>
            <button className="close-btn" onClick={() => setModalOpen(false)}>
              <X size={24} />
            </button>
          </div>
          
          <div className="modal-body">
            <div className="form-group">
              <div className="upload-area">
                <input type="file" onChange={(e) => setFile(e.target.files[0])} style={{ marginBottom: '10px' }} />
                <UploadCloud size={48} className="upload-icon" />
                <div className="upload-text">{file ? file.name : "Select a file"}</div>
                <div className="upload-subtext">PDF, DOCX, or PNG (max. 50MB)</div>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Note Title</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Introduction to Data Structures" 
                value={newNote.title}
                onChange={(e) => setNewNote({...newNote, title: e.target.value})}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Subject</label>
                <select 
                  className="form-input" 
                  style={{ backgroundColor: 'white' }}
                  value={newNote.subject}
                  onChange={(e) => setNewNote({...newNote, subject: e.target.value})}
                >
                  <option value="">Select Subject</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="DBMS">DBMS</option>
                  <option value="DSA">DSA</option>
                </select>
              </div>
              
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Tags (comma separated)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. exams, notes"
                  value={newNote.tags}
                  onChange={(e) => setNewNote({...newNote, tags: e.target.value})}
                />
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleUpload}>
              Upload File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState, useRef } from 'react';
import { Calendar, MapPin, Clock, CheckCircle, Search, Plus, Trash2, X, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
  const isAdmin = userInfo?.role === 'admin';
  const fileInputRef = useRef(null);

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    image: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data } = await axios.get('/api/events');
      setEvents(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setImageLoading(true);
    try {
      const config = { 
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}` 
        } 
      };
      const { data } = await axios.post('/api/events/upload-image', formData, config);
      setNewEvent({ ...newEvent, image: data.url });
    } catch (err) {
      alert('Failed to upload image');
    } finally {
      setImageLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.image) return alert('Please upload an event image');
    
    setIsSubmitting(true);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post('/api/events', newEvent, config);
      setShowCreateModal(false);
      setNewEvent({ title: '', description: '', date: '', time: '', venue: '', image: '' });
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.delete(`/api/events/${id}`, config);
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete event');
    }
  };

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.venue.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Campus Events</h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Discover and register for upcoming activities</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Search events..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '10px 12px 10px 40px', borderRadius: '24px', border: '1px solid #e2e8f0', width: '250px', outline: 'none' }}
            />
          </div>
          {isAdmin && (
            <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
              <Plus size={18} /> Create Event
            </button>
          )}
        </div>
      </div>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px' }}>
          <Loader2 className="animate-spin" size={40} color="var(--primary)" />
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Calendar size={32} /></div>
          <h3 className="empty-title">No events found</h3>
          <p>Try searching for something else!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {filteredEvents.map(event => {
            const isGoing = userInfo && event.attendees?.some(id => id.toString() === userInfo._id.toString());
            
            return (
              <div key={event._id} className="note-card" style={{ padding: '0', overflow: 'hidden', position: 'relative' }}>
                {isAdmin && (
                  <button 
                    onClick={(e) => handleDeleteEvent(e, event._id)}
                    style={{ position: 'absolute', top: '12px', right: '12px', padding: '8px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.9)', color: '#ef4444', border: 'none', cursor: 'pointer', zIndex: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                    title="Delete Event"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                <img src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'} alt={event.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                <div style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>{event.title}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={16} color="var(--primary)" /> {new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={16} color="var(--primary)" /> {event.time}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={16} color="var(--primary)" /> {event.venue}
                    </div>
                  </div>
                  
                  {isGoing ? (
                    <button 
                      disabled
                      className="btn-primary" 
                      style={{ width: '100%', justifyContent: 'center', background: '#10b981', cursor: 'default', border: 'none' }}
                    >
                      <CheckCircle size={18} /> You're Going!
                    </button>
                  ) : (
                    <button 
                      onClick={() => navigate(`/events/${event._id}/register`)}
                      className="btn-primary" 
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      Register Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="modal-overlay open" style={{ zIndex: 1000 }}>
          <div className="modal-content" style={{ maxWidth: '500px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header">
              <h2 className="modal-title">Create New Event</h2>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', flex: 1, padding: '24px' }}>
                
                {/* Image Upload Section */}

                <div 
                  onClick={() => fileInputRef.current.click()}
                  style={{ 
                    width: '100%', 
                    minHeight: '180px', 
                    borderRadius: '12px', 
                    border: '2px dashed #cbd5e1', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    cursor: 'pointer',
                    overflow: 'hidden',
                    position: 'relative',
                    backgroundColor: '#f8fafc',
                    marginBottom: '8px'
                  }}
                >
                  {newEvent.image ? (
                    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                      <img src={newEvent.image} alt="Preview" style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }} />
                      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} className="hover-overlay">
                         <span style={{ color: 'white', fontWeight: 'bold' }}>Change Banner</span>
                      </div>
                      <style>{`.hover-overlay:hover { opacity: 1; }`}</style>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      {imageLoading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                          <Loader2 className="animate-spin" size={32} color="var(--primary)" />
                          <span style={{ fontSize: '13px', color: '#64748b' }}>Uploading...</span>
                        </div>
                      ) : (
                        <>
                          <div style={{ backgroundColor: '#EEF2FF', padding: '12px', borderRadius: '50%', marginBottom: '12px', display: 'inline-flex' }}>
                            <Upload size={24} color="var(--primary)" />
                          </div>
                          <p style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', margin: '0 0 4px' }}>Click to upload event banner</p>
                          <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>PNG, JPG or JPEG (Max 5MB)</p>
                        </>
                      )}
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    style={{ position: 'absolute', opacity: 0, inset: 0, cursor: 'pointer' }} 
                    accept="image/*" 
                  />
                </div>


                <div className="form-group">
                  <label className="form-label">Event Title</label>
                  <input type="text" className="form-input" required value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} placeholder="e.g. Annual Tech Symposium" />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input" rows="3" required value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} placeholder="Brief details about the event..." style={{ resize: 'none' }}></textarea>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Date</label>
                    <input type="date" className="form-input" required value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Time</label>
                    <input type="text" className="form-input" required value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} placeholder="e.g. 10:00 AM" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Venue</label>
                  <input type="text" className="form-input" required value={newEvent.venue} onChange={e => setNewEvent({...newEvent, venue: e.target.value})} placeholder="e.g. Main Auditorium" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting || imageLoading}>
                  {isSubmitting ? 'Creating...' : 'Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

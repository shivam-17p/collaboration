import React, { useState, useEffect, useRef, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import {
  User, Book, GraduationCap, Award, Star, Users, BrainCircuit,
  Edit2, Check, X, Upload as UploadIcon, Download, Bookmark, History, FileText,
  Calendar, Ticket, Clock, MapPin, QrCode, AlertCircle, Camera, School, Loader2, Crop
} from 'lucide-react';
import axios from 'axios';
import NoteCard from '../components/NoteCard';
import EventCardProfile from '../components/EventCardProfile';
import getCroppedImg from '../utils/cropImage';

// ─── Tab definitions ─────────────────────────────────────────────
const TABS = [
  { id: 'profile',   label: 'Academic Profile',   icon: GraduationCap },
  { id: 'notes',     label: 'Notes Activity',     icon: FileText },
  { id: 'upcoming',  label: 'Upcoming Events',    icon: Calendar },
  { id: 'past',      label: 'Past Events',        icon: History },
];

const NOTE_SUB_TABS = [
  { id: 'uploaded',  label: 'Uploaded',            icon: UploadIcon },
  { id: 'downloaded',label: 'Downloaded',          icon: Download },
  { id: 'saved',     label: 'Saved',               icon: Bookmark },
  { id: 'history',   label: 'Download History',    icon: History },
];

// ─── Mini stat card ───────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px 24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      flex: '1 1 180px'
    }}>
      <div style={{ padding: '12px', backgroundColor: color + '18', borderRadius: '10px', color }}>
        <Icon size={22} />
      </div>
      <div>
        <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#0f172a', lineHeight: 1 }}>{value}</p>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>{label}</p>
      </div>
    </div>
  );
}

export default function Profile() {
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [activeNoteTab, setActiveNoteTab] = useState('uploaded');
  
  // Avatar & Cropping
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);

  // Activity state
  const [activity, setActivity]   = useState({ uploaded: [], downloaded: [], saved: [], downloadHistory: [] });
  const [events, setEvents]       = useState({ upcoming: [], past: [] });
  const [activityLoading, setActivityLoading] = useState(false);
  const [savedSet, setSavedSet]   = useState(new Set()); 
  
  // Ticket Modal State
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [formData, setFormData] = useState({});
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const fileInputRef = useRef(null);

  // ── Fetch profile ────────────────────────────────────────────────
  useEffect(() => {
    if (!userInfo) return;
    const fetchProfile = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get('/api/auth/profile', config);
        setProfile(data);
        setFormData({
          name:       data.name || '',
          avatar:     data.avatar || '',
          department: data.department || '',
          college:    data.college || '',
          semester:   data.semester   || '',
          cgpa:       data.cgpa       || '',
          skills:              data.skills?.join(', ')              || '',
          clubsJoined:         data.clubsJoined?.join(', ')         || '',
          certifications:      data.certifications?.join(', ')      || '',
          areasOfInterest:     data.areasOfInterest?.join(', ')     || '',
          preferredStudyTopics: data.preferredStudyTopics?.join(', ') || ''
        });
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // ── Fetch activity ─────────────────────────────────────────
  useEffect(() => {
    if (!userInfo) return;
    const fetchData = async () => {
      setActivityLoading(true);
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        
        // Fetch Notes Activity
        const notesRes = await axios.get('/api/notes/activity', config);
        setActivity(notesRes.data);
        setSavedSet(new Set((notesRes.data.saved || []).map(n => n._id)));

        // Fetch Event Registrations
        const eventsRes = await axios.get('/api/events/user-registrations', config);
        setEvents(eventsRes.data);
      } catch (err) {
        console.error('Failed to fetch activity', err);
      } finally {
        setActivityLoading(false);
      }
    };
    fetchData();
  }, [activeTab, activeNoteTab]);

  const handleSaveToggle = (noteId) => {
    setSavedSet(prev => {
      const next = new Set(prev);
      if (next.has(noteId)) next.delete(noteId);
      else next.add(noteId);
      return next;
    });
  };

  const handleAvatarClick = () => {
    if (editing) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageToCrop(reader.result);
        setShowCropModal(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const onCropConfirm = async (croppedBlob) => {
    setShowCropModal(false);
    setAvatarLoading(true);
    
    const uploadFormData = new FormData();
    uploadFormData.append('avatar', croppedBlob, 'avatar.jpg');

    try {
      const config = { 
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}` 
        } 
      };
      const { data } = await axios.post('/api/auth/avatar', uploadFormData, config);
      setFormData({ ...formData, avatar: data.url });
    } catch (err) {
      alert('Failed to upload image');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleCancelEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to cancel your registration?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.delete(`/api/events/${eventId}/rsvp`, config);
      const res = await axios.get('/api/events/user-registrations', config);
      setEvents(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel registration');
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.delete(`/api/notes/${noteId}`, config);
      const res = await axios.get('/api/notes/activity', config);
      setActivity(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete note');
    }
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const updatedData = {
        name:                 formData.name,
        avatar:               formData.avatar,
        department:           formData.department,
        college:              formData.college,
        semester:             formData.semester,
        cgpa:                 parseFloat(formData.cgpa) || 0,
        skills:               formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        clubsJoined:          formData.clubsJoined.split(',').map(s => s.trim()).filter(Boolean),
        certifications:       formData.certifications.split(',').map(s => s.trim()).filter(Boolean),
        areasOfInterest:      formData.areasOfInterest.split(',').map(s => s.trim()).filter(Boolean),
        preferredStudyTopics: formData.preferredStudyTopics.split(',').map(s => s.trim()).filter(Boolean),
      };
      const { data } = await axios.put('/api/auth/profile', updatedData, config);
      setProfile(data);
      setEditing(false);
      const currentStorage = JSON.parse(localStorage.getItem('userInfo'));
      localStorage.setItem('userInfo', JSON.stringify({ ...currentStorage, ...data }));
    } catch (err) {
      alert(`Failed to update profile: ${err.response?.data?.message || err.message}`);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Profile...</div>;
  if (!profile) return <div style={{ padding: '40px', textAlign: 'center' }}>Error loading profile</div>;

  const stats = [
    { label: 'Upcoming Events',   value: events.upcoming.length,         icon: Calendar, color: '#10b981' },
    { label: 'Notes Uploaded',    value: activity.uploaded.length,       icon: UploadIcon,   color: '#6366f1' },
    { label: 'Saved Items',       value: activity.saved.length,           icon: Bookmark, color: '#f59e0b' },
  ];

  return (
    <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* ── Header ── */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '32px',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
        marginBottom: '24px',
        position: 'relative'
      }}>
        <div style={{ position: 'relative', cursor: editing ? 'pointer' : 'default' }} onClick={handleAvatarClick}>
          <div style={{ position: 'relative' }}>
            <img
              src={editing ? formData.avatar : profile.avatar}
              alt="avatar"
              style={{ width: '100px', height: '100px', borderRadius: '50%', border: '3px solid #eff6ff', objectFit: 'cover', opacity: avatarLoading ? 0.5 : 1 }}
            />
            {avatarLoading && (
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <Loader2 className="animate-spin" size={24} color="var(--primary)" />
              </div>
            )}
          </div>
          {editing && !avatarLoading && (
            <div style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: 'var(--primary)', color: 'white', padding: '6px', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
               <Camera size={16} />
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
            accept="image/*"
          />
        </div>
        
        <div style={{ flex: 1 }}>
          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange} 
                placeholder="Full Name" 
                style={{ ...inputStyle, fontSize: '24px', fontWeight: 'bold', padding: '4px 8px', border: '1px solid var(--primary)' }} 
              />
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Click on image to upload & crop your avatar</p>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: '26px', fontWeight: 'bold', margin: '0 0 6px', color: '#0f172a' }}>{profile.name}</h2>
              <p style={{ margin: 0, color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <GraduationCap size={16} />
                {profile.role === 'admin' ? 'Administrator' : 'Student'} · {profile.email}
              </p>
            </>
          )}
        </div>

        {activeTab === 'profile' && (
          !editing ? (
            <button onClick={() => setEditing(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Edit2 size={16} /> Edit Profile
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setEditing(false)} className="btn-secondary"><X size={16} /> Cancel</button>
              <button onClick={handleSave} className="btn-primary" style={{ background: '#10b981' }}><Check size={16} /> Save</button>
            </div>
          )
        )}
      </div>

      {/* ── Stats ── */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--border-color)', marginBottom: '24px', overflowX: 'auto' }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            style={{
              padding: '12px 20px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeTab === id ? '700' : '500',
              color: activeTab === id ? 'var(--primary)' : '#64748b',
              borderBottom: activeTab === id ? '3px solid var(--primary)' : '3px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div style={{ minHeight: '400px' }}>
        {activeTab === 'profile' && (
          <AcademicProfile editing={editing} formData={formData} handleInputChange={handleInputChange} profile={profile} />
        )}

        {activeTab === 'notes' && (
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              {NOTE_SUB_TABS.map(t => (
                <button 
                  key={t.id} 
                  onClick={() => setActiveNoteTab(t.id)}
                  style={{ 
                    padding: '6px 14px', 
                    borderRadius: '20px', 
                    border: '1px solid ' + (activeNoteTab === t.id ? 'var(--primary)' : '#e2e8f0'),
                    background: activeNoteTab === t.id ? 'var(--primary)' : 'white',
                    color: activeNoteTab === t.id ? 'white' : '#64748b',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <t.icon size={14} /> {t.label}
                </button>
              ))}
            </div>
            <NotesGrid 
              loading={activityLoading} 
              notes={activity[activeNoteTab]} 
              userInfo={userInfo} 
              onDelete={handleDeleteNote} 
              savedSet={savedSet} 
              handleSaveToggle={handleSaveToggle} 
              showDate={activeNoteTab === 'history'}
            />
          </div>
        )}

        {activeTab === 'upcoming' && (
          <EventsGrid 
            loading={activityLoading} 
            events={events.upcoming} 
            onCancel={handleCancelEvent} 
            onViewTicket={setSelectedTicket}
            emptyLabel="No upcoming events registered"
          />
        )}

        {activeTab === 'past' && (
          <EventsGrid 
            loading={activityLoading} 
            events={events.past} 
            onViewTicket={setSelectedTicket}
            emptyLabel="No past events attended"
          />
        )}
      </div>

      {/* ── Modals ── */}
      {selectedTicket && (
        <TicketModal registration={selectedTicket} onClose={() => setSelectedTicket(null)} />
      )}
      {showCropModal && (
        <CropModal image={imageToCrop} onConfirm={onCropConfirm} onCancel={() => setShowCropModal(false)} />
      )}
    </div>
  );
}

// ─── Sub-Components ───────────────────────────────────────────────

function CropModal({ image, onConfirm, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    try {
      const croppedBlob = await getCroppedImg(image, croppedAreaPixels);
      onConfirm(croppedBlob);
    } catch (e) {
      console.error(e);
      alert('Failed to crop image');
    }
  };

  return (
    <div className="modal-overlay open" style={{ zIndex: 1100 }}>
      <div className="modal-content" style={{ maxWidth: '500px', padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Adjust Profile Picture</h3>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <div style={{ position: 'relative', width: '100%', height: '350px', background: '#333' }}>
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>
        <div style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#64748b' }}>Zoom</p>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(e.target.value)}
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-secondary" onClick={onCancel} style={{ flex: 1 }}>Cancel</button>
            <button className="btn-primary" onClick={handleConfirm} style={{ flex: 2, justifyContent: 'center' }}>
              <Check size={18} /> Apply Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AcademicProfile({ editing, formData, handleInputChange, profile }) {
  return (
    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {[
          { label: 'Department', name: 'department', type: 'text', icon: GraduationCap },
          { label: 'College',    name: 'college',    type: 'text', icon: School },
          { label: 'Semester',   name: 'semester',   type: 'text', icon: Book },
          { label: 'CGPA',       name: 'cgpa',       type: 'number', icon: Award },
        ].map(({ label, name, type, icon: Icon }) => (
          <div key={name}>
            <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Icon size={12} /> {label}
            </p>
            {editing
              ? <input type={type} name={name} value={formData[name]} onChange={handleInputChange} style={inputStyle} step={name === 'cgpa' ? '0.01' : undefined} />
              : <p style={{ margin: 0, fontSize: '15px', color: '#1e293b', fontWeight: '600' }}>{profile[name] || 'Not specified'}</p>
            }
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <TagField label="Skills" name="skills" editing={editing} formData={formData} onChange={handleInputChange} tags={profile.skills} bg="#f1f5f9" color="#334155" />
        <TagField label="Areas of Interest" name="areasOfInterest" editing={editing} formData={formData} onChange={handleInputChange} tags={profile.areasOfInterest} bg="#fdf4ff" color="#c026d3" />
      </div>
    </div>
  );
}

function NotesGrid({ loading, notes, userInfo, onDelete, savedSet, handleSaveToggle, showDate }) {
  if (loading) return <div className="skeleton-grid"></div>;
  if (!notes?.length) return <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No notes found</div>;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
      {notes.map(note => (
        <NoteCard 
          key={note._id} 
          note={note} 
          currentUser={userInfo} 
          onDelete={onDelete} 
          showSave 
          isSaved={savedSet.has(note._id)} 
          onSaveToggle={handleSaveToggle} 
          downloadDate={showDate ? note.downloadedAt : undefined} 
        />
      ))}
    </div>
  );
}

function EventsGrid({ loading, events, onCancel, onViewTicket, emptyLabel }) {
  if (loading) return <div className="skeleton-grid"></div>;
  if (!events?.length) return <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>{emptyLabel}</div>;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
      {events.map(reg => (
        <EventCardProfile key={reg._id} registration={reg} onCancel={onCancel} onViewTicket={onViewTicket} />
      ))}
    </div>
  );
}

function TicketModal({ registration, onClose }) {
  const { event, registrationId } = registration;
  return (
    <div className="modal-overlay open" onClick={onClose} style={{ zIndex: 1000 }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', padding: 0, overflow: 'hidden' }}>
        <div style={{ background: 'var(--primary)', color: 'white', padding: '24px', textAlign: 'center' }}>
          <Ticket size={40} style={{ marginBottom: '12px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Event Ticket</h2>
          <p style={{ opacity: 0.9, fontSize: '14px' }}>Registration ID: {registrationId}</p>
        </div>
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <img src={event.image} style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover' }} />
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>{event.title}</h3>
              <p style={{ fontSize: '13px', color: '#64748b' }}>{event.venue}</p>
            </div>
          </div>
          <div style={{ borderTop: '2px dashed #e2e8f0', margin: '0 -24px 24px', position: 'relative' }}>
             <div style={{ position: 'absolute', top: '-10px', left: '-10px', width: '20px', height: '20px', background: 'white', borderRadius: '50%' }}></div>
             <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '20px', height: '20px', background: 'white', borderRadius: '50%' }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <p style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Date</p>
              <p style={{ fontSize: '14px', fontWeight: '600' }}>{new Date(event.date).toLocaleDateString()}</p>
            </div>
            <div>
              <p style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Time</p>
              <p style={{ fontSize: '14px', fontWeight: '600' }}>{event.time}</p>
            </div>
            <div>
              <p style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Status</p>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#10b981' }}>Confirmed</p>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
            <QrCode size={120} color="#1e293b" />
          </div>
        </div>
        <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
          <button className="btn-secondary" onClick={onClose} style={{ width: '100%' }}>Close</button>
        </div>
      </div>
    </div>
  );
}

function TagField({ label, name, editing, formData, onChange, tags, bg, color }) {
  return (
    <div>
      <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>{label}</p>
      {editing
        ? <input type="text" name={name} value={formData[name]} onChange={onChange} style={inputStyle} placeholder="Comma separated..." />
        : <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {tags?.length
              ? tags.map((t,i) => <span key={i} style={{ padding: '5px 14px', backgroundColor: bg, color, borderRadius: '20px', fontSize: '13px', fontWeight: '500' }}>{t}</span>)
              : <span style={{ color: '#94a3b8', fontSize: '13px' }}>None added</span>
            }
          </div>
      }
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  backgroundColor: '#f8fafc',
  fontSize: '14px',
  boxSizing: 'border-box'
};

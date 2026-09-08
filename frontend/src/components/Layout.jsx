import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  MessageSquare, 
  Calendar, 
  HelpCircle, 
  User,
  Search,
  Bell,
  Menu,
  X,
  LogOut,
  Clock,
  Info,
  CheckCircle2,
  AlertCircle,
  Upload as UploadIcon,
  Download,
  ShieldCheck,
  Sun,
  Moon
} from 'lucide-react';
import axios from 'axios';
import { mediaUrl } from '../utils/api';
import '../index.css';

export default function Layout({ children, onSearch, userInfo, setUserInfo }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const notifRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    setUserInfo(null);
    navigate('/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifRef]);

  // Fetch user-specific activity for notifications
  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const [notesRes, eventsRes] = await Promise.all([
          axios.get('/api/notes/activity', config),
          axios.get('/api/events/user-registrations', config)
        ]);

        const newNotifs = [];

        // 1. My Uploads
        notesRes.data.uploaded.slice(0, 2).forEach(note => {
          newNotifs.push({
            id: `upload-${note._id}`,
            title: 'Note Uploaded',
            message: `You successfully uploaded "${note.title}".`,
            time: new Date(note.createdAt).toLocaleDateString(),
            type: 'upload',
            icon: UploadIcon,
            color: '#6366f1'
          });
        });

        // 2. My Registrations
        eventsRes.data.upcoming.slice(0, 2).forEach(reg => {
          newNotifs.push({
            id: `reg-${reg._id}`,
            title: 'Event Registered',
            message: `You're attending "${reg.event.title}". ID: ${reg.registrationId}`,
            time: 'Upcoming',
            type: 'event',
            icon: Calendar,
            color: '#10b981'
          });
        });

        // 3. My Downloads
        notesRes.data.downloadHistory.slice(0, 2).forEach(note => {
          newNotifs.push({
            id: `down-${note._id}-${note.downloadedAt}`,
            title: 'Note Downloaded',
            message: `You downloaded "${note.title}".`,
            time: new Date(note.downloadedAt).toLocaleDateString(),
            type: 'download',
            icon: Download,
            color: '#f59e0b'
          });
        });

        // Sort by time (most recent first) - though currently we are just slicing
        setNotifications(newNotifs);
      } catch (err) {
        console.error("Failed to fetch notification data", err);
      }
    };
    if (userInfo?.token) fetchNotifs();
  }, [userInfo, location.pathname]); // Re-fetch on navigation to see new activity

  const handleMarkAllRead = () => {
    setNotifications([]);
    setNotifOpen(false);
  };

  const handleViewAll = () => {
    setNotifOpen(false);
    navigate('/profile');
  };



  return (
    <div className="app-container">
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="modal-overlay open" 
          style={{ zIndex: 95 }}
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <BookOpen className="logo-icon" size={18} />
          </div>
          <span className="sidebar-title">CampusConnect</span>
          <button className="hamburger-btn" onClick={closeSidebar} style={{ marginLeft: 'auto', display: sidebarOpen ? 'block' : 'none' }}>
            <X size={20} />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive && location.pathname === '/' ? 'active' : ''}`} end onClick={closeSidebar}>
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
          <NavLink to="/notes" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <BookOpen size={20} /> Notes
          </NavLink>
          <NavLink to="/discussions" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <MessageSquare size={20} /> Discussions
          </NavLink>
          <NavLink to="/events" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <Calendar size={20} /> Events
          </NavLink>
          <NavLink to="/lost-found" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <HelpCircle size={20} /> Lost & Found
          </NavLink>
          <div style={{ flex: 1 }}></div>
          <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <User size={20} /> Profile
          </NavLink>
          {userInfo?.role === 'admin' && (
            <NavLink to="/admin-auth" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
              <ShieldCheck size={20} /> Admin Panel
            </NavLink>
          )}
          <button className="nav-item" onClick={handleLogout} style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', color: '#ef4444' }}>
            <LogOut size={20} /> Logout
          </button>

        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Navbar */}
        <header className="navbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              onClick={toggleTheme}
              style={{ padding: '8px', borderRadius: '50%', background: 'var(--bg-main)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-primary)' }}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button className="hamburger-btn" onClick={toggleSidebar}>
              <Menu size={24} />
            </button>
            <div className="search-bar">
              <Search size={18} color="var(--text-muted)" />
              <input 
                type="text" 
                placeholder="Search notes, subjects, or users..." 
                onChange={(e) => {
                  if(location.pathname !== '/notes') {
                    navigate('/notes');
                  }
                  if(onSearch) onSearch(e.target.value);
                }}
              />
            </div>
          </div>
          
          <div className="nav-actions">
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button className="notification-btn" onClick={() => setNotifOpen(!notifOpen)}>
                <Bell size={20} />
                {notifications.length > 0 && <span className="notification-badge">{notifications.length}</span>}
              </button>

              {notifOpen && (
                <div style={dropdownStyle}>
                  <div style={{ padding: '16px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold' }}>Notifications</h3>
                    <span 
                      onClick={handleMarkAllRead}
                      style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      Mark all read
                    </span>
                  </div>
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>

                    {notifications.length === 0 ? (
                      <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                        <Bell size={32} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
                        <p style={{ margin: 0, fontSize: '13px' }}>All caught up!</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="notification-item" style={notifItemStyle}>
                          <div style={{ padding: '10px', backgroundColor: n.color + '15', borderRadius: '10px', color: n.color }}>
                            <n.icon size={18} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: 'bold', color: '#1e293b' }}>{n.title}</p>
                            <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>{n.message}</p>
                            <span style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={10} /> {n.time}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div style={{ padding: '12px', textAlign: 'center', borderTop: '1px solid #f1f5f9' }}>
                    <button 
                      onClick={handleViewAll}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      View All Activity
                    </button>
                  </div>
                </div>
              )}

            </div>
            
            <div className="user-profile" onClick={() => navigate('/profile')}>
              <img src={mediaUrl(userInfo?.avatar) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userInfo?.name || 'User'}`} alt="User Avatar" className="avatar" />
              <div className="user-info">
                <span className="user-name">{userInfo?.name || 'Student'}</span>
                <span className="user-role">{userInfo?.department || 'Student'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        {children}
      </main>
    </div>
  );
}

const dropdownStyle = {
  position: 'absolute',
  top: '100%',
  right: '0',
  marginTop: '12px',
  width: '320px',
  backgroundColor: 'white',
  borderRadius: '12px',
  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
  zIndex: 1000,
  border: '1px solid #f1f5f9',
  overflow: 'hidden',
  animation: 'slideDown 0.2s ease-out'
};

const notifItemStyle = {
  padding: '16px',
  display: 'flex',
  gap: '14px',
  borderBottom: '1px solid #f8fafc',
  cursor: 'pointer',
  transition: 'background 0.2s'
};


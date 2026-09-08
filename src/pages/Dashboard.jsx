import React, { useEffect, useState } from 'react';
import { LayoutDashboard, FileText, MessageSquare, Calendar } from 'lucide-react';
import axios from 'axios';

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        if (!userInfo.token) return;

        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get('/api/dashboard/stats', config);
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>
      
      {stats ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
          <div className="stat-card" style={{ padding: '20px', backgroundColor: 'var(--bg-surface)', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--border-color)' }}>

            <div style={{ padding: '12px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', borderRadius: '50%' }}>
              <FileText size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Total Notes</h3>
              <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>{stats.totalNotes}</p>
            </div>
          </div>

          <div className="stat-card" style={{ padding: '20px', backgroundColor: 'var(--bg-surface)', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--border-color)' }}>

            <div style={{ padding: '12px', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: '50%' }}>
              <MessageSquare size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Active Discussions</h3>
              <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>{stats.activeDiscussions}</p>
            </div>
          </div>

          <div className="stat-card" style={{ padding: '20px', backgroundColor: 'var(--bg-surface)', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--border-color)' }}>

            <div style={{ padding: '12px', backgroundColor: 'rgba(234, 179, 8, 0.1)', color: '#eab308', borderRadius: '50%' }}>
              <Calendar size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Upcoming Events</h3>
              <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>{stats.upcomingEvents}</p>
            </div>
          </div>

        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">
            <LayoutDashboard size={32} />
          </div>
          <h3 className="empty-title">Loading Dashboard...</h3>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { Calendar, MapPin, Clock, Ticket, XCircle, ExternalLink, QrCode } from 'lucide-react';

export default function EventCardProfile({ registration, onCancel, onViewTicket }) {
  const { event, registrationId, status } = registration;
  const isPast = new Date(event.date) < new Date();

  return (
    <div className="note-card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'relative' }}>
        <img 
          src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'} 
          alt={event.title} 
          style={{ width: '100%', height: '140px', objectFit: 'cover', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }} 
        />
        <div style={{ 
          position: 'absolute', 
          top: '10px', 
          right: '10px', 
          backgroundColor: isPast ? '#94a3b8' : '#10b981', 
          color: 'white', 
          padding: '4px 10px', 
          borderRadius: '20px', 
          fontSize: '11px', 
          fontWeight: 'bold',
          textTransform: 'uppercase'
        }}>
          {isPast ? 'Completed' : 'Upcoming'}
        </div>
      </div>

      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 'bold', marginBottom: '10px', color: '#1e293b' }}>{event.title}</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={14} /> {new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={14} /> {event.time}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={14} /> {event.venue}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '600' }}>
            <QrCode size={14} /> ID: {registrationId}
          </div>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
          <button 
            className="btn-primary" 
            style={{ flex: 1, fontSize: '13px', padding: '8px', justifyContent: 'center' }}
            onClick={() => onViewTicket(registration)}
          >
            <Ticket size={16} /> View Ticket
          </button>
          {!isPast && (
            <button 
              className="btn-secondary" 
              style={{ padding: '8px', color: '#ef4444', borderColor: '#fee2e2' }}
              onClick={() => onCancel(event._id)}
              title="Cancel Registration"
            >
              <XCircle size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

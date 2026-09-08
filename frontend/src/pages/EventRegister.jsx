import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, MapPin, Clock, ArrowLeft, CheckCircle, Download, Share2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';

export default function EventRegister() {
  const { id } = useParams();
  const navigate = useNavigate();
  const ticketRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const [event, setEvent] = useState(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  
  const [step, setStep] = useState(1); // 1 = Form, 2 = Loading, 3 = Success
  const [ticketDetails, setTicketDetails] = useState(null);
  
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');

  const [formData, setFormData] = useState({
    fullName: userInfo?.name || '',
    email: userInfo?.email || '',
    phone: '',
    gender: '',
    dob: '',
    college: 'Campus Collaboration University',
    department: userInfo?.department || '',
    year: userInfo?.year || '',
    usn: '',
    section: '',
    domain: '',
    experience: '',
    reason: '',
    linkedin: '',
    github: '',
    emergency: '',
    accommodation: 'No',
    food: 'Veg'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await axios.get('/api/events');
        const foundEvent = data.find(e => e._id === id);
        if (foundEvent) {
          setEvent(foundEvent);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingEvent(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.reason.trim()) newErrors.reason = 'Please provide a reason to attend';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!userInfo) return alert('Please login to register');

    setStep(2);

    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.post(`/api/events/${id}/rsvp`, {}, config);
      
      setTicketDetails({
        ...formData,
        serialId: data.registration.registrationId,
        timestamp: new Date().toISOString()
      });
      
      setStep(3);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#60a5fa', '#fcd34d', '#34d399']
      });
    } catch (err) {
      setStep(1);
      alert(err.response?.data?.message || 'Failed to register');
    }
  };

  const handleDownload = async () => {
    if (!ticketRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(ticketRef.current, { scale: 2, backgroundColor: '#ffffff' });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `Ticket-${ticketDetails.serialId}.png`;
      link.click();
    } catch (err) {
      console.error("Error downloading ticket", err);
      alert("Failed to download ticket. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    const shareText = `I'm attending ${event.title}! My Registration ID is ${ticketDetails.serialId}.`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `Attending ${event.title}`, text: shareText, url: window.location.origin + '/events' });
      } catch (err) { if (err.name !== 'AbortError') console.error(err); }
    } else {
      try { await navigator.clipboard.writeText(shareText); alert("Copied to clipboard!"); } catch (err) { alert("Failed to copy"); }
    }
  };

  if (loadingEvent) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading event details...</div>;
  if (!event) return <div style={{ padding: '40px', textAlign: 'center' }}>Event not found</div>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', paddingBottom: '60px' }}>
      <div style={{ position: 'relative', width: '100%', height: '300px', overflow: 'hidden', backgroundColor: '#1e293b' }}>
        <img src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '40px 5%', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', color: 'white' }}>
          <button onClick={() => navigate('/events')} style={{ background: 'none', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '16px', opacity: 0.8 }}>
            <ArrowLeft size={16} /> Back
          </button>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '12px' }}>{event.title}</h1>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', opacity: 0.9 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={18} /> {new Date(event.date).toLocaleDateString()}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={18} /> {event.time}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={18} /> {event.venue}</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '-40px auto 0', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '16px' }}>Registration Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>Full Name *</label>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} style={inputStyle(errors.fullName)} />
                    {errors.fullName && <p style={errorStyle}>{errors.fullName}</p>}
                  </div>
                  <div>
                    <label style={labelStyle}>Email *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle(errors.email)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone *</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} style={inputStyle(errors.phone)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Reason to Join *</label>
                    <input type="text" name="reason" value={formData.reason} onChange={handleChange} style={inputStyle(errors.reason)} />
                  </div>
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '16px', justifyContent: 'center' }}>Confirm RSVP</button>
              </form>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '100px 0', backgroundColor: 'white', borderRadius: '16px' }}>
              <div className="loader" style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <h3 style={{ marginTop: '20px' }}>Registering you...</h3>
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)' }}>
              <div style={{ background: '#10b981', padding: '30px', textAlign: 'center', color: 'white' }}>
                <CheckCircle size={48} style={{ margin: '0 auto 10px' }} />
                <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>See you there!</h2>
              </div>
              <div style={{ padding: '40px' }}>
                <div ref={ticketRef} style={{ border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold' }}>{event.title}</h3>
                  <p style={{ color: '#2563eb', fontWeight: 'bold', margin: '10px 0' }}>Ticket ID: {ticketDetails.serialId}</p>
                  <p><b>Name:</b> {ticketDetails.fullName}</p>
                  <p><b>Venue:</b> {event.venue}</p>
                  <p><b>Date:</b> {new Date(event.date).toLocaleDateString()}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={handleDownload} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>Download</button>
                  <button onClick={() => navigate('/events')} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer' }}>Back to Events</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#64748b', marginBottom: '6px' };
const inputStyle = (err) => ({ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${err ? '#ef4444' : '#cbd5e1'}`, boxSizing: 'border-box' });
const errorStyle = { color: '#ef4444', fontSize: '11px', marginTop: '4px' };

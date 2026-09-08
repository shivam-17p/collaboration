import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, User, Mail, Lock, ArrowRight, GraduationCap, School, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Register({ setUserInfo }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [year, setYear] = useState('1st Year');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const { data } = await axios.post('/api/auth/register', { name, email, password, department, year });
      localStorage.setItem('userInfo', JSON.stringify(data));
      setUserInfo(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={blob1Style}></div>
      <div style={blob2Style}></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={cardStyle}
      >
        <div style={headerStyle}>
          <div style={logoWrapperStyle}>
            <BookOpen size={32} color="white" />
          </div>
          <h1 style={titleStyle}>Create Account</h1>
          <p style={subtitleStyle}>Join thousands of students on CampusConnect</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={errorBoxStyle}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Full Name</label>
            <div style={inputWrapperStyle}>
              <User size={18} style={iconStyle} />
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
                placeholder="John Doe"
              />
            </div>
          </div>

          <div style={inputGroupStyle}>
            <label style={labelStyle}>Email Address</label>
            <div style={inputWrapperStyle}>
              <Mail size={18} style={iconStyle} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                placeholder="john@college.edu"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ ...inputGroupStyle, flex: 1 }}>
              <label style={labelStyle}>Department</label>
              <div style={inputWrapperStyle}>
                <School size={18} style={iconStyle} />
                <select 
                  value={department} 
                  onChange={(e) => setDepartment(e.target.value)} 
                  style={{ ...inputStyle, appearance: 'none' }}
                >
                  <option>Computer Science</option>
                  <option>Information Technology</option>
                  <option>Electronics</option>
                  <option>Mechanical</option>
                  <option>Civil</option>
                </select>
              </div>
            </div>
            <div style={{ ...inputGroupStyle, flex: 1 }}>
              <label style={labelStyle}>Current Year</label>
              <div style={inputWrapperStyle}>
                <GraduationCap size={18} style={iconStyle} />
                <select 
                  value={year} 
                  onChange={(e) => setYear(e.target.value)} 
                  style={{ ...inputStyle, appearance: 'none' }}
                >
                  <option>1st Year</option>
                  <option>2nd Year</option>
                  <option>3rd Year</option>
                  <option>4th Year</option>
                </select>
              </div>
            </div>
          </div>

          <div style={inputGroupStyle}>
            <label style={labelStyle}>Password</label>
            <div style={inputWrapperStyle}>
              <Lock size={18} style={iconStyle} />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
                placeholder="Minimum 6 characters"
              />
            </div>
          </div>

          <button 
            type="submit" 
            style={submitButtonStyle} 
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Sign Up <ArrowRight size={18} style={{ marginLeft: '8px' }} />
              </>
            )}
          </button>
        </form>

        <div style={footerStyle}>
          <p style={footerTextStyle}>
            Already have an account? <Link to="/login" style={linkStyle}>Log in here</Link>
          </p>
          
          <div style={adminSectionStyle}>
            <div style={dividerStyle}>
              <span style={dividerTextStyle}>Admin Portal</span>
            </div>
            <Link to="/admin-auth" style={adminLinkStyle}>
              Staff/Faculty Access
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Reuse styles from Login for consistency
const containerStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#f8fafc',
  position: 'relative',
  overflow: 'hidden',
  padding: '40px 20px'
};

const blob1Style = {
  position: 'absolute',
  top: '-10%',
  left: '-5%',
  width: '40%',
  height: '60%',
  background: 'radial-gradient(circle, rgba(79, 70, 229, 0.08) 0%, rgba(255, 255, 255, 0) 70%)',
  zIndex: 0,
  borderRadius: '50%'
};

const blob2Style = {
  position: 'absolute',
  bottom: '-10%',
  right: '-5%',
  width: '40%',
  height: '60%',
  background: 'radial-gradient(circle, rgba(14, 165, 233, 0.08) 0%, rgba(255, 255, 255, 0) 70%)',
  zIndex: 0,
  borderRadius: '50%'
};

const cardStyle = {
  backgroundColor: 'white',
  padding: '48px',
  borderRadius: '32px',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  width: '100%',
  maxWidth: '500px',
  position: 'relative',
  zIndex: 1,
  border: '1px solid #f1f5f9'
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '32px'
};

const logoWrapperStyle = {
  display: 'inline-flex',
  backgroundColor: '#4f46e5',
  padding: '16px',
  borderRadius: '20px',
  marginBottom: '20px',
  boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)'
};

const titleStyle = {
  fontSize: '32px',
  fontWeight: '800',
  color: '#1e293b',
  letterSpacing: '-0.025em',
  marginBottom: '8px'
};

const subtitleStyle = {
  color: '#64748b',
  fontSize: '15px',
  lineHeight: '1.5'
};

const errorBoxStyle = {
  backgroundColor: '#fef2f2',
  color: '#ef4444',
  padding: '14px 16px',
  borderRadius: '12px',
  marginBottom: '24px',
  fontSize: '14px',
  fontWeight: '500',
  border: '1px solid #fee2e2',
  textAlign: 'center'
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px'
};

const inputGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
};

const labelStyle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#334155',
  marginLeft: '4px'
};

const inputWrapperStyle = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center'
};

const iconStyle = {
  position: 'absolute',
  left: '16px',
  color: '#94a3b8',
  pointerEvents: 'none'
};

const inputStyle = {
  width: '100%',
  padding: '14px 16px 14px 48px',
  borderRadius: '14px',
  border: '1.5px solid #e2e8f0',
  fontSize: '15px',
  color: '#1e293b',
  outline: 'none',
  transition: 'all 0.2s',
  backgroundColor: '#f8fafc'
};

const submitButtonStyle = {
  backgroundColor: '#4f46e5',
  color: 'white',
  padding: '16px',
  borderRadius: '14px',
  fontSize: '16px',
  fontWeight: '700',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s',
  boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.2)',
  marginTop: '12px'
};

const footerStyle = {
  marginTop: '32px',
  textAlign: 'center'
};

const footerTextStyle = {
  fontSize: '15px',
  color: '#64748b'
};

const linkStyle = {
  color: '#4f46e5',
  fontWeight: '700',
  textDecoration: 'none'
};

const adminSectionStyle = {
  marginTop: '24px'
};

const dividerStyle = {
  position: 'relative',
  height: '1px',
  backgroundColor: '#e2e8f0',
  marginBottom: '20px'
};

const dividerTextStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: 'white',
  padding: '0 12px',
  fontSize: '12px',
  fontWeight: '600',
  color: '#94a3b8',
  textTransform: 'uppercase'
};

const adminLinkStyle = {
  color: '#64748b',
  fontSize: '14px',
  fontWeight: '500',
  textDecoration: 'none'
};

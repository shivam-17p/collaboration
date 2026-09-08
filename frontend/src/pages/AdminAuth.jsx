import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, User, GraduationCap, School, Key } from 'lucide-react';
import axios from 'axios';

export default function AdminAuth({ setUserInfo }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    adminCode: '',
    college: 'Campus Collaboration University'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { data } = await axios.post('/api/auth/login', {
          email: formData.email,
          password: formData.password
        });
        
        if (data.role !== 'admin') {
          setError('This account does not have admin privileges.');
          setLoading(false);
          return;
        }

        localStorage.setItem('userInfo', JSON.stringify(data));
        setUserInfo(data);
        navigate('/');
      } else {
        const { data } = await axios.post('/api/auth/register', {
          ...formData,
          role: 'admin'
        });
        localStorage.setItem('userInfo', JSON.stringify(data));
        setUserInfo(data);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <div style={logoContainerStyle}>
            <ShieldCheck size={32} color="white" />
          </div>
          <h1 style={titleStyle}>Admin Portal</h1>
          <p style={subtitleStyle}>Manage the Campus Collaboration Platform</p>
        </div>

        {error && (
          <div style={errorStyle}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={formStyle}>
          {!isLogin && (
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Full Name</label>
              <div style={inputWrapperStyle}>
                <User size={18} style={iconStyle} />
                <input
                  type="text"
                  name="name"
                  placeholder="Admin Name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>
          )}

          <div style={inputGroupStyle}>
            <label style={labelStyle}>Admin Email</label>
            <div style={inputWrapperStyle}>
              <Mail size={18} style={iconStyle} />
              <input
                type="email"
                name="email"
                placeholder="admin@college.com"
                required
                value={formData.email}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={inputGroupStyle}>
            <label style={labelStyle}>Password</label>
            <div style={inputWrapperStyle}>
              <Lock size={18} style={iconStyle} />
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
          </div>

          {!isLogin && (
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Admin Secret Code</label>
              <div style={inputWrapperStyle}>
                <Key size={18} style={iconStyle} />
                <input
                  type="password"
                  name="adminCode"
                  placeholder="Enter secret code to register"
                  required
                  value={formData.adminCode}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? 'Processing...' : (isLogin ? 'Admin Login' : 'Create Admin Account')}
          </button>
        </form>

        <div style={footerStyle}>
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            style={toggleButtonStyle}
          >
            {isLogin ? "Need an admin account? Register" : "Already an admin? Login"}
          </button>
          <div style={{ marginTop: '16px' }}>
            <Link to="/login" style={{ color: '#64748b', fontSize: '13px', textDecoration: 'none' }}>
              Back to Student Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Styles
const containerStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
  padding: '20px'
};

const cardStyle = {
  backgroundColor: 'white',
  borderRadius: '24px',
  width: '100%',
  maxWidth: '440px',
  padding: '48px',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '32px'
};

const logoContainerStyle = {
  width: '64px',
  height: '64px',
  backgroundColor: '#4f46e5',
  borderRadius: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 20px',
  boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.4)'
};

const titleStyle = {
  fontSize: '28px',
  fontWeight: '800',
  color: '#1e293b',
  marginBottom: '8px'
};

const subtitleStyle = {
  color: '#64748b',
  fontSize: '14px'
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
  fontSize: '13px',
  fontWeight: '600',
  color: '#475569',
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
  color: '#94a3b8'
};

const inputStyle = {
  width: '100%',
  padding: '12px 16px 12px 48px',
  borderRadius: '12px',
  border: '1.5px solid #e2e8f0',
  fontSize: '14px',
  outline: 'none',
  transition: 'all 0.2s',
  backgroundColor: '#f8fafc'
};

const buttonStyle = {
  backgroundColor: '#4f46e5',
  color: 'white',
  padding: '14px',
  borderRadius: '12px',
  fontSize: '15px',
  fontWeight: '700',
  border: 'none',
  cursor: 'pointer',
  marginTop: '12px',
  transition: 'all 0.2s',
  boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)'
};

const errorStyle = {
  backgroundColor: '#fef2f2',
  color: '#b91c1c',
  padding: '12px',
  borderRadius: '12px',
  fontSize: '13px',
  marginBottom: '20px',
  border: '1px solid #fee2e2',
  textAlign: 'center'
};

const footerStyle = {
  marginTop: '32px',
  textAlign: 'center'
};

const toggleButtonStyle = {
  background: 'none',
  border: 'none',
  color: '#4f46e5',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer'
};

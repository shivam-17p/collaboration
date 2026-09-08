import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  BookOpen, 
  Mail, 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  Loader2, 
  Eye, 
  EyeOff, 
  Sun, 
  Moon 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login({ setUserInfo }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', newTheme ? 'dark' : 'light');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('userInfo', JSON.stringify(data));
      setUserInfo(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
      setLoading(false);
    }
  };

  const theme = {
    bg: isDarkMode ? '#030712' : '#f8fafc',
    card: isDarkMode ? 'rgba(17, 24, 39, 0.9)' : 'rgba(255, 255, 255, 1)',
    cardBorder: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    text: isDarkMode ? '#f9fafb' : '#0f172a',
    textMuted: isDarkMode ? '#9ca3af' : '#64748b',
    inputBg: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : '#f1f5f9',
    inputBorder: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    primary: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    brandColor: isDarkMode ? '#ffffff' : '#4f46e5',
    brandShadow: isDarkMode ? '0 0 20px rgba(99, 102, 241, 0.4)' : 'none'
  };

  return (
    <div style={{ ...containerStyle, backgroundColor: theme.bg }}>
      <button onClick={toggleTheme} style={themeToggleStyle}>
        {isDarkMode ? <Sun size={18} color="#fbbf24" /> : <Moon size={18} color="#475569" />}
      </button>

      <div style={{ ...blob1Style, opacity: isDarkMode ? 0.15 : 0.08 }}></div>
      <div style={{ ...blob2Style, opacity: isDarkMode ? 0.15 : 0.08 }}></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ 
          ...cardStyle, 
          backgroundColor: theme.card,
          borderColor: theme.cardBorder,
          color: theme.text,
          boxShadow: isDarkMode ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : '0 20px 25px -5px rgba(0, 0, 0, 0.05)'
        }}
      >
        <div style={headerStyle}>
          <div style={brandWrapper}>
            <div style={logoMini}>
              <BookOpen size={20} color="white" />
            </div>
            
            {/* Simplified Brand Header for maximum compatibility */}
            <h1 style={{ 
              ...brandName, 
              color: theme.brandColor,
              textShadow: theme.brandShadow
            }}>
              CampusConnect
            </h1>
          </div>
          
          <p style={{ ...brandTagline, color: theme.textMuted }}>Your Smart Campus Collaboration Platform</p>
          <div style={{ ...headerDivider, backgroundColor: theme.inputBorder }}></div>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={errorStyle}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} style={formGroup}>
          <div style={inputStack}>
            <label style={{ ...labelStyle, color: theme.textMuted }}>Email Address</label>
            <div style={inputWrapper}>
              <Mail size={18} style={inputIcon} color={isDarkMode ? '#9ca3af' : '#64748b'} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ 
                  ...inputField, 
                  backgroundColor: theme.inputBg,
                  borderColor: theme.inputBorder,
                  color: theme.text
                }}
                placeholder="name@college.edu"
              />
            </div>
          </div>

          <div style={inputStack}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ ...labelStyle, color: theme.textMuted }}>Password</label>
              <Link to="#" style={{ ...smallLink, color: '#6366f1' }}>Forgot?</Link>
            </div>
            <div style={inputWrapper}>
              <Lock size={18} style={inputIcon} color={isDarkMode ? '#9ca3af' : '#64748b'} />
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ 
                  ...inputField, 
                  backgroundColor: theme.inputBg,
                  borderColor: theme.inputBorder,
                  color: theme.text,
                  paddingRight: '48px'
                }}
                placeholder="••••••••"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={passwordToggle}
              >
                {showPassword ? <EyeOff size={18} color={theme.textMuted} /> : <Eye size={18} color={theme.textMuted} />}
              </button>
            </div>
          </div>

          <motion.button 
            type="submit" 
            whileHover={{ translateY: -1 }}
            whileTap={{ scale: 0.99 }}
            style={{ ...submitButton, background: theme.primary }}
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                Sign In <ArrowRight size={18} />
              </span>
            )}
          </motion.button>
        </form>

        <div style={footerStyle}>
          <p style={{ fontSize: '14px', color: theme.textMuted }}>
            Don't have an account? <Link to="/register" style={{ color: '#6366f1', fontWeight: '600', textDecoration: 'none' }}>Create account</Link>
          </p>
          
          <div style={dividerSection}>
            <div style={{ ...dividerLine, backgroundColor: theme.inputBorder }}></div>
            <span style={{ ...dividerLabel, color: theme.textMuted, backgroundColor: isDarkMode ? '#111827' : '#ffffff' }}>Staff Only</span>
          </div>

          <Link to="/admin-auth" style={{ 
            ...adminAccessLink, 
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f3f4f6',
            color: theme.text
          }}>
            <ShieldCheck size={16} style={{ marginRight: '8px' }} />
            Administrator Portal
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

// Brand Styles
const brandWrapper = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '4px'
};

const logoMini = {
  width: '40px',
  height: '40px',
  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 8px 16px -4px rgba(99, 102, 241, 0.4)'
};

const brandName = {
  fontSize: '36px',
  fontWeight: '900',
  letterSpacing: '-0.04em',
  margin: 0,
  textAlign: 'center',
  transition: 'all 0.3s ease'
};

const brandTagline = {
  fontSize: '14px',
  fontWeight: '500',
  letterSpacing: '0.02em',
  marginTop: '8px',
  textAlign: 'center'
};

const headerDivider = {
  height: '1px',
  width: '60px',
  margin: '24px auto 0',
  opacity: 0.5
};

const containerStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  position: 'relative',
  overflow: 'hidden',
  transition: 'background-color 0.4s ease'
};

const cardStyle = {
  width: '100%',
  maxWidth: '420px',
  padding: '48px 40px',
  borderRadius: '32px',
  border: '1px solid',
  backdropFilter: 'blur(24px)',
  zIndex: 10,
  position: 'relative',
  transition: 'all 0.4s ease'
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '40px'
};

const formGroup = {
  display: 'flex',
  flexDirection: 'column',
  gap: '24px'
};

const inputStack = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px'
};

const labelStyle = {
  fontSize: '13px',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  paddingLeft: '4px'
};

const inputWrapper = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center'
};

const inputField = {
  width: '100%',
  height: '56px',
  padding: '0 20px 0 52px',
  borderRadius: '16px',
  border: '1.5px solid',
  fontSize: '15px',
  fontWeight: '500',
  outline: 'none',
  boxSizing: 'border-box'
};

const inputIcon = {
  position: 'absolute',
  left: '20px',
  pointerEvents: 'none'
};

const passwordToggle = {
  position: 'absolute',
  right: '16px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '8px',
  display: 'flex',
  alignItems: 'center',
  borderRadius: '8px'
};

const submitButton = {
  height: '60px',
  width: '100%',
  borderRadius: '18px',
  border: 'none',
  color: 'white',
  fontSize: '16px',
  fontWeight: '700',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: '8px',
  boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)'
};

const footerStyle = {
  marginTop: '40px',
  textAlign: 'center'
};

const dividerSection = {
  position: 'relative',
  margin: '32px 0 24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const dividerLine = {
  position: 'absolute',
  width: '100%',
  height: '1px'
};

const dividerLabel = {
  position: 'relative',
  padding: '0 16px',
  fontSize: '11px',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '0.1em'
};

const adminAccessLink = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '12px 24px',
  borderRadius: '14px',
  fontSize: '13px',
  fontWeight: '600',
  textDecoration: 'none'
};

const smallLink = {
  fontSize: '13px',
  fontWeight: '600',
  textDecoration: 'none'
};

const errorStyle = {
  backgroundColor: 'rgba(239, 68, 68, 0.1)',
  color: '#ef4444',
  padding: '16px',
  borderRadius: '14px',
  fontSize: '14px',
  fontWeight: '600',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  textAlign: 'center',
  marginBottom: '24px'
};

const themeToggleStyle = {
  position: 'fixed',
  top: '24px',
  right: '24px',
  padding: '12px',
  borderRadius: '16px',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  cursor: 'pointer',
  zIndex: 100,
  backdropFilter: 'blur(12px)'
};

const blob1Style = {
  position: 'absolute',
  top: '-15%',
  left: '-5%',
  width: '45%',
  height: '65%',
  background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(255, 255, 255, 0) 70%)',
  zIndex: 0,
  filter: 'blur(60px)'
};

const blob2Style = {
  position: 'absolute',
  bottom: '-15%',
  right: '-5%',
  width: '45%',
  height: '65%',
  background: 'radial-gradient(circle, rgba(14, 165, 233, 0.12) 0%, rgba(255, 255, 255, 0) 70%)',
  zIndex: 0,
  filter: 'blur(60px)'
};

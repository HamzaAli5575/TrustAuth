import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Auth = ({ onLogin }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      const fetchUser = async () => {
        try {
          const res = await api.get('/profile');
          localStorage.setItem('user', JSON.stringify(res.data));
          onLogin(res.data);
          navigate('/dashboard', { replace: true });
        } catch (err) { alert("Error fetching user"); }
      };
      fetchUser();
    }
  }, [onLogin, navigate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isSignup ? '/signup' : '/login';
      const res = await api.post(endpoint, formData);
      
      if (isSignup) {
        alert('Account created successfully! Please log in.');
        setIsSignup(false);
      } else {
        localStorage.setItem('token', res.data.accessToken);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        onLogin(res.data.user);
      }
    } catch (err) {
      alert(isSignup ? 'Signup Failed' : 'Login Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleKeycloak = () => {
    window.location.href = `http://localhost:8080/realms/r-realm/protocol/openid-connect/auth?client_id=r-client&redirect_uri=http://localhost:3000/auth/callback&response_type=code&scope=openid email profile`;
  };

  return (
    <div className="auth-wrapper">
      {/* Art Side */}
      <div className="auth-art">
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <div style={{ marginBottom: '1rem' }}>
            <img src="/logo.PNG" alt="TrustAuth Logo" className="auth-logo" />
          </div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '0.5rem', lineHeight: 1.1, letterSpacing: '-0.03em' }}>TrustAuth</h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, fontWeight: 500 }}>Secure Identity Management</p>
        </div>
      </div>

      {/* Form Side */}
      <div className="auth-form-container">
        <div className="auth-box">
          <div className="auth-title">{isSignup ? 'Create Account' : 'Welcome Back'}</div>
          <div className="auth-sub">{isSignup ? 'Enter your details to join our platform' : 'Please enter your credentials to access your account'}</div>

          {/* OAuth */}
          <button className="btn btn-outline" style={{ width: '100%', marginBottom: '1.5rem' }} onClick={handleKeycloak}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            Continue with Keycloak
          </button>
          
          <div className="divider"><span>OR</span></div>

          <form onSubmit={handleSubmit}>
            {isSignup && (
              <div className="input-group">
                <label>Full Name</label>
                <input name="username" type="text" placeholder="e.g., John Doe" onChange={handleChange} required />
              </div>
            )}
            <div className="input-group">
              <label>Email Address</label>
              <input name="email" type="email" placeholder="name@company.com" onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input name="password" type="password" placeholder="•••••••" onChange={handleChange} required />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? (
                <span style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <span className="skeleton" style={{ width:'16px', height:'16px', borderRadius:'50%' }}></span> Processing...
                </span>
              ) : (isSignup ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.9rem', color: '#64748b' }}>
            {isSignup ? "Already have an account? " : "Don't have an account? "}
            <span onClick={() => setIsSignup(!isSignup)} style={{ color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '4px' }}>
              {isSignup ? 'Log in' : 'Sign up'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
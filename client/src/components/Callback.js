import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Callback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Authenticating...');
  const hasBeenCalled = useRef(false);
  const processing = useRef(false);

  useEffect(() => {
    // CRITICAL: Prevent React 18 Strict Mode from running this twice
    if (hasBeenCalled.current) return;
    hasBeenCalled.current = true;

    const handleCallback = async () => {
      // Lock function so it can't be triggered twice simultaneously
      if (processing.current) return;
      processing.current = true;

      try {
        // 1. Parse Code from URL
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');

        if (!code) {
          setStatus('Error: No code found.');
          setTimeout(() => navigate('/', { replace: true }), 1500);
          return;
        }

        setStatus('Exchanging token...');
        
        // 2. Send Code to Backend
        const res = await api.get(`/auth/callback?code=${code}`);
        
        setStatus('Verifying user profile...');
        
        // 3. Save Token & User
        localStorage.setItem('token', res.data.accessToken);
        localStorage.setItem('user', JSON.stringify(res.data.user));

        setStatus('Success! Redirecting to Dashboard...');

        // 4. Hard Redirect to Dashboard
        // We use window.location.href to completely flush history state
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 500);

      } catch (err) {
        console.error('❌ OAuth Error:', err.response?.data || err.message);
        setStatus('Authentication Failed. Redirecting...');
        
        // 5. Wait briefly then send home
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 2000);
      } finally {
        // Unlock for next attempt (though reset should happen)
        processing.current = false;
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div style={{ 
      height: '100vh', 
      background: '#f1f5f9', 
      display: 'grid', 
      placeItems: 'center', 
      flexDirection: 'column',
      gap: '15px',
      fontSize: '1.4rem',
      color: '#0f172a',
      fontFamily: 'var(--font-main)'
    }}>
      <div style={{ fontSize: '3rem', animation: 'spin 1s linear infinite' }}>⚡️</div>
      <div>{status}</div>
      {status.includes('Error') && <div style={{ fontSize: '0.9rem', color: '#ef4444', marginTop: '1rem' }}>Please try logging in again.</div>}
    </div>
  );
};

export default Callback;
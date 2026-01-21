import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Callback from './components/Callback';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = (currentUser) => {
    const isKeycloak = currentUser && currentUser.provider === 'keycloak';

    if (isKeycloak) {
      const logoutKeycloak = window.confirm("You are logged in via Keycloak. Do you want to logout of Keycloak as well?");

      if (logoutKeycloak) {
        localStorage.clear();
        setUser(null);
        window.location.href = 'http://localhost:8080/realms/r-realm/protocol/openid-connect/logout?redirect_uri=http://localhost:3000/';
      } else {
        localStorage.clear();
        setUser(null);
      }
    } else {
      localStorage.clear();
      setUser(null);
    }
  };

  if (loading) return <div style={{height:'100vh', background:'#f1f5f9', display:'grid', placeItems:'center', fontSize:'1.2rem', color:'#0ea5e9'}}>Loading App...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={!user ? <Auth onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
        <Route path="/auth/callback" element={<Callback />} />
        <Route path="/dashboard" element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
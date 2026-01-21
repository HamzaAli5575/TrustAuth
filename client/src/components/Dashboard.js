import React, { useState } from 'react';
import api from '../api';
import '../App.css';

const Dashboard = ({ user, onLogout }) => {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState('dashboard');

  const fetchAdminUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      alert("Access Denied.");
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/logs');
      setLogs(res.data);
    } catch (err) {
      alert("Failed to fetch logs.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      fetchAdminUsers();
    } catch (err) {
      alert('Failed to update role');
    }
  };

  const handleChangePassword = async (userId, username) => {
    const newPassword = prompt(`Enter new password for ${username}:`);
    if (!newPassword) return;
    
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    const confirmNew = prompt("Confirm new password:");
    if (newPassword !== confirmNew) {
      alert("Passwords do not match.");
      return;
    }

    try {
      await api.put(`/admin/users/${userId}/password`, { password: newPassword });
      alert("Password updated successfully!");
    } catch (err) {
      alert("Failed to update password.");
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="brand">
          <img src="/logo.PNG" alt="TrustAuth Logo" className="brand-logo" />
          TrustAuth
        </div>
        
        <div 
          className={`nav-item ${view === 'dashboard' ? 'active' : ''}`} 
          onClick={() => setView('dashboard')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Dashboard
        </div>
        
        {user.role === 'admin' && (
          <div 
            className={`nav-item ${view === 'users' ? 'active' : ''}`} 
            onClick={() => setView('users')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            User Management
          </div>
        )}

        {user.role === 'admin' && (
          <div 
            className={`nav-item ${view === 'logs' ? 'active' : ''}`} 
            onClick={() => setView('logs')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            Activity Logs
          </div>
        )}

        <div className="sidebar-bottom">
          <div className="user-profile">
            <div className="avatar">{user.username.charAt(0).toUpperCase()}</div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{user.username}</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>{user.role}</div>
            </div>
            <button onClick={() => onLogout(user)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '5px', transition: '0.2s' }} title="Logout">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <div className="top-bar">
          <div className="welcome-text">
            <h2>Hello, {user.username} 👋</h2>
            <p>Welcome back! Here is what's happening today.</p>
          </div>
          {(view === 'users' || view === 'logs') && (
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Search users, emails..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          )}
        </div>

        {view === 'dashboard' && (
          <div className="grid-3">
            <div className="card stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-value">{users.length}</div>
              <div className="stat-label">Total Users</div>
            </div>
            <div className="card stat-card">
              <div className="stat-icon" style={{ color: '#10b981', background: '#d1fae5' }}>🛡️</div>
              <div className="stat-value">Active</div>
              <div className="stat-label">Security Status</div>
            </div>
            <div className="card stat-card">
              <div className="stat-icon" style={{ color: '#f59e0b', background: '#fef3c7' }}>🔥</div>
              <div className="stat-value">99.9%</div>
              <div className="stat-label">System Uptime</div>
            </div>
          </div>
        )}

        {view === 'users' && user.role === 'admin' && (
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>User Management</h3>
                <p style={{ fontSize: '0.95rem', color: '#64748b', marginTop: '4px', fontWeight: 500 }}>View and manage user access roles and passwords.</p>
              </div>
              <button className="btn btn-primary btn-sm" onClick={fetchAdminUsers}>
                {loading ? 'Loading...' : 'Refresh List'}
              </button>
            </div>
            
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>User Profile</th><th>Email Address</th><th>Current Role</th><th>Security Actions</th></tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div className="avatar" style={{ width: '36px', height: '36px', fontSize: '0.9rem' }}>{u.username.charAt(0)}</div>
                          <span style={{ fontWeight: 600 }}>{u.username}</span>
                        </div>
                      </td>
                      <td style={{ color: '#64748b', fontWeight: 500 }}>{u.email}</td>
                      <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                      <td style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        {u._id !== user._id && (
                          <select 
                            value={u.role} 
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            style={{ padding: '8px 12px', borderRadius: '8px', border: '2px solid #e2e8f0', outline: 'none', fontWeight: 600, cursor: 'pointer', background: 'white' }}
                          >
                            <option value="user">User</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                          </select>
                        )}
                        
                        <button 
                          onClick={() => handleChangePassword(u._id, u.username)}
                          style={{ 
                            padding: '6px 12px', 
                            borderRadius: '6px', 
                            border: '1px solid #cbd5e1', 
                            background: 'white', 
                            cursor: 'pointer', 
                            fontSize: '0.85rem', 
                            color: '#64748b',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            transition: '0.2s'
                          }}
                          onMouseOver={(e) => e.target.style.background = '#f1f5f9'}
                          onMouseOut={(e) => e.target.style.background = 'white'}
                        >
                          🔑 Change Password
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', fontWeight: 500 }}>
                      {loading ? <div className="skeleton" style={{ height: '20px', width: '150px', margin: '0 auto' }}></div> : 'No users found.'}
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === 'logs' && user.role === 'admin' && (
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>Activity Logs</h3>
                <p style={{ fontSize: '0.95rem', color: '#64748b', marginTop: '4px', fontWeight: 500 }}>Track system events and logins.</p>
              </div>
              <button className="btn btn-primary btn-sm" onClick={fetchLogs}>{loading ? 'Loading...' : 'Refresh Logs'}</button>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Timestamp</th><th>User</th><th>Activity Type</th><th>IP Address</th></tr>
                </thead>
                <tbody>
                  {logs.map((log, idx) => (
                    <tr key={idx}>
                      <td style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td style={{ fontWeight: 600 }}>{log.username}</td>
                      <td><span className={`badge ${log.action === 'LOGIN_SUCCESS' ? 'badge-admin' : 'badge-user'}`}>{log.action}</span></td>
                      <td style={{ fontFamily: 'monospace', color: '#94a3b8', fontSize: '0.85rem' }}>{log.ip}</td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr><td colSpan="4" style={{textAlign:'center', padding:'3rem', color:'#94a3b8', fontWeight:500 }}>No logs found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {view !== 'dashboard' && user.role !== 'admin' && (
          <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🔒</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#0f172a' }}>Restricted Access</h3>
            <p style={{ color: '#64748b', maxWidth: '500px', margin: '0 auto', fontSize: '1.05rem', lineHeight: '1.6' }}>
              You do not have necessary permissions to view this section. Please contact an administrator if you believe this is an error.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
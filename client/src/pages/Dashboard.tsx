import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import '../index.css';

const LogoIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

const VideoIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14v-4z" fill="currentColor"/>
    <path d="M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" fill="currentColor"/>
  </svg>
);

const Dashboard: React.FC = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:4000/api/auth/logout');
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <div className="dashboard-container">
      <nav className="navbar glass-panel">
        <div className="brand">
          <LogoIcon />
          Vidxa
        </div>
        <div className="nav-right">
          <span className="user-email">{user?.email}</span>
          <button onClick={handleLogout} className="secondary-btn">Logout</button>
        </div>
      </nav>
      <main className="dashboard-content">
        <h1>Your Library</h1>
        <p className="subtitle" style={{ textAlign: 'left', marginBottom: '0' }}>Manage and process your video assets.</p>
        
        <div className="empty-state">
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <VideoIcon />
          </div>
          <h3>No videos yet</h3>
          <p>Video upload and processing will be implemented in Phase 3.</p>
          <button className="primary-btn" style={{ maxWidth: '200px', margin: '2rem auto 0' }}>
            Upload Video
          </button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

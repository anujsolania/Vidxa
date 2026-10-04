import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import '../index.css';

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
        <div className="brand">Vidxa</div>
        <div className="nav-right">
          <span className="user-email">{user?.email}</span>
          <button onClick={handleLogout} className="secondary-btn">Logout</button>
        </div>
      </nav>
      <main className="dashboard-content">
        <h1>Your Library</h1>
        <p>Video upload and processing will be implemented in Phase 3.</p>
      </main>
    </div>
  );
};

export default Dashboard;

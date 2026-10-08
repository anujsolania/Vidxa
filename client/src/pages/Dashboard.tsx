import React, { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

interface Video {
  id: number;
  title: string;
  filename: string;
  status: string;
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/videos');
      setVideos(response.data.videos);
    } catch (error) {
      console.error('Failed to fetch videos', error);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:4000/api/auth/logout');
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('video', file);
    formData.append('title', file.name);

    setUploading(true);
    setProgress(0);

    try {
      await axios.post('http://localhost:4000/api/videos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentCompleted);
          }
        },
      });
      fetchVideos();
    } catch (error) {
      console.error('Upload failed', error);
      alert('Video upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1>Your Library</h1>
            <p className="subtitle" style={{ textAlign: 'left', marginBottom: '0' }}>Manage and process your video assets.</p>
          </div>
          <div>
            <input 
              type="file" 
              accept="video/*" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileSelect}
            />
            <button 
              className="primary-btn" 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{ maxWidth: '200px', margin: 0 }}
            >
              {uploading ? `Uploading ${progress}%` : '+ Upload Video'}
            </button>
          </div>
        </div>
        
        {uploading && (
          <div style={{ width: '100%', height: '4px', background: 'var(--glass-border)', borderRadius: '2px', overflow: 'hidden', marginBottom: '2rem' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary-color)', transition: 'width 0.2s ease' }} />
          </div>
        )}

        {videos.length === 0 && !uploading ? (
          <div className="empty-state">
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <VideoIcon />
            </div>
            <h3>No videos yet</h3>
            <p>Upload a video to begin generating searchable transcripts.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
            {videos.map(video => (
              <Link to={`/videos/${video.id}`} key={video.id} style={{ textDecoration: 'none' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', cursor: 'pointer', transition: 'transform 0.2s ease, border-color 0.2s ease' }}>
                  <div style={{ width: '100%', height: '150px', background: 'var(--glass-border)', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <VideoIcon />
                  </div>
                  <h3 style={{ color: 'var(--text-color)', marginBottom: '0.5rem', fontSize: '1.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{video.title}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                    <span style={{ 
                      background: video.status === 'READY' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(99, 102, 241, 0.1)', 
                      color: video.status === 'READY' ? '#4ade80' : 'var(--primary-color)',
                      padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold'
                    }}>
                      {video.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

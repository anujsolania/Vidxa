import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../index.css';

interface Video {
  id: number;
  title: string;
  status: string;
  createdAt: string;
}

const VideoPlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [video, setVideo] = useState<Video | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/videos/${id}`);
        setVideo(response.data.video);
      } catch (err: any) {
        console.error('Failed to fetch video', err);
        setError('Video not found or access denied');
      }
    };
    fetchVideo();
  }, [id]);

  if (error) {
    return (
      <div className="dashboard-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <h2>{error}</h2>
          <button className="primary-btn" onClick={() => navigate('/dashboard')} style={{ marginTop: '2rem' }}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  if (!video) {
    return <div className="dashboard-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <nav className="navbar glass-panel">
        <Link to="/dashboard" style={{ color: 'var(--text-color)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          ← Back to Library
        </Link>
      </nav>
      
      <main className="dashboard-content" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>{video.title}</h1>
        <p className="subtitle" style={{ textAlign: 'left', marginBottom: '2rem' }}>
          Uploaded on {new Date(video.createdAt).toLocaleDateString()}
        </p>

        <div className="glass-panel" style={{ overflow: 'hidden', padding: 0 }}>
          <video 
            controls 
            style={{ width: '100%', display: 'block', background: '#000' }}
            src={`http://localhost:4000/api/videos/${id}/stream`}
          >
            Your browser does not support the video tag.
          </video>
        </div>

        <div style={{ marginTop: '3rem' }}>
          <h3>Transcription & Search</h3>
          <p className="subtitle" style={{ textAlign: 'left' }}>This feature will be implemented in Phase 6.</p>
        </div>
      </main>
    </div>
  );
};

export default VideoPlayer;

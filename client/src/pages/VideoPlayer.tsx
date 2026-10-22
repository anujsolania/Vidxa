import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../index.css';

interface Video {
  id: number;
  title: string;
  status: string;
  createdAt: string;
  duration?: number;
}

interface TranscriptSegment {
  id: number;
  videoId: number;
  start: number;
  end: number;
  text: string;
}

const formatTimestamp = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const VideoPlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [video, setVideo] = useState<Video | null>(null);
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [loadingTranscript, setLoadingTranscript] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
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

    const fetchTranscript = async () => {
      try {
        setLoadingTranscript(true);
        const response = await axios.get(`http://localhost:4000/api/videos/${id}/transcript`);
        setSegments(response.data.segments || []);
      } catch (err) {
        console.error('Failed to fetch transcript', err);
      } finally {
        setLoadingTranscript(false);
      }
    };

    fetchVideo();
    fetchTranscript();
  }, [id]);

  const seekTo = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

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

        {/* Video Player */}
        <div className="glass-panel" style={{ overflow: 'hidden', padding: 0 }}>
          <video 
            ref={videoRef}
            controls 
            onTimeUpdate={handleTimeUpdate}
            style={{ width: '100%', maxHeight: '560px', display: 'block', background: '#000' }}
            src={`http://localhost:4000/api/videos/${id}/stream`}
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Transcript Section */}
        <div style={{ marginTop: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 600 }}>Transcript</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {segments.length > 0 ? `${segments.length} segments` : ''}
            </span>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', maxHeight: '420px', overflowY: 'auto' }}>
            {loadingTranscript ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>Loading transcript...</p>
            ) : segments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>No speech detected in this video.</p>
                <p style={{ fontSize: '0.85rem' }}>Videos without speech or in processing won't have timestamped transcripts.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {segments.map((segment) => {
                  const isActive = currentTime >= segment.start && currentTime <= segment.end;
                  return (
                    <div 
                      key={segment.id}
                      onClick={() => seekTo(segment.start)}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '1rem',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                        borderLeft: isActive ? '3px solid var(--primary-color)' : '3px solid transparent',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)');
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) (e.currentTarget.style.background = 'transparent');
                      }}
                    >
                      <button 
                        style={{
                          background: 'rgba(99, 102, 241, 0.2)',
                          color: 'var(--primary-color)',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '2px 8px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontFamily: 'monospace',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {formatTimestamp(segment.start)}
                      </button>
                      <p style={{ margin: 0, fontSize: '0.95rem', color: isActive ? '#fff' : 'var(--text-color)', lineHeight: 1.5 }}>
                        {segment.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default VideoPlayer;


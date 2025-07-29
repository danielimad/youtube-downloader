import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const extractVideoId = (url) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const getVideoInfo = async () => {
    if (!url.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    setLoading(true);
    setError('');
    setVideoInfo(null);

    try {
      const response = await fetch(`/api/info?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      
      if (response.ok) {
        setVideoInfo(data);
      } else {
        setError(data.error || 'Failed to get video info');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (quality) => {
    const downloadUrl = `/api/download?url=${encodeURIComponent(url)}&quality=${quality}`;
    window.open(downloadUrl, '_blank');
  };

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '2rem auto', 
      padding: '0 1rem',
      fontFamily: 'system-ui, -apple-system, sans-serif' 
    }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#333', marginBottom: '0.5rem' }}>YouTube Downloader</h1>
        <p style={{ color: '#666' }}>Download YouTube videos in MP4 format</p>
      </div>
      
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '1.5rem', 
        borderRadius: '8px',
        marginBottom: '1rem'
      }}>
        <input
          type="text"
          placeholder="Paste YouTube URL here (e.g., https://www.youtube.com/watch?v=...)"
          value={url}
          onChange={e => setUrl(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            fontSize: '1rem',
            border: '2px solid #ddd',
            borderRadius: '6px',
            marginBottom: '1rem',
            boxSizing: 'border-box'
          }}
        />
        
        <button
          onClick={getVideoInfo}
          disabled={loading || !url.trim()}
          style={{
            width: '100%',
            padding: '0.75rem 1.5rem',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          {loading ? 'Getting Info...' : 'Get Video Info'}
        </button>
      </div>

      {error && (
        <div style={{ 
          backgroundColor: '#f8d7da', 
          color: '#721c24',
          padding: '1rem', 
          borderRadius: '6px',
          marginBottom: '1rem',
          border: '1px solid #f5c6cb'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {videoInfo && (
        <div style={{ 
          border: '1px solid #ddd', 
          borderRadius: '8px', 
          padding: '1.5rem',
          marginBottom: '1rem',
          backgroundColor: 'white'
        }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            {videoInfo.thumbnail && (
              <img 
                src={videoInfo.thumbnail} 
                alt="Video thumbnail" 
                style={{ 
                  width: '200px', 
                  height: 'auto', 
                  borderRadius: '6px',
                  flexShrink: 0
                }}
              />
            )}
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>
                {videoInfo.title}
              </h3>
              <p style={{ margin: '0.25rem 0', color: '#666' }}>
                <strong>Channel:</strong> {videoInfo.channel}
              </p>
              <p style={{ margin: '0.25rem 0', color: '#666' }}>
                <strong>Duration:</strong> {Math.floor(videoInfo.duration / 60)}:{(videoInfo.duration % 60).toString().padStart(2, '0')}
              </p>
              <p style={{ margin: '0.25rem 0', color: '#666' }}>
                <strong>Views:</strong> {videoInfo.views?.toLocaleString()}
              </p>
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Download Options:</h4>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleDownload('high')}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                High Quality (720p/480p)
              </button>
              <button
                onClick={() => handleDownload('low')}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Lower Quality (360p/240p)
              </button>
            </div>
          </div>

          {videoInfo.formats && videoInfo.formats.length > 0 && (
            <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
              <strong>Available formats:</strong> {videoInfo.formats.length} options found
            </div>
          )}
        </div>
      )}

      <div style={{ 
        backgroundColor: '#e9ecef', 
        padding: '1rem', 
        borderRadius: '6px',
        fontSize: '0.9rem',
        color: '#495057'
      }}>
        <h4 style={{ marginTop: 0 }}>How to use:</h4>
        <ol style={{ paddingLeft: '1.2rem' }}>
          <li>Copy and paste a YouTube video URL</li>
          <li>Click "Get Video Info" to preview the video</li>
          <li>Choose your preferred quality and click download</li>
        </ol>
        <p style={{ marginBottom: 0 }}>
          <strong>Note:</strong> Private videos, age-restricted content, and very long videos may not be downloadable due to platform restrictions.
        </p>
      </div>
    </div>
  );
}

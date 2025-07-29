import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloadStatus, setDownloadStatus] = useState('');

  const testUrls = [
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Rick Roll - usually works
    'https://www.youtube.com/watch?v=9bZkp7q19f0', // PSY - Gangnam Style
  ];

  const extractVideoId = (url) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  const getVideoInfo = async () => {
    if (!url.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      setError('Invalid YouTube URL format');
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
        console.error('Server error:', data);
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      console.error('Network error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (quality) => {
    setDownloadStatus('Preparing download...');
    
    try {
      const downloadUrl = `/api/download?url=${encodeURIComponent(url)}&quality=${quality}`;
      
      // Create a temporary link to trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = '';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setDownloadStatus('Download started! Check your downloads folder.');
      
      // Clear status after 5 seconds
      setTimeout(() => setDownloadStatus(''), 5000);
      
    } catch (error) {
      setDownloadStatus('Download failed. Please try again.');
      setTimeout(() => setDownloadStatus(''), 5000);
    }
  };

  return (
    <div style={{ 
      maxWidth: '900px', 
      margin: '2rem auto', 
      padding: '0 1rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      lineHeight: '1.6'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#333', marginBottom: '0.5rem', fontSize: '2.5rem' }}>
          YouTube Downloader
        </h1>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>
          Download YouTube videos in MP4 format with multiple fallback methods
        </p>
      </div>
      
      {/* Main Input Section */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '2rem', 
        borderRadius: '12px',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <input
          type="text"
          placeholder="Paste YouTube URL here (e.g., https://www.youtube.com/watch?v=...)"
          value={url}
          onChange={e => setUrl(e.target.value)}
          style={{
            width: '100%',
            padding: '1rem',
            fontSize: '1.1rem',
            border: '2px solid #ddd',
            borderRadius: '8px',
            marginBottom: '1rem',
            boxSizing: 'border-box',
            outline: 'none',
            transition: 'border-color 0.3s'
          }}
          onFocus={e => e.target.style.borderColor = '#007bff'}
          onBlur={e => e.target.style.borderColor = '#ddd'}
        />
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={getVideoInfo}
            disabled={loading || !url.trim()}
            style={{
              flex: '1',
              minWidth: '200px',
              padding: '1rem 2rem',
              backgroundColor: loading ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1.1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              opacity: loading || !url.trim() ? 0.7 : 1
            }}
          >
            {loading ? '🔄 Getting Info...' : '📋 Get Video Info'}
          </button>
        </div>

        {/* Test URLs */}
        <div style={{ marginTop: '1rem' }}>
          <small style={{ color: '#666', display: 'block', marginBottom: '0.5rem' }}>
            Quick test with these URLs:
          </small>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {testUrls.map((testUrl, index) => (
              <button
                key={index}
                onClick={() => setUrl(testUrl)}
                style={{
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.8rem',
                  backgroundColor: '#e9ecef',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Test URL {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{ 
          backgroundColor: '#f8d7da', 
          color: '#721c24',
          padding: '1rem', 
          borderRadius: '8px',
          marginBottom: '1.5rem',
          border: '1px solid #f5c6cb'
        }}>
          <strong>❌ Error:</strong> {error}
          <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
            <strong>Troubleshooting tips:</strong>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.2rem' }}>
              <li>Make sure the YouTube URL is correct and public</li>
              <li>Try a different video if this one is age-restricted</li>
              <li>Check if the video is available in your region</li>
            </ul>
          </div>
        </div>
      )}

      {/* Download Status */}
      {downloadStatus && (
        <div style={{ 
          backgroundColor: '#d1ecf1', 
          color: '#0c5460',
          padding: '1rem', 
          borderRadius: '8px',
          marginBottom: '1.5rem',
          border: '1px solid #bee5eb'
        }}>
          <strong>📥 Download Status:</strong> {downloadStatus}
        </div>
      )}

      {/* Video Info Display */}
      {videoInfo && (
        <div style={{ 
          border: '1px solid #ddd', 
          borderRadius: '12px', 
          padding: '2rem',
          marginBottom: '1.5rem',
          backgroundColor: 'white',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {videoInfo.thumbnail && (
              <img 
                src={videoInfo.thumbnail} 
                alt="Video thumbnail" 
                style={{ 
                  width: '250px', 
                  height: 'auto', 
                  borderRadius: '8px',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
            )}
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#333', fontSize: '1.3rem' }}>
                {videoInfo.title}
              </h3>
              
              <div style={{ display: 'grid', gap: '0.5rem', fontSize: '1rem' }}>
                {videoInfo.channel && (
                  <p style={{ margin: 0, color: '#666' }}>
                    <strong>📺 Channel:</strong> {videoInfo.channel}
                  </p>
                )}
                {videoInfo.duration && (
                  <p style={{ margin: 0, color: '#666' }}>
                    <strong>⏱️ Duration:</strong> {Math.floor(videoInfo.duration / 60)}:{(videoInfo.duration % 60).toString().padStart(2, '0')}
                  </p>
                )}
                {videoInfo.views && (
                  <p style={{ margin: 0, color: '#666' }}>
                    <strong>👁️ Views:</strong> {videoInfo.views.toLocaleString()}
                  </p>
                )}
                <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                  <strong>🔧 Method:</strong> {videoInfo.method}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 style={{ marginBottom: '1rem', color: '#333' }}>📥 Download Options:</h4>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleDownload('high')}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'background-color 0.3s'
                }}
                onMouseOver={e => e.target.style.backgroundColor = '#218838'}
                onMouseOut={e => e.target.style.backgroundColor = '#28a745'}
              >
                🎬 High Quality
              </button>
              <button
                onClick={() => handleDownload('low')}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'background-color 0.3s'
                }}
                onMouseOver={e => e.target.style.backgroundColor = '#138496'}
                onMouseOut={e => e.target.style.backgroundColor = '#17a2b8'}
              >
                ⚡ Fast Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div style={{ 
        backgroundColor: '#e9ecef', 
        padding: '1.5rem', 
        borderRadius: '12px',
        fontSize: '1rem',
        color: '#495057'
      }}>
        <h4 style={{ marginTop: 0, color: '#333' }}>📖 How to use:</h4>
        <ol style={{ paddingLeft: '1.5rem', margin: '1rem 0' }}>
          <li>Copy and paste a YouTube video URL into the input field</li>
          <li>Click "Get Video Info" to preview the video details</li>
          <li>Choose your preferred quality and click the download button</li>
          <li>The download will start automatically</li>
        </ol>
        
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fff3cd', borderRadius: '6px', border: '1px solid #ffeaa7' }}>
          <strong>⚠️ Important Notes:</strong>
          <ul style={{ marginTop: '0.5rem', paddingLeft: '1.2rem', marginBottom: 0 }}>
            <li>Private videos and age-restricted content cannot be downloaded</li>
            <li>Very long videos (>1 hour) may timeout due to server limits</li>
            <li>Download speed depends on video size and server load</li>
            <li>This tool uses multiple fallback methods for better reliability</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

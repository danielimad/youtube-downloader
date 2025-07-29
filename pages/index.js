import { useState, useEffect } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [format, setFormat] = useState('best');

  const getVideoInfo = async () => {
    if (!url) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/info?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      
      if (response.ok) {
        setVideoInfo(data);
      } else {
        alert(data.error || 'Failed to get video info');
      }
    } catch (error) {
      alert('Network error');
    }
    setLoading(false);
  };

  return (
    <div style={{ 
      maxWidth: 800, 
      margin: '2rem auto', 
      padding: '0 1rem',
      fontFamily: 'system-ui, -apple-system, sans-serif' 
    }}>
      <h1>YouTube Downloader</h1>
      
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Enter YouTube URL"
          value={url}
          onChange={e => setUrl(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            fontSize: '1rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            marginBottom: '0.5rem'
          }}
        />
        
        <button
          onClick={getVideoInfo}
          disabled={loading || !url}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '0.5rem'
          }}
        >
          {loading ? 'Loading...' : 'Get Info'}
        </button>
      </div>

      {videoInfo && (
        <div style={{ 
          border: '1px solid #ddd', 
          borderRadius: '4px', 
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <h3>{videoInfo.title}</h3>
          {videoInfo.thumbnail && (
            <img 
              src={videoInfo.thumbnail} 
              alt="Thumbnail" 
              style={{ maxWidth: '200px', height: 'auto' }}
            />
          )}
          
          <div style={{ margin: '1rem 0' }}>
            <label>Format: </label>
            <select 
              value={format}
              onChange={e => setFormat(e.target.value)}
              style={{ padding: '0.25rem', marginLeft: '0.5rem' }}
            >
              <option value="best">Best Quality</option>
              <option value="worst">Fastest Download</option>
              <option value="bestaudio">Audio Only</option>
              <option value="mp4">MP4 Video</option>
            </select>
          </div>

          <a
            href={`/api/download?url=${encodeURIComponent(url)}&format=${format}`}
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#28a745',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px'
            }}
          >
            Download
          </a>
        </div>
      )}

      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        fontSize: '0.9rem'
      }}>
        <h4>Instructions:</h4>
        <ol>
          <li>Paste a YouTube URL</li>
          <li>Click "Get Info" to preview the video</li>
          <li>Select your preferred format</li>
          <li>Click "Download" to start downloading</li>
        </ol>
        
        <p><strong>Note:</strong> Large files may take time to process. The download will start automatically once ready.</p>
      </div>
    </div>
  );
}

import { useState } from 'react';

export default function Home() {
  const [videoId, setVideoId] = useState('');

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>YouTube → MP4 Downloader</h1>

      <input
        type="text"
        placeholder="Enter YouTube Video ID"
        value={videoId}
        onChange={e => setVideoId(e.target.value)}
        style={{
          width: '100%',
          padding: '0.5rem',
          margin: '1rem 0',
          fontSize: '1rem',
        }}
      />

      <a
        href={`/api/download?v=${encodeURIComponent(videoId)}`}
        style={{
          display: 'inline-block',
          padding: '0.75rem 1.5rem',
          backgroundColor: '#0070f3',
          color: '#fff',
          textDecoration: 'none',
          borderRadius: 4,
        }}
      >
        Download MP4
      </a>
    </div>
  );
}

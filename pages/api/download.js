export default async function handler(req, res) {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'Missing URL parameter' });
  }

  // Extract video ID
  const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  if (!videoIdMatch) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }

  const videoId = videoIdMatch[1];
  
  // Instead of trying to download directly (which YT blocks), 
  // provide working alternatives
  res.json({
    message: 'Direct download blocked by YouTube',
    videoId: videoId,
    alternatives: [
      {
        method: 'External Service',
        url: `https://y2mate.com/youtube/${videoId}`,
        description: 'Copy this URL and paste it in a new tab'
      },
      {
        method: 'yt-dlp Command',
        command: `yt-dlp "https://www.youtube.com/watch?v=${videoId}"`,
        description: 'Install yt-dlp and run this command on your computer'
      },
      {
        method: 'Browser Extension',
        extensions: [
          'Video DownloadHelper (Firefox/Chrome)',
          'YouTube Video Downloader (Chrome)',
          '4K Video Downloader (Desktop app)'
        ]
      }
    ],
    note: 'YouTube actively blocks server-side downloads. These alternatives work reliably.'
  });
}

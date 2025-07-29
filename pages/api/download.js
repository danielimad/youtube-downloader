import youtubedl from 'youtube-dl-exec'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end('Method Not Allowed');
  }

  const { url, format = 'best' } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'Missing URL parameter' });
  }

  // Validate YouTube URL
  const youtubeRegex = /(?:youtube\.com|youtu\.be)/;
  if (!youtubeRegex.test(url)) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }

  try {
    // Set headers to prevent timeout
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/octet-stream');
    
    // Get video info first
    const info = await youtubedl(url, {
      dumpSingleJson: true,
      noWarnings: true,
      noCallHome: true,
      addHeader: [
        'User-Agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      ]
    });

    const title = info.title?.replace(/[^A-Za-z0-9 ._-]/g, '').slice(0, 100) || 'video';
    const ext = format.includes('audio') ? 'mp3' : 'mp4';
    
    res.setHeader('Content-Disposition', `attachment; filename="${title}.${ext}"`);

    // Stream the download
    const stream = youtubedl.exec(url, {
      format: format,
      output: '-',
      addHeader: [
        'User-Agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      ]
    });

    stream.stdout.pipe(res);
    
    stream.on('error', (error) => {
      console.error('Download error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Download failed' });
      }
    });

  } catch (error) {
    console.error('Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Failed to process video',
        message: error.message 
      });
    }
  }
}

// Add Vercel configuration
export const config = {
  maxDuration: 30, // 30 seconds max
}

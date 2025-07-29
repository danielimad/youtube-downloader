import playdl from 'play-dl';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end('Method Not Allowed');
  }

  const { url, quality = 'high' } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'Missing URL parameter' });
  }

  // Set headers to prevent timeout
  req.socket.setTimeout(0);
  res.socket.setTimeout(0);

  try {
    // Validate URL
    const isValidUrl = playdl.yt_validate(url) === 'video';
    if (!isValidUrl) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    const info = await playdl.video_info(url);
    
    if (!info) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Get the best format based on quality preference
    let selectedFormat;
    const formats = info.format.filter(f => f.url && f.mimeType?.includes('video'));
    
    if (quality === 'high') {
      selectedFormat = formats.find(f => f.quality === '720p') || 
                     formats.find(f => f.quality === '480p') || 
                     formats[0];
    } else {
      selectedFormat = formats.find(f => f.quality === '360p') || 
                     formats.find(f => f.quality === '240p') || 
                     formats[formats.length - 1];
    }

    if (!selectedFormat) {
      return res.status(404).json({ error: 'No suitable format found' });
    }

    // Sanitize filename
    const title = info.video_details.title
      .replace(/[^A-Za-z0-9 ._-]/g, '')
      .slice(0, 100);

    // Set response headers
    res.setHeader('Content-Disposition', `attachment; filename="${title}.mp4"`);
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Stream the video
    const stream = await playdl.stream(url, {
      quality: selectedFormat.quality
    });

    stream.stream.pipe(res);

    stream.stream.on('error', (error) => {
      console.error('Stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Streaming failed' });
      }
    });

  } catch (error) {
    console.error('Download error:', error);
    
    let errorMessage = 'Download failed';
    if (error.message?.includes('private')) {
      errorMessage = 'Video is private or age-restricted';
    } else if (error.message?.includes('unavailable')) {
      errorMessage = 'Video is unavailable';
    } else if (error.message?.includes('timeout')) {
      errorMessage = 'Request timed out';
    }

    if (!res.headersSent) {
      res.status(500).json({ 
        error: errorMessage,
        details: error.message 
      });
    }
  }
}

// Add Vercel configuration
export const config = {
  maxDuration: 30,
  regions: ['iad1']
}

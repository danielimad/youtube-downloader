// pages/api/download.js - Simplified working approach
import ytdl from '@distube/ytdl-core';
import { extractVideoId, sanitizeFilename, createUserAgent } from '../../lib/youtube-utils.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, quality = 'high' } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'Missing URL parameter' });
  }

  const videoId = extractVideoId(url);
  if (!videoId) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }

  const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
  
  // Set long timeout
  req.socket.setTimeout(300000); // 5 minutes
  res.socket.setTimeout(300000);

  try {
    // Check if video exists and get info
    const info = await ytdl.getInfo(youtubeUrl, {
      requestOptions: {
        headers: {
          'User-Agent': createUserAgent(),
        }
      }
    });

    const title = sanitizeFilename(info.videoDetails.title);
    
    // Find the best format
    const formats = ytdl.filterFormats(info.formats, 'audioandvideo');
    if (formats.length === 0) {
      return res.status(404).json({ error: 'No suitable formats found' });
    }

    // Set response headers BEFORE starting the stream
    res.writeHead(200, {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${title}.mp4"`,
      'Transfer-Encoding': 'chunked'
    });

    // Create stream with simple options
    const stream = ytdl(youtubeUrl, {
      quality: quality === 'high' ? 'highest' : 'lowest',
      filter: format => format.hasVideo && format.hasAudio,
      requestOptions: {
        headers: {
          'User-Agent': createUserAgent(),
        }
      }
    });

    // Pipe stream directly to response
    stream.pipe(res);

    // Handle errors
    stream.on('error', (error) => {
      console.error('Stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Stream failed', details: error.message });
      }
    });

    // Clean up on close
    res.on('close', () => {
      stream.destroy();
    });

  } catch (error) {
    console.error('Download error:', error);
    
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Download failed',
        details: error.message,
        suggestion: 'This video may be restricted or unavailable for download'
      });
    }
  }
}

export const config = {
  maxDuration: 60, // Increase timeout
  regions: ['iad1']
}

import ytdl from '@distube/ytdl-core';
import { extractVideoId, sanitizeFilename, createUserAgent } from '../../lib/youtube-utils.js';

async function downloadWithYtdl(videoId, quality, res) {
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  
  const options = {
    quality: quality === 'high' ? 'highestvideo' : 'lowestvideo',
    filter: format => format.container === 'mp4' && format.hasVideo && format.hasAudio,
    requestOptions: {
      headers: {
        'User-Agent': createUserAgent(),
        'Accept-Language': 'en-US,en;q=0.9',
      }
    },
    highWaterMark: 1 << 25, // 32MB buffer
  };

  // Get video info for filename
  const info = await ytdl.getBasicInfo(url, options);
  const title = sanitizeFilename(info.videoDetails.title);
  
  // Set headers
  res.setHeader('Content-Disposition', `attachment; filename="${title}.mp4"`);
  res.setHeader('Content-Type', 'video/mp4');
  res.setHeader('Accept-Ranges', 'bytes');

  // Create and pipe stream
  const stream = ytdl(url, options);
  
  stream.on('error', (error) => {
    throw error;
  });

  stream.pipe(res);
  
  return new Promise((resolve, reject) => {
    stream.on('end', resolve);
    stream.on('error', reject);
    res.on('close', resolve);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end('Method Not Allowed');
  }

  const { url, quality = 'high' } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'Missing URL parameter' });
  }

  const videoId = extractVideoId(url);
  if (!videoId) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }

  // Set timeout
  req.socket.setTimeout(60000);
  res.socket.setTimeout(60000);

  try {
    await downloadWithYtdl(videoId, quality, res);
  } catch (error) {
    console.error('Download error:', error);
    
    if (!res.headersSent) {
      let errorMessage = 'Download failed';
      
      if (error.message?.includes('Sign in to confirm')) {
        errorMessage = 'Video requires age verification';
      } else if (error.message?.includes('private')) {
        errorMessage = 'Video is private';
      } else if (error.message?.includes('unavailable')) {
        errorMessage = 'Video is unavailable';
      } else if (error.message?.includes('formats')) {
        errorMessage = 'No suitable video format found';
      }

      res.status(500).json({ 
        error: errorMessage,
        details: error.message,
        videoId: videoId
      });
    }
  }
}

export const config = {
  maxDuration: 60, // Increase timeout
  regions: ['iad1']
}

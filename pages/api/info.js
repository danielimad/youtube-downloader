import ytdl from '@distube/ytdl-core';
import { extractVideoId, sanitizeFilename, createUserAgent } from '../../lib/youtube-utils.js';

// Method 1: Using ytdl-core with proper headers
async function getInfoWithYtdl(videoId) {
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  
  const options = {
    requestOptions: {
      headers: {
        'User-Agent': createUserAgent(),
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    }
  };

  const info = await ytdl.getBasicInfo(url, options);
  
  return {
    title: info.videoDetails.title,
    duration: parseInt(info.videoDetails.lengthSeconds),
    thumbnail: info.videoDetails.thumbnails?.[0]?.url,
    channel: info.videoDetails.author.name,
    views: parseInt(info.videoDetails.viewCount),
    uploadDate: info.videoDetails.publishDate,
    available: true,
    method: 'ytdl-core'
  };
}

// Method 2: Direct API approach (fallback)
async function getInfoWithAPI(videoId) {
  const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
  
  if (!response.ok) {
    throw new Error('Video not found or private');
  }
  
  const data = await response.json();
  
  return {
    title: data.title,
    duration: null, // Not available via oembed
    thumbnail: data.thumbnail_url,
    channel: data.author_name,
    views: null,
    uploadDate: null,
    available: true,
    method: 'oembed-api'
  };
}

export default async function handler(req, res) {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'Missing URL parameter' });
  }

  const videoId = extractVideoId(url);
  if (!videoId) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }

  const methods = [getInfoWithYtdl, getInfoWithAPI];
  let lastError = null;

  // Try each method until one works
  for (const method of methods) {
    try {
      const info = await method(videoId);
      return res.json(info);
    } catch (error) {
      console.error(`Method ${method.name} failed:`, error.message);
      lastError = error;
      continue;
    }
  }

  // If all methods failed
  console.error('All methods failed:', lastError);
  
  let errorMessage = 'Failed to get video info';
  if (lastError?.message?.includes('private')) {
    errorMessage = 'Video is private or age-restricted';
  } else if (lastError?.message?.includes('unavailable')) {
    errorMessage = 'Video is unavailable';
  } else if (lastError?.message?.includes('not found')) {
    errorMessage = 'Video not found';
  }

  res.status(500).json({ 
    error: errorMessage,
    details: lastError?.message,
    videoId: videoId
  });
}

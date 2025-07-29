export default async function handler(req, res) {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'Missing URL parameter' });
  }

  try {
    // Simple URL validation
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (!videoIdMatch) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    const videoId = videoIdMatch[1];

    // Use YouTube's oembed API (more reliable)
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(oembedUrl);
    
    if (!response.ok) {
      throw new Error('Video not found or private');
    }
    
    const data = await response.json();
    
    res.json({
      title: data.title,
      thumbnail: data.thumbnail_url,
      channel: data.author_name,
      available: true,
      videoId: videoId,
      directUrl: `https://www.youtube.com/watch?v=${videoId}`
    });

  } catch (error) {
    console.error('Info error:', error);
    res.status(500).json({ 
      error: 'Failed to get video info',
      details: error.message 
    });
  }
}

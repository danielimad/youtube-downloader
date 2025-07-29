import playdl from 'play-dl';

export default async function handler(req, res) {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'Missing URL parameter' });
  }

  try {
    // Validate YouTube URL
    const isValidUrl = playdl.yt_validate(url) === 'video';
    if (!isValidUrl) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    const info = await playdl.video_info(url);
    
    if (!info) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Get available formats
    const formats = info.format.filter(f => f.url && (f.mimeType?.includes('video') || f.mimeType?.includes('audio')));
    
    res.json({
      title: info.video_details.title,
      duration: info.video_details.durationInSec,
      thumbnail: info.video_details.thumbnails?.[0]?.url,
      channel: info.video_details.channel?.name,
      views: info.video_details.views,
      uploadDate: info.video_details.uploadedAt,
      available: formats.length > 0,
      formats: formats.slice(0, 10).map(f => ({
        quality: f.quality || 'unknown',
        type: f.mimeType?.includes('video') ? 'video' : 'audio',
        container: f.container,
        size: f.contentLength ? `${(f.contentLength / 1024 / 1024).toFixed(1)} MB` : 'unknown'
      }))
    });

  } catch (error) {
    console.error('Info error:', error);
    
    let errorMessage = 'Failed to get video info';
    if (error.message?.includes('private')) {
      errorMessage = 'Video is private or age-restricted';
    } else if (error.message?.includes('unavailable')) {
      errorMessage = 'Video is unavailable';
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: error.message 
    });
  }
}

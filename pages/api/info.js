import youtubedl from 'youtube-dl-exec'

export default async function handler(req, res) {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'Missing URL parameter' });
  }

  try {
    const info = await youtubedl(url, {
      dumpSingleJson: true,
      noWarnings: true,
      noCallHome: true,
      addHeader: [
        'User-Agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      ]
    });

    res.json({
      title: info.title,
      duration: info.duration,
      thumbnail: info.thumbnail,
      formats: info.formats?.map(f => ({
        format_id: f.format_id,
        ext: f.ext,
        quality: f.format_note,
        filesize: f.filesize
      })) || []
    });

  } catch (error) {
    console.error('Info error:', error);
    res.status(500).json({ error: 'Failed to get video info' });
  }
}

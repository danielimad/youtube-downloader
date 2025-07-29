import ytdl from 'ytdl-core';

export default async function handler(req, res) {
  // only allow GET
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).send('Method Not Allowed');
  }

  const v = req.query.v;
  if (!v || !ytdl.validateID(v)) {
    return res.status(400).send('Invalid or missing video ID');
  }

  const url = `https://www.youtube.com/watch?v=${v}`;
  // disable serverless timeouts
  req.socket.setTimeout(0);
  res.socket.setTimeout(0);

  try {
    // fetch info to build a safe filename
    const info = await ytdl.getInfo(url);
    const safeTitle = info.videoDetails.title
      .replace(/[^a-z0-9_\-]/gi, '_')
      .substring(0, 100);

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${safeTitle}.mp4"`
    );
    res.setHeader('Content-Type', 'video/mp4');

    // stream highest-quality MP4
    ytdl(url, {
      filter: f => f.container === 'mp4' && f.hasAudio && f.hasVideo,
      quality: 'highest',
      highWaterMark: 1 << 25,  // 32 MB buffer
    }).pipe(res);

  } catch (err) {
    console.error('Download API error:', err);
    res.status(500).send('Download failed');
  }
}

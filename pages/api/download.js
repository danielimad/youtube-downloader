import ytdl from 'ytdl-core';

export default async function handler(req, res) {
  const { v } = req.query;
  if (!v || !ytdl.validateID(v)) {
    res.status(400).send('Invalid or missing video ID');
    return;
  }

  const url = `https://www.youtube.com/watch?v=${v}`;
  req.socket.setTimeout(0);
  res.socket.setTimeout(0);

  const info = await ytdl.getInfo(url);
  const safeTitle = info.videoDetails.title
    .replace(/[^a-z0-9_\-]/gi, '_')
    .substring(0, 100);

  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${safeTitle}.mp4"`
  );
  res.setHeader('Content-Type', 'video/mp4');

  ytdl(url, {
    filter: f => f.container === 'mp4' && f.hasAudio && f.hasVideo,
    quality: 'highest',
    highWaterMark: 1 << 25,
  }).pipe(res);
}

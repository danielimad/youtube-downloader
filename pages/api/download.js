import ytdl from 'ytdl-core';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end('Method Not Allowed');
  }

  const { v } = req.query;
  if (!v) {
    return res.status(400).end('Missing video ID');
  }

  const url = 'https://www.youtube.com/watch?v=' + v;
  // Disable socket timeouts to allow long downloads
  req.socket.setTimeout(0);
  res.socket.setTimeout(0);

  try {
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^A-z0-9 .-]/gi, '').slice(0, 100);
    res.setHeader('Content-Disposition', 'attachment; filename="' + title + '.mp4"');
    res.setHeader('Content-Type', 'video/mp4');
    const stream = ytdl(url, { quality: '18' });
    stream.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).end('Failed to download video');
  }
}

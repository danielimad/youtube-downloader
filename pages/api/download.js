import ytdl from '@distube/ytdl-core';

export default async function handler(req, res) {
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
    // Sanitize title to create a safe filename
    const title = info.videoDetails.title
      .replace(/[^A-Za-z0-9 ._-]/g, '')
      .slice(0, 100);
    res.setHeader('Content-Disposition', 'attachment; filename="' + title + '.mp4"');
    res.setHeader('Content-Type', 'video/mp4');
    const stream = ytdl(url, {
      filter: 'audioandvideo',
      quality: 'highest',
      highWaterMark: 1 << 25,
    });
    stream.pipe(res);
  } catch (err) {
    console.error(err);
    const message = err && err.message ? err.message : 'Failed to download video';
    res.status(500).end(message);
  }
}

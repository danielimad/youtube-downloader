import ytdl from 'ytdl-core';

const REQUEST_HEADERS = {
  // a common desktop UA – YouTube expects a “browser”
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
    'AppleWebKit/537.36 (KHTML, like Gecko) ' +
    'Chrome/115.0.0.0 Safari/537.36',
  Accept: '*/*',
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).send('Method Not Allowed');
  }

  const v = req.query.v;
  if (!v || !ytdl.validateID(v)) {
    return res.status(400).send('Invalid or missing video ID');
  }

  const url = `https://www.youtube.com/watch?v=${v}`;
  req.socket.setTimeout(0);
  res.socket.setTimeout(0);

  try {
    // fetch metadata with headers
    const info = await ytdl.getInfo(url, {
      requestOptions: { headers: REQUEST_HEADERS },
    });

    const safeTitle = info.videoDetails.title
      .replace(/[^a-z0-9_\-]/gi, '_')
      .substring(0, 100);

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${safeTitle}.mp4"`
    );
    res.setHeader('Content-Type', 'video/mp4');

    // stream with the same headers
    ytdl(url, {
      filter: f => f.container === 'mp4' && f.hasAudio && f.hasVideo,
      quality: 'highest',
      requestOptions: { headers: REQUEST_HEADERS },
      highWaterMark: 1 << 25, // 32 MB
    }).pipe(res);
  } catch (err) {
    console.error('Download API error:', err);
    res.status(500).send('Download failed');
  }
}

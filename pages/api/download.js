import { exec } from 'yt-dlp-exec';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end('Method Not Allowed');
  }

  const v = req.query.v;
  if (!v) {
    return res.status(400).end('Missing video ID');
  }

  const url = `https://www.youtube.com/watch?v=${v}`;
  req.socket.setTimeout(0);
  res.socket.setTimeout(0);

  // build a safe filename via a HEAD request
  const titleProc = exec(url, {
    dumpSingleJson: true,
    skipDownload: true,
    noWarnings: true,
  });

  let filename;
  titleProc.stdout.on('data', chunk => {
    try {
      const info = JSON.parse(chunk.toString());
      const safe = info.title.replace(/[^a-z0-9_\-]/gi, '_').slice(0,100);
      filename = safe + '.mp4';
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'video/mp4');
    } catch {}
  });

  titleProc.on('close', () => {
    // now stream with bestvideo+audio merged into MP4
    const dl = exec(url, {
      format: 'bestaudio+bestvideo[ext=mp4]',
      output: '-',     // pipe to stdout
      limitRate: '0',  // no throttling
      noCheckCertificate: true,
      noWarnings: true,
    }, { stdio: ['ignore','pipe','pipe'] });

    dl.stdout.pipe(res);
    dl.stderr.on('data', d => console.error('yt-dlp error:', d.toString()));
  });

  titleProc.stderr.on('data', d => console.error('yt-dlp-info error:', d.toString()));
}

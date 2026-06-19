import express from 'express';

const router = express.Router();
const proxyImageCache = new Map();

router.get('/assets/:filename', async (req, res) => {
  res.status(404).send('Asset not found');
});

export const uploadToGcs = async (url, req) => {
  return url;
};

router.get('/proxy-image', async (req, res) => {
  const rawUrl = req.query.url;
  if (!rawUrl) return res.status(400).send('URL is required');

  const imageUrl = rawUrl.includes('enhance=') ? rawUrl : (rawUrl + (rawUrl.includes('?') ? '&' : '?') + 'enhance=false');

  const cached = proxyImageCache.get(imageUrl);
  if (cached) {
    res.setHeader('Content-Type', cached.contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    return res.send(cached.buffer);
  }

  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  ];

  const fetchWithRetry = async (url, retries = 5) => {
    try {
      const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];
      const response = await fetch(url, {
        headers: { 'User-Agent': randomUA },
        signal: AbortSignal.timeout(8000)
      });

      if (!response.ok) {
        if (retries > 0 && response.status !== 400 && response.status !== 401) {
          const waitTime = (6 - retries) * 2000;
          console.log(`⚠️ Proxy failed (${response.status}). Retrying in ${waitTime / 1000}s... (${retries} left)`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          return fetchWithRetry(url, retries - 1);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    } catch (err) {
      if (retries > 0) {
        const waitTime = (6 - retries) * 2000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return fetchWithRetry(url, retries - 1);
      }
      throw err;
    }
  };

  try {
    const response = await fetchWithRetry(imageUrl);
    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/png';
    const bufferObj = Buffer.from(buffer);

    proxyImageCache.set(imageUrl, { contentType, buffer: bufferObj });

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.send(bufferObj);
  } catch (error) {
    console.error('❌ Proxy error after 5 retries, serving fallback image:', error.message);
    const svgFallback = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <rect width="400" height="400" fill="#1a1a1a"/>
      <circle cx="200" cy="150" r="50" fill="#333333"/>
      <path d="M165 150 L190 125 L210 145 L235 120 L235 180 L165 180 Z" fill="#4d4d4d"/>
      <text x="50%" y="260" font-family="sans-serif" font-size="18" fill="#888888" dominant-baseline="middle" text-anchor="middle">Asset Temporarily Unavailable</text>
      <text x="50%" y="290" font-family="sans-serif" font-size="14" fill="#555555" dominant-baseline="middle" text-anchor="middle">SERA Commerce OS • Fallback Render</text>
    </svg>`;
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'no-cache');
    res.status(200).send(svgFallback);
  }
});

export default router;

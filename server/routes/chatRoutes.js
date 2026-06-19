import express from 'express';
import { storeMemory } from '../services/mcpService.js';

const router = express.Router();
const ADK_SERVICE_URL = process.env.ADK_SERVICE_URL || 'http://localhost:8000';

router.post('/chat', async (req, res) => {
  const { input, history = [], storeContext = {}, images = [], chatMode = 'plan' } = req.body;
  console.log(`💬 [PROXY→ADK] chatMode=${chatMode} | input="${(input || '').substring(0, 50)}"`);

  res.setHeader('Content-Type', 'application/x-ndjson');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  try {
    const adkRes = await fetch(`${ADK_SERVICE_URL}/api/agent/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, history, storeContext, chatMode, images })
    });

    if (!adkRes.ok || !adkRes.body) {
      const errText = await adkRes.text().catch(() => 'Unknown error');
      console.error('❌ ADK service error:', errText);
      res.write(JSON.stringify({ type: 'final', text: 'AI service unavailable. Please try again.', action: 'idle', params: {} }) + '\n');
      return res.end();
    }

    const reader = adkRes.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      res.write(chunk);
    }
    res.end();
  } catch (err) {
    console.error('❌ Proxy error /api/chat:', err.message);
    res.write(JSON.stringify({ type: 'final', text: `Proxy error: ${err.message}`, action: 'idle', params: {} }) + '\n');
    res.end();
  }
});

router.post('/remember', async (req, res) => {
  const { action, status, details } = req.body;
  await storeMemory('actions', { action, status, details });
  res.json({ success: true });
});

export default router;

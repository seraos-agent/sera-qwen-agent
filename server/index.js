import express from 'express';
import cors from 'cors';
import assetRoutes, { uploadToGcs } from './routes/assetRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import storeRoutes from './routes/storeRoutes.js';
import './services/cleanupService.js';
import dotenv from 'dotenv';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import {
  initLocalDb,
  localInsert,
  localFind,
  localUpdate,
  localDelete
} from './dbHelper.js';

// Removed Google Cloud Storage
const GCS_BUCKET_NAME = 'sera-commerce-assets-495721';

dotenv.config();

// Global memory caches and concurrency trackers for visual orchestration stability
const imagePromptCache = new Map();
const proxyImageCache = new Map(); // In-memory cache for proxied images
let globalActiveWorkers = 0;

// Health state monitoring
const healthState = {
  mongo: 'disconnected',
  mcp: 'offline',
  vertex: 'unknown'
};
const GLOBAL_MAX_CONCURRENCY = 6;


const acquireGlobalSlot = async () => {
  while (globalActiveWorkers >= GLOBAL_MAX_CONCURRENCY) {
    await new Promise(r => setTimeout(r, 100)); // check again in 100ms
  }
  globalActiveWorkers++;
};

const app = express();
app.use(express.json());
app.use(cors());

// --- MODULAR ROUTES ---
app.use('/api', assetRoutes);
app.use('/api', chatRoutes);

const port = process.env.PORT || 3001;

// --- COMMERCE CONFIG ---
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'sera-495721';

import { setupMCP, testMongoConnection, runLocalMock, callFlexibleMcpTool, storeMemory, setupCollections, getMcpClient } from './services/mcpService.js';

setupMCP();
setupCollections();

// 3. Helper to Add Guest Session Fields
function addGuestSessionFields(doc, sessionId = 'guest_default', type = 'guest') {
  const now = new Date();
  const expiresAt = type === 'guest' ? new Date(now.getTime() + 24 * 3600 * 1000) : null;
  return {
    ...doc,
    session_id: sessionId,
    type: type,
    created_at: now,
    expires_at: expiresAt
  };
}

app.get('/api/debug-mcp', async (req, res) => {
  try {
    const mcpClient = getMcpClient();
    if (!mcpClient) return res.status(500).json({ error: "MCP not connected" });
    const dbs = await mcpClient.callTool({ name: 'list-databases', arguments: {} });
    res.json({ dbs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API Endpoint: GET /api/health
app.get('/api/health', (req, res) => {
  return res.json(healthState);
});

app.use('/', storeRoutes);


// --- API ENDPOINTS ---


// --- CENTRALIZED EXECUTION TRUTH SYSTEM (In-Memory Tracking) ---
const executionTasks = new Map();

app.post('/api/execute-task', async (req, res) => {
  const { action, prompt, taskId, itemId } = req.body;
  if (!action || !prompt) return res.status(400).json({ status: "failed", error: "Missing action or prompt" });

  const maxRetries = 3;
  let attempt = 0;
  let lastError = "Unknown error";
  let httpStatus = 500;

  const uniqueSalt = Math.floor(Math.random() * 1000000);
  const targetUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?seed=${uniqueSalt}&model=turbo`;

  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  ];

  while (attempt <= maxRetries) {
    try {
      const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout per attempt

      const response = await fetch(targetUrl, {
        headers: { 'User-Agent': randomUA },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      httpStatus = response.status;

      if (response.ok) {
        const buffer = await response.arrayBuffer();
        if (buffer.byteLength > 1000) { // Verify asset existence & validity
          const result = {
            action,
            status: "success",
            asset_created: true,
            http_status: httpStatus,
            retry_count: attempt,
            url: targetUrl,
            proxy_url: `${req.protocol}://${req.get('host')}/api/proxy-image?url=${encodeURIComponent(targetUrl)}`,
            itemId
          };

          if (taskId && executionTasks.has(taskId)) {
            const task = executionTasks.get(taskId);
            task.completed += 1;
            task.pending = Math.max(0, task.pending - 1);
            task.results.push(result);
            executionTasks.set(taskId, task);
          }

          return res.json(result);
        } else {
          throw new Error("Received empty or invalid image buffer");
        }
      } else {
        throw new Error(`HTTP Error ${httpStatus}`);
      }
    } catch (err) {
      lastError = err.message;
      attempt++;
      if (attempt <= maxRetries) {
        const backoffMs = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
        console.log(`Ã¢Å¡Â Ã¯Â¸Â Task [${action}] failed (${lastError}). Retrying in ${backoffMs / 1000}s... (Attempt ${attempt}/${maxRetries})`);
        await new Promise(r => setTimeout(r, backoffMs));
      }
    }
  }

  console.error(`Ã¢ÂÅ’ Task [${action}] reached final failure state after ${maxRetries} retries: ${lastError}`);
  const failureResult = {
    action,
    status: "failed",
    asset_created: false,
    http_status: httpStatus,
    retry_count: maxRetries,
    error: lastError,
    itemId
  };

  if (taskId && executionTasks.has(taskId)) {
    const task = executionTasks.get(taskId);
    task.failed += 1;
    task.pending = Math.max(0, task.pending - 1);
    task.results.push(failureResult);
    executionTasks.set(taskId, task);
  }

  return res.json(failureResult);
});

// Ã¢â€â‚¬Ã¢â€â‚¬ /api/chat Ã¢â€â‚¬Ã¢â€â‚¬ Transparent streaming proxy Ã¢â€ â€™ Python ADK service (port 8000)
const ADK_SERVICE_URL = process.env.ADK_SERVICE_URL || 'http://localhost:8000';

app.post('/api/chat', async (req, res) => {
  const { input, history = [], storeContext = {}, images = [], chatMode = 'plan' } = req.body;
  console.log(`Ã°Å¸â€™Â¬ [PROXYÃ¢â€ â€™ADK] chatMode=${chatMode} | input="${(input || '').substring(0, 50)}"`);

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
      console.error('Ã¢ÂÅ’ ADK service error:', errText);
      res.write(JSON.stringify({ type: 'final', text: 'AI service unavailable. Please try again.', action: 'idle', params: {} }) + '\n');
      return res.end();
    }

    // Stream NDJSON chunks from Python ADK directly to the browser
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
    console.error('Ã¢ÂÅ’ Proxy error /api/chat:', err.message);
    res.write(JSON.stringify({ type: 'final', text: `Proxy error: ${err.message}`, action: 'idle', params: {} }) + '\n');
    res.end();
  }
});

app.post('/api/remember', async (req, res) => {
  const { action, status, details } = req.body;
  await storeMemory('actions', { action, status, details });
  // AI personality summarisation is now delegated to Python ADK service
  res.json({ success: true });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', mcpConnected: !!mcpClient, project: PROJECT_ID, adkServiceUrl: ADK_SERVICE_URL });
});

app.get('/', (req, res) => {
  res.json({
    name: "SERA AI Commerce OS Backend",
    version: "1.0.0",
    status: "online",
    mcp_server: "mongodb-mcp-server",
    message: "Welcome to SERA AI Commerce OS API Server. All systems operational.",
    endpoints: {
      guest: "POST /api/guest/session",
      publish: "POST /api/publish",
      stores: "GET /api/stores",
      analytics: "GET /api/analytics",
      campaigns_create: "POST /api/campaigns",
      campaigns_activate: "PATCH /api/campaigns/activate",
      chat: "POST /api/chat",
      remember: "POST /api/remember",
      health: "GET /health"
    }
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`\n=========================================`);
  console.log(`🚀 SERA Backend listening at http://0.0.0.0:${port}`);
  console.log(`=========================================\n`);
});


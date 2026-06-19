import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import {
  localInsert,
  localFind,
  localUpdate,
  localDelete
} from '../dbHelper.js';

export const healthState = {
  mongo: 'disconnected',
  mcp: 'offline',
  vertex: 'unknown'
};

let mcpClient = null;
let mcpTools = [];

export async function testMongoConnection(uri) {
  const { MongoClient } = await import('mongodb');
  console.log("🩺 Running Hard Health Check on MongoDB Atlas...");
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 15000 });
  try {
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    healthState.mongo = 'connected';
    console.log("✅ [Health Check] MongoDB Atlas is CONNECTED.");
    global.nativeMongoClient = client; // Keep alive for Native Bypass
  } catch (err) {
    healthState.mongo = 'failed';
    console.error("❌ [Health Check] MongoDB Atlas unavailable:", err.message);
    console.warn("⚠️ System will run in degraded mode using Local JSON Fallback.");
    await client.close();
  }
}

export async function setupMCP() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sera';
  console.log(`[DEBUG] setupMCP called. MONGODB_URI starts with: ${mongoUri.substring(0, 25)}...`);

  await testMongoConnection(mongoUri);

  if (healthState.mongo !== 'connected') {
    console.log("ℹ️ Skipping MongoDB MCP server setup since MongoDB is not connected.");
    return;
  }

  try {
    const transport = new StdioClientTransport({
      command: process.platform === 'win32' ? 'npx.cmd' : 'npx',
      args: ['-y', 'mongodb-mcp-server@latest'],
      env: { ...process.env, MDB_MCP_CONNECTION_STRING: mongoUri }
    });
    mcpClient = new Client({ name: 'sera-backend-client', version: '1.0.0' }, { capabilities: {} });
    await mcpClient.connect(transport);
    console.log(`✅ Connected to MongoDB MCP Server`);
    const toolsResponse = await mcpClient.listTools();
    mcpTools = toolsResponse.tools || [];
    console.log(`✅ Loaded ${mcpTools.length} tools from MongoDB MCP`);

    healthState.mcp = healthState.mongo === 'connected' ? 'healthy' : 'degraded (fallback active)';
  } catch (error) {
    healthState.mcp = 'failed';
    console.error('❌ Failed to connect to MCP Server:', error.message);
  }
}

export function runLocalMock(possibleNames, args) {
  const collection = args?.collection || 'system';
  const isFind = possibleNames.some(n => n.includes('find') || n.includes('get'));
  const isInsert = possibleNames.some(n => n.includes('insert') || n.includes('create'));
  const isUpdate = possibleNames.some(n => n.includes('update'));
  const isDelete = possibleNames.some(n => n.includes('delete'));

  try {
    if (isInsert) return localInsert(collection, args.document);
    if (isFind) return localFind(collection, args.filter || args.query, args.limit);
    if (isUpdate) return localUpdate(collection, args.filter || args.query, args.update);
    if (isDelete) return localDelete(collection, args.filter || args.query);
  } catch (err) {
    console.error(`❌ Local Mock execution error on [${collection}]:`, err.message);
  }
  return { success: true };
}

export async function callFlexibleMcpTool(possibleNames, args) {
  const collection = args?.collection || 'system';

  if (healthState.mongo === 'connected' && global.nativeMongoClient) {
    try {
      console.log(`⚡ [Native MongoDB] Bypassing MCP for Tool: "${possibleNames[0]}" | Collection: "${collection}"`);
      const db = global.nativeMongoClient.db('sera');
      const coll = db.collection(collection);

      const isFind = possibleNames.some(n => n.includes('find') || n.includes('get'));
      const isInsert = possibleNames.some(n => n.includes('insert') || n.includes('create'));
      const isUpdate = possibleNames.some(n => n.includes('update'));
      const isDelete = possibleNames.some(n => n.includes('delete'));

      if (isFind) {
        const query = args.filter || args.query || {};
        const limit = args.limit || 0;
        const docs = await coll.find(query).limit(limit).toArray();
        return { success: true, data: docs };
      }
      if (isInsert) {
        if (args.document) {
          const res = await coll.insertOne(args.document);
          return { success: true, data: { insertedId: res.insertedId, ...args.document } };
        } else if (args.documents) {
          const res = await coll.insertMany(args.documents);
          return { success: true, data: { insertedCount: res.insertedCount } };
        }
      }
      if (isUpdate) {
        const query = args.filter || args.query || {};
        const res = await coll.updateMany(query, args.update);
        return { success: true, data: { modifiedCount: res.modifiedCount } };
      }
      if (isDelete) {
        const query = args.filter || args.query || {};
        const res = await coll.deleteMany(query);
        return { success: true, data: { deletedCount: res.deletedCount } };
      }
    } catch (err) {
      console.error(`❌ [Native MongoDB] Action failed:`, err.message);
      console.warn(`⚠️ Falling back to Local DB...`);
      return runLocalMock(possibleNames, args);
    }
  }

  if (!mcpClient) {
    return runLocalMock(possibleNames, args);
  }

  let targetTool = null;
  for (const name of possibleNames) {
    if (mcpTools.some(t => t.name === name)) {
      targetTool = name;
      break;
    }
  }

  if (!targetTool) {
    if (mcpTools.some(t => t.name === 'insert-many') && possibleNames.includes('insert_document')) targetTool = 'insert-many';
    else if (mcpTools.some(t => t.name === 'update-many') && possibleNames.includes('update_document')) targetTool = 'update-many';
    else if (mcpTools.some(t => t.name === 'delete-many') && possibleNames.includes('delete_document')) targetTool = 'delete-many';
    else targetTool = possibleNames[0];
  }

  if (targetTool === 'insert-many' && args.document) {
    args.documents = [args.document];
    delete args.document;
  }

  try {
    const mcpArgs = { database: 'sera', ...args };
    const result = await mcpClient.callTool({
      name: targetTool,
      arguments: mcpArgs
    }, { timeout: 120000 });
    
    if (result.isError) {
      throw new Error(result.content?.[0]?.text || "MCP tool returned an error");
    }
    console.log(`✅ [MongoDB MCP Success] Action on "${collection}" completed.`);

    if (result.content && Array.isArray(result.content)) {
      for (const block of result.content) {
        if (block.type === 'text' && block.text) {
          const match = block.text.match(/<untrusted-user-data-[^>]+>\s*(\[\{.*?\}\]|\{.*?\})\s*<\/untrusted-user-data-[^>]+>/s);
          if (match && match[1]) {
            try {
              const parsed = JSON.parse(match[1]);
              result.documents = Array.isArray(parsed) ? parsed : [parsed];
            } catch (e) { }
          } else if (block.text.trim().startsWith('[') || block.text.trim().startsWith('{')) {
            try {
              const parsed = JSON.parse(block.text);
              result.documents = Array.isArray(parsed) ? parsed : [parsed];
            } catch (e) { }
          }
        }
      }
    }
    return result;
  } catch (err) {
    return runLocalMock(possibleNames, args);
  }
}

export async function storeMemory(collection, document) {
  try {
    await callFlexibleMcpTool(['insert_document', 'insert-one', 'insertOne'], {
      collection,
      document: { ...document, timestamp: new Date().toISOString() }
    });
    console.log(`🧠 Memory Stored: ${collection}`);
  } catch (err) {
    console.error(`❌ Failed to store memory:`, err.message);
  }
}

export async function setupCollections() {
  let attempts = 0;
  while ((!mcpClient || mcpTools.length === 0) && attempts < 60) {
    await new Promise(resolve => setTimeout(resolve, 500));
    attempts++;
  }

  if (!mcpClient) {
    console.error("❌ setupCollections: MCP Client failed to connect within timeout.");
    return;
  }

  console.log("📦 Starting MongoDB collections & index setup...");

  const collections = ['stores', 'products', 'analytics', 'campaigns'];
  for (const col of collections) {
    try {
      await callFlexibleMcpTool(['create_collection', 'create-collection', 'createCollection'], { collection: col });
    } catch (e) { }
  }

  const indexSpecs = [
    { collection: 'stores', keys: { session_id: 1, store_id: 1 } },
    { collection: 'products', keys: { store_id: 1 } },
    { collection: 'analytics', keys: { store_id: 1, product_id: 1, flag: 1 } },
    { collection: 'campaigns', keys: { store_id: 1, product_id: 1, status: 1 } }
  ];

  for (const spec of indexSpecs) {
    try {
      await callFlexibleMcpTool(['create_index', 'create-index', 'createIndex'], {
        collection: spec.collection,
        keys: spec.keys,
        indexSpec: spec.keys
      });
    } catch (e) { }
  }
}

export function getMcpClient() {
  return mcpClient;
}

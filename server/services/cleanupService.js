import { callFlexibleMcpTool, getMcpClient } from './mcpService.js';

export async function cleanupExpiredGuests() {
  const mcpClient = getMcpClient();
  if (!mcpClient) return;
  console.log("🧹 Running auto-cleanup for expired guest data...");

  const collections = ['stores', 'products', 'analytics', 'campaigns'];
  const now = new Date();

  for (const col of collections) {
    try {
      // Attempt to use delete_many / delete-many
      await callFlexibleMcpTool(['delete_document', 'delete_many', 'delete-many', 'deleteMany'], {
        collection: col,
        filter: { type: 'guest', expires_at: { $lt: now } },
        query: { type: 'guest', expires_at: { $lt: now } }
      });
      console.log(`Ã¢Å“â€¦ Cleanup completed for collection: ${col}`);
    } catch (err) {
      // Fallback: find_documents then delete_one per document
      try {
        const findRes = await callFlexibleMcpTool(['find_documents', 'find', 'findDocuments'], {
          collection: col,
          filter: { type: 'guest', expires_at: { $lt: now } },
          query: { type: 'guest', expires_at: { $lt: now } }
        });
        let expiredDocs = findRes?.documents || findRes?.result || findRes?.data || [];

        // Fallback manual JavaScript filter if MCP does not support $lt operator and returns all documents
        expiredDocs = expiredDocs.filter(doc => doc.type === 'guest' && doc.expires_at && new Date(doc.expires_at) < now);

        for (const doc of expiredDocs) {
          if (doc._id) {
            await callFlexibleMcpTool(['delete_document', 'delete_one', 'delete-one', 'deleteOne'], {
              collection: col,
              filter: { _id: doc._id },
              query: { _id: doc._id }
            });
          }
        }
        console.log(`Ã¢Å“â€¦ Fallback cleanup completed for collection: ${col} (${expiredDocs.length} docs removed)`);
      } catch (fallbackErr) {
        console.warn(`Ã¢Å¡Â Ã¯Â¸Â Cleanup fallback warning for ${col}:`, fallbackErr.message);
      }
    }
  }
}

// Run auto-cleanup 5 seconds after server start, then every 6 hours
setTimeout(() => {
  cleanupExpiredGuests();
  setInterval(cleanupExpiredGuests, 6 * 3600 * 1000);
}, 5000);


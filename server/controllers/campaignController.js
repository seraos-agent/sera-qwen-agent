import { callFlexibleMcpTool, getMcpClient } from '../services/mcpService.js';
import { uploadToGcs } from '../routes/assetRoutes.js';

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
// Async Generate Embeddings in Background
async function generateEmbeddingsInBackground(productsDocs) {
  console.log(`⏳ [Background Embedding] Initiating for ${productsDocs.length} products...`);
  for (const doc of productsDocs) {
    try {
      const textToEmbed = `${doc.name || ''} ${doc.desc || doc.description || ''} ${doc.category || ''}`;
      console.log(`🕒 [Background Embedding] Generating vector for: "${doc.name}"`);
      const normalizedVector = await agent.embedText(textToEmbed);

      const embeddingDoc = {
        product_id: doc.product_id,
        store_id: doc.store_id,
        embedding: normalizedVector,
        timestamp: new Date().toISOString()
      };

      await callFlexibleMcpTool(['insert_document', 'insert-one', 'insertOne'], {
        collection: 'embeddings',
        document: embeddingDoc
      });
      console.log(`Ã¢Å“â€¦ [Background Embedding] Saved vector for: "${doc.name}"`);
    } catch (err) {
      console.error(`Ã¢Â Å’ [Background Embedding Error] Product "${doc.name}":`, err.message);
    }
  }
}

export const createCampaigns = async (req, res) => {
  const { store_id, session_id, campaigns } = req.body;
  if (!store_id || !Array.isArray(campaigns)) {
    return res.status(400).json({ success: false, error: "store_id and campaigns array are required" });
  }

  const sId = session_id || 'guest_default';

  try {
    const campaignPromises = campaigns.map(camp => {
      const campDoc = addGuestSessionFields({
        ...camp,
        campaign_id: camp.campaign_id || `camp_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        store_id,
        status: camp.status || 'draft'
      }, sId, camp.type || 'guest');

      return callFlexibleMcpTool(['insert_document', 'insert-one', 'insertOne'], {
        collection: 'campaigns',
        document: campDoc
      });
    });

    await Promise.all(campaignPromises);

    return res.json({ success: true, saved: campaigns.length });
  } catch (err) {
    console.error("Ã¢ÂÅ’ POST /api/campaigns error:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const activateCampaign = async (req, res) => {
  const { campaign_id } = req.body;
  if (!campaign_id) {
    return res.status(400).json({ success: false, error: "campaign_id is required" });
  }

  try {
    // Attempt to use update_document / update-one
    let updateSuccess = false;
    try {
      await callFlexibleMcpTool(['update_document', 'update_one', 'update-one', 'updateOne'], {
        collection: 'campaigns',
        filter: { campaign_id },
        query: { campaign_id },
        update: { $set: { status: 'active' } }
      });
      updateSuccess = true;
    } catch (updateErr) {
      console.warn("Ã¢Å¡Â Ã¯Â¸Â update_document not supported or failed, falling back to replace/insert logic...");
    }

    if (!updateSuccess) {
      // Fallback: Find existing document
      const findRes = await callFlexibleMcpTool(['find_documents', 'find', 'findDocuments'], {
        collection: 'campaigns',
        filter: { campaign_id },
        query: { campaign_id }
      });

      const existingDocs = findRes?.documents || findRes?.result || findRes?.data || [];
      if (existingDocs.length > 0) {
        const oldDoc = existingDocs[0];

        // Attempt to delete old document first to prevent duplication
        let deleteSuccess = false;
        try {
          await callFlexibleMcpTool(['delete_document', 'delete_one', 'delete-one', 'deleteOne'], {
            collection: 'campaigns',
            filter: { _id: oldDoc._id },
            query: { _id: oldDoc._id }
          });
          deleteSuccess = true;
        } catch (delErr) {
          console.warn("Ã¢Å¡Â Ã¯Â¸Â delete_document failed during fallback, marking old doc as superseded...");
        }

        if (!deleteSuccess) {
          // If delete fails, mark old document with superseded: true (attempt update)
          try {
            await callFlexibleMcpTool(['update_document', 'update_one', 'update-one', 'updateOne'], {
              collection: 'campaigns',
              filter: { _id: oldDoc._id },
              query: { _id: oldDoc._id },
              update: { $set: { superseded: true } }
            });
          } catch (supErr) {
            // Ignore if update is not supported at all
          }
        }

        // Insert new document with active status
        const newDoc = { ...oldDoc, status: 'active' };
        delete newDoc._id; // Remove _id so MongoDB generates a new one

        await callFlexibleMcpTool(['insert_document', 'insert-one', 'insertOne'], {
          collection: 'campaigns',
          document: newDoc
        });
      } else {
        return res.status(404).json({ success: false, error: "Campaign not found" });
      }
    }

    return res.json({ success: true, message: "Campaign activated successfully" });
  } catch (err) {
    console.error("Ã¢ÂÅ’ PATCH /api/campaigns/activate error:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
};


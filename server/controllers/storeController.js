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

export const publishStore = async (req, res) => {
  const { session_id, type, store_id, store_name, category, branding, products, description, storeData } = req.body;
  if (!store_name || !Array.isArray(products)) {
    return res.status(400).json({ success: false, error: "store_name and products array are required" });
  }

  // Filter out any incomplete AI-generated products
  const validProducts = products.filter(p =>
    p.name &&
    p.name.trim() !== "" &&
    p.price &&
    !p.name.toLowerCase().includes("generating") &&
    !p.name.includes("...")
  );

  // Fallback: If products array is empty, mock at least 1 product so Analytics Data generates successfully
  if (validProducts.length === 0) {
    validProducts.push({ id: "mock_1", name: "Featured Item", price: "$29.99", stock: 100, status: "active" });
  }

  const sId = session_id || 'guest_default';
  const sType = type || 'guest';
  const storeId = store_id || `store_${Date.now()}`;

  // Cleanup any existing store data if we are republishing to prevent duplicates
  if (store_id) {
    try {
      await callFlexibleMcpTool(['delete_document', 'delete_many', 'delete-many', 'deleteMany'], { collection: 'stores', filter: { store_id: store_id } });
      await callFlexibleMcpTool(['delete_document', 'delete_many', 'delete-many', 'deleteMany'], { collection: 'products', filter: { store_id: store_id } });
      await callFlexibleMcpTool(['delete_document', 'delete_many', 'delete-many', 'deleteMany'], { collection: 'analytics', filter: { store_id: store_id } });
    } catch (e) {
      console.error("Cleanup existing store error:", e.message);
    }
  }

  // Intercept and upload branding/hero assets to GCS
  const processedBranding = { ...(branding || {}) };
  if (processedBranding.heroImage) processedBranding.heroImage = await uploadToGcs(processedBranding.heroImage, req);
  if (processedBranding.cover) processedBranding.cover = await uploadToGcs(processedBranding.cover, req);
  if (processedBranding.logo) processedBranding.logo = await uploadToGcs(processedBranding.logo, req);
  if (processedBranding.videoUrl) processedBranding.videoUrl = await uploadToGcs(processedBranding.videoUrl, req);

  if (processedBranding.storeVideos && Array.isArray(processedBranding.storeVideos) && processedBranding.storeVideos.length > 0) {
    processedBranding.storeVideos = await Promise.all(processedBranding.storeVideos.map(vid => uploadToGcs(vid, req)));
    processedBranding.storeVideo = processedBranding.storeVideos[0];
  } else if (processedBranding.storeVideo) {
    processedBranding.storeVideo = await uploadToGcs(processedBranding.storeVideo, req);
    processedBranding.storeVideos = [processedBranding.storeVideo];
  }

  if (processedBranding.promoVideos && Array.isArray(processedBranding.promoVideos) && processedBranding.promoVideos.length > 0) {
    processedBranding.promoVideos = await Promise.all(processedBranding.promoVideos.map(vid => uploadToGcs(vid, req)));
    processedBranding.promoVideo = processedBranding.promoVideos[0];
  } else if (processedBranding.promoVideo) {
    processedBranding.promoVideo = await uploadToGcs(processedBranding.promoVideo, req);
    processedBranding.promoVideos = [processedBranding.promoVideo];
  }

  if (processedBranding.philosophy && Array.isArray(processedBranding.philosophy)) {
    processedBranding.philosophy = await Promise.all(processedBranding.philosophy.map(async (item) => {
      if (item.imageUrl) item.imageUrl = await uploadToGcs(item.imageUrl, req);
      return item;
    }));
  }

  // Category profiles for Metrics Generator
  const CATEGORY_PROFILES = {
    skincare: { avg_views: [200, 600], avg_ctr: 0.18, avg_conversion: 0.035 },
    kopi: { avg_views: [300, 800], avg_ctr: 0.22, avg_conversion: 0.065 },
    fashion: { avg_views: [400, 1200], avg_ctr: 0.28, avg_conversion: 0.025 },
    makanan: { avg_views: [250, 700], avg_ctr: 0.24, avg_conversion: 0.080 },
    default: { avg_views: [200, 500], avg_ctr: 0.18, avg_conversion: 0.040 }
  };

  const profile = CATEGORY_PROFILES[category ? category.toLowerCase() : 'default'] || CATEGORY_PROFILES.default;
  const totalProds = validProducts.length;

  const productsDocs = [];
  const analyticsDocs = [];

  // Process products asynchronously to handle GCS uploads
  const processedProducts = await Promise.all(validProducts.map(async (prod) => {
    // Intercept and upload image/video assets to GCS
    if (prod.imageUrl) prod.imageUrl = await uploadToGcs(prod.imageUrl, req);
    if (prod.verifiedUrl) prod.verifiedUrl = await uploadToGcs(prod.verifiedUrl, req);
    if (prod.pendingUrl) prod.pendingUrl = await uploadToGcs(prod.pendingUrl, req);
    if (prod.image) prod.image = await uploadToGcs(prod.image, req);
    if (prod.videoUrl) prod.videoUrl = await uploadToGcs(prod.videoUrl, req);
    if (prod.verticalVideoUrl) prod.verticalVideoUrl = await uploadToGcs(prod.verticalVideoUrl, req);
    if (prod.landscapeVideoUrl) prod.landscapeVideoUrl = await uploadToGcs(prod.landscapeVideoUrl, req);
    return prod;
  }));

  // Update customSchema with permanent GCS URLs so MongoDB saves the permanent URLs
  let finalCustomSchema = req.body.customSchema || null;
  if (finalCustomSchema && finalCustomSchema.layout) {
    finalCustomSchema.layout = await Promise.all(finalCustomSchema.layout.map(async s => {
      // Upload any standalone section video
      if (s.props && s.props.videoUrl) {
        s.props.videoUrl = await uploadToGcs(s.props.videoUrl, req);
      }
      
      if (s.type === "hero" && processedBranding) {
        return { ...s, props: { ...s.props, ...processedBranding } };
      }
      if (s.type === "philosophy" && processedBranding && processedBranding.philosophy) {
        return { ...s, props: { ...s.props, items: processedBranding.philosophy } };
      }
      if (s.type === "featured_products" && processedProducts && processedProducts.length > 0) {
        return { ...s, props: { ...s.props, products: processedProducts } };
      }
      return s;
    }));
  }

  // Step 1 & 2: Create store document
  const storeDoc = addGuestSessionFields({
    store_id: storeId,
    store_name,
    description: description || 'An autonomous AI-curated store.',
    category: category || 'default',
    branding: processedBranding,
    storeData: storeData || {},
    customSchema: finalCustomSchema,
    status: 'active'
  }, sId, sType);

  processedProducts.forEach((prod, index) => {
    const prodId = `prod_${Date.now()}_${index}`;

    // Step 3: Add fields to product
    const prodDoc = addGuestSessionFields({
      ...prod,
      product_id: prodId,
      store_id: storeId,
      stock: prod.stock !== undefined ? prod.stock : 100,
      status: prod.status || 'active'
    }, sId, sType);
    productsDocs.push(prodDoc);

    // Step 4: Metrics Generator
    // avg_views range
    const minViews = profile.avg_views[0];
    const maxViews = profile.avg_views[1];
    const baseViews = minViews + Math.random() * (maxViews - minViews);
    const viewsVariance = 0.7 + Math.random() * 0.6; // Ã‚Â±30% variance (0.7 to 1.3)
    const views = Math.floor(baseViews * viewsVariance);

    const ctrVariance = 0.7 + Math.random() * 0.6;
    const ctr = profile.avg_ctr * ctrVariance;

    const convVariance = 0.7 + Math.random() * 0.6;
    const conversion_rate = profile.avg_conversion * convVariance;

    const clicks = Math.floor(views * ctr);
    const purchased = Math.floor(views * conversion_rate);
    const numericPrice = typeof prod.price === 'string' ? parseFloat(prod.price.replace(/[^0-9.-]+/g, "")) : (prod.price || 0);
    const revenue_30d = purchased * (numericPrice || 0);

    // Trend determination (30% rising, 30% stable, 40% declining)
    let trend = 'declining';
    const ratio = index / (totalProds || 1);
    if (ratio < 0.3) trend = 'rising';
    else if (ratio < 0.6) trend = 'stable';

    // Flag based on conversion_rate
    let flag = 'healthy';
    if (conversion_rate < 0.02) flag = 'critical';
    else if (conversion_rate < profile.avg_conversion * 0.7) flag = 'needs_boost';

    // Performance score (0-100)
    const ctr_score = Math.min((ctr / 0.3) * 40, 40);
    const conv_score = Math.min((conversion_rate / 0.08) * 40, 40);
    const trend_bonus = trend === 'rising' ? 20 : (trend === 'stable' ? 10 : 0);
    const performance_score = Math.round(ctr_score + conv_score + trend_bonus);

    // Weekly trend (4 weeks)
    const weekly_revenue = [];
    for (let w = 0; w < 4; w++) {
      let multiplier = 1.0;
      if (trend === 'rising') {
        multiplier = 0.6 + (w * 0.15);
      } else if (trend === 'stable') {
        multiplier = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
      } else if (trend === 'declining') {
        multiplier = 1.1 - (w * 0.12);
      }
      weekly_revenue.push(Math.round(revenue_30d * multiplier));
    }

    // Generate Rich Analytics Data for Hackathon Judges (MCP & MongoDB showcase)
    const traffic_sources = [
      { source: "Instagram Ads", percentage: Math.floor(20 + Math.random() * 30) },
      { source: "TikTok", percentage: Math.floor(10 + Math.random() * 40) },
      { source: "Organic Search", percentage: Math.floor(5 + Math.random() * 20) }
    ];

    const top_demographic = ["Gen Z (18-24)", "Millennials (25-34)", "Gen X (35-44)"][Math.floor(Math.random() * 3)];
    const mobile_usage = Math.floor(60 + Math.random() * 30); // 60% to 90% mobile

    const analyticDoc = addGuestSessionFields({
      store_id: storeId,
      product_id: prodId,
      product_name: prod.name || `Product ${index + 1}`,
      views,
      ctr,
      conversion_rate,
      clicks,
      purchased,
      revenue_30d,
      trend,
      flag,
      performance_score,
      weekly_revenue,
      insights: {
        traffic_sources,
        top_demographic,
        device_split: { mobile: mobile_usage, desktop: 100 - mobile_usage }
      }
    }, sId, sType);

    analyticsDocs.push(analyticDoc);
  });

  // Step 5: Save to MongoDB via MCP
  try {
    await callFlexibleMcpTool(['insert_document', 'insert-one', 'insertOne'], {
      collection: 'stores',
      document: storeDoc
    });

    const productPromises = productsDocs.map(pDoc =>
      callFlexibleMcpTool(['insert_document', 'insert-one', 'insertOne'], {
        collection: 'products',
        document: pDoc
      })
    );

    const analyticsPromises = analyticsDocs.map(aDoc =>
      callFlexibleMcpTool(['insert_document', 'insert-one', 'insertOne'], {
        collection: 'analytics',
        document: aDoc
      })
    );

    await Promise.all([...productPromises, ...analyticsPromises]);

    // Trigger async background embedding generation (Disabled - Agent is handled by Python ADK)
    /*
    generateEmbeddingsInBackground(productsDocs).catch(err => {
      console.error("Ã¢Â Å’ Background embedding generation failed:", err.message);
    });
    */

    // Step 6: Return response
    return res.json({
      success: true,
      store_id: storeId,
      store_name,
      product_count: productsDocs.length,
      analytics_generated: true,
      message: "Store published successfully",
      branding: processedBranding,
      storeData: storeDoc.storeData,
      products: productsDocs
    });
  } catch (err) {
    console.error("’ POST /api/publish error:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteStore = async (req, res) => {
  const storeId = req.params.store_id;
  if (!storeId) return res.status(400).json({ success: false, error: "store_id required" });

  try {
    // Delete store data across collections
    await callFlexibleMcpTool(['delete_document', 'delete_many', 'delete-many', 'deleteMany'], { collection: 'stores', filter: { store_id: storeId } });
    await callFlexibleMcpTool(['delete_document', 'delete_many', 'delete-many', 'deleteMany'], { collection: 'products', filter: { store_id: storeId } });
    await callFlexibleMcpTool(['delete_document', 'delete_many', 'delete-many', 'deleteMany'], { collection: 'analytics', filter: { store_id: storeId } });
    
    console.log(`✅ Deleted store and associated data for: ${storeId}`);
    return res.json({ success: true, message: "Store deleted successfully" });
  } catch (err) {
    console.error("❌ DELETE /api/stores error:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const searchProducts = async (req, res) => {
  const { query, limit = 6, store_id } = req.body;
  if (!query) {
    return res.status(400).json({ success: false, error: "query is required" });
  }

  try {
    // Generate text embedding using Python ADK Service
    let queryVector = new Array(768).fill(0);
    try {
      const embedRes = await fetch("http://localhost:8000/api/agent/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: query })
      });
      if (embedRes.ok) {
        const embedData = await embedRes.json();
        if (embedData.success && Array.isArray(embedData.embedding)) {
          queryVector = embedData.embedding;
        }
      }
    } catch (err) {
      console.error("❌ Error fetching embedding from Python ADK service:", err.message);
    }


    // Retrieve products (filtered by store_id if provided)
    const filter = store_id ? { store_id } : {};
    const productsRes = await callFlexibleMcpTool(['find_documents', 'find', 'findDocuments'], {
      collection: 'products',
      filter: filter,
      limit: 1000
    });
    const products = productsRes.documents || productsRes.result || [];

    // Retrieve all product embeddings
    const embeddingsRes = await callFlexibleMcpTool(['find_documents', 'find', 'findDocuments'], {
      collection: 'embeddings',
      filter: {},
      limit: 1000
    });
    const embeddings = embeddingsRes.documents || embeddingsRes.result || [];

    // Map of product_id -> embedding values
    const embeddingMap = new Map();
    for (const emb of embeddings) {
      if (emb.product_id && Array.isArray(emb.embedding)) {
        embeddingMap.set(emb.product_id, emb.embedding);
      }
    }

    // Helper: calculate dot product
    const dotProduct = (vecA, vecB) => {
      if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
      let sum = 0;
      for (let i = 0; i < vecA.length; i++) sum += vecA[i] * vecB[i];
      return sum;
    };

    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);

    // Calculate score and add matching explanation for each product
    const scoredProducts = products.map(p => {
      const pEmb = embeddingMap.get(p.product_id);

      // 1. Semantic Similarity
      const semanticScore = pEmb ? dotProduct(queryVector, pEmb) : 0.5; // fallback to mid value if no embedding exists yet

      // 2. Keyword Match
      let keywordScore = 0;
      const textToMatch = `${p.name || ''} ${p.desc || p.description || ''} ${p.category || ''}`.toLowerCase();
      if (queryWords.length > 0) {
        let matches = 0;
        for (const word of queryWords) {
          if (textToMatch.includes(word)) matches++;
        }
        keywordScore = matches / queryWords.length;
      }

      // 3. Product Rating (0 to 1 range, default 4.5/5 -> 0.9)
      const ratingVal = parseFloat(p.rating) || 4.5;
      const ratingScore = ratingVal / 5.0;

      // 4. Hybrid Scoring Formula
      const score = (0.7 * semanticScore) + (0.2 * keywordScore) + (0.1 * ratingScore);

      // Create explanation
      const explanation = [];
      if (semanticScore > 0.6) {
        explanation.push(`matches style preference (${Math.round(semanticScore * 100)}% match)`);
      }
      const matched = queryWords.filter(w => textToMatch.includes(w));
      if (matched.length > 0) {
        explanation.push(`contains keywords: ${matched.join(', ')}`);
      }
      if (ratingVal >= 4.7) {
        explanation.push(`highly rated (${ratingVal}/5)`);
      }

      const standardDesc = p.desc || p.description || "";

      return {
        ...p,
        desc: standardDesc,
        description: standardDesc,
        score,
        semanticScore,
        keywordScore,
        searchExplanation: explanation.join(', ') || 'relevancy match'
      };
    });

    // Sort by hybrid score in descending order
    scoredProducts.sort((a, b) => b.score - a.score);

    // Slice to limit
    const results = scoredProducts.slice(0, limit);

    // REAL-TIME BUYER TRACKING: Increment views for the top results to reflect actual Buyer Mode interest
    if (results.length > 0) {
      // Run asynchronously so it doesn't block the search response
      Promise.all(results.map(async (r) => {
        try {
          const analyticsDocs = await callFlexibleMcpTool(['find_documents', 'find', 'findDocuments'], {
            collection: 'analytics',
            filter: { product_id: r.product_id }
          });
          const docs = analyticsDocs.documents || analyticsDocs.result || [];
          if (docs.length > 0) {
            const currentViews = docs[0].views || 0;
            const currentClicks = docs[0].clicks || 0;

            // Simulasikan interaksi: +1 views, +1 click jika relevansi sangat tinggi
            const incViews = 1;
            const incClicks = r.score > 0.75 ? 1 : 0;

            await callFlexibleMcpTool(['update_document', 'update-one', 'updateOne'], {
              collection: 'analytics',
              filter: { product_id: r.product_id },
              update: { $set: { views: currentViews + incViews, clicks: currentClicks + incClicks } }
            });
          }
        } catch (e) {
          console.error("Failed to track buyer search event:", e.message);
        }
      })).catch(() => { });
    }

    return res.json({
      success: true,
      query,
      results
    });

  } catch (err) {
    console.error("Ã¢ÂÅ’ POST /api/search-products error:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
};


export const getAnalytics = async (req, res) => {

  const { store_id } = req.query;
  if (!store_id) {
    return res.status(400).json({ success: false, error: "store_id is required" });
  }

  try {
    const response = await callFlexibleMcpTool(['find_documents', 'find', 'findDocuments'], {
      collection: 'analytics',
      filter: { store_id },
      query: { store_id } // fallback arg name
    });

    let analytics = response?.documents || response?.result || response?.data || [];

    // If no analytics data found from DB, dynamically generate from products collection
    if (!analytics || analytics.length === 0) {
      const prodRes = await callFlexibleMcpTool(['find_documents', 'find', 'findDocuments'], {
        collection: 'products',
        filter: { store_id },
        query: { store_id }
      });
      const products = prodRes?.documents || prodRes?.result || prodRes?.data || [];

      analytics = products.map((p, idx) => {
        const rev = 1200 + (idx * 350) + (Math.random() * 500);
        const conv = 2.5 + (idx * 0.5) + (Math.random() * 1.5);
        const score = 60 + (idx * 5) + (Math.random() * 10);
        let flag = 'healthy';
        if (score < 65) flag = 'critical';
        else if (score < 75) flag = 'needs_boost';

        return {
          id: p.id || p._id || `a_${idx}`,
          store_id,
          product_id: p.id || p._id,
          name: p.name || `Product ${idx + 1}`,
          price: p.price || "$0",
          revenue_30d: rev,
          conversion_rate: conv,
          performance_score: score > 100 ? 100 : score,
          flag,
          image: p.image || null
        };
      });
    }
    console.log("ANALYTICS DOCS REVENUE:", analytics.map(a => ({ name: a.name, price: a.price, revenue_30d: a.revenue_30d })));

    const total_products = analytics.length;
    const healthy = analytics.filter(a => a.flag === 'healthy').length;
    const needs_boost = analytics.filter(a => a.flag === 'needs_boost').length;
    const critical = analytics.filter(a => a.flag === 'critical').length;
    const total_revenue = analytics.reduce((sum, a) => sum + (a.revenue_30d || 0), 0);

    console.log("CALCULATED TOTAL REVENUE:", total_revenue);

    const avg_conversion = total_products > 0
      ? analytics.reduce((sum, a) => sum + (a.conversion_rate || 0), 0) / total_products
      : 0;

    // Sort performance_score ASC
    const sortedProducts = [...analytics].sort((a, b) => (a.performance_score || 0) - (b.performance_score || 0));

    return res.json({
      success: true,
      summary: {
        total_products,
        healthy,
        needs_boost,
        critical,
        total_revenue,
        avg_conversion
      },
      products: sortedProducts
    });
  } catch (err) {
    console.error("Ã¢Â Å’ GET /api/analytics error:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
};

import { localFind } from '../dbHelper.js';

export const getStores = async (req, res) => {
  const { session_id } = req.query;
  if (!session_id) {
    return res.status(400).json({ success: false, error: "session_id is required" });
  }

  try {
    const filter = session_id === 'all' ? { status: 'active' } : { session_id };
    const query = session_id === 'all' ? { status: 'active' } : { session_id };

    const response = await callFlexibleMcpTool(['find_documents', 'find', 'findDocuments'], {
      collection: 'stores',
      filter: filter,
      query: query,
      limit: 1000
    });

    let storesList = response?.documents || response?.result || response?.data || [];
    
    // Force merge from local stores.json to prevent data loss
    try {
      const localStoresRes = localFind('stores', filter);
      const localStores = localStoresRes?.documents || localStoresRes?.result || [];
      const map = new Map();
      storesList.forEach(s => map.set(s.store_id || s.id || s._id, s));
      localStores.forEach(s => {
        const id = s.store_id || s.id || s._id;
        if (!map.has(id)) {
          map.set(id, s);
          storesList.push(s);
        }
      });
    } catch (e) {
      console.log("Local merge error (stores):", e.message);
    }

    const productsResponse = await callFlexibleMcpTool(['find_documents', 'find', 'findDocuments'], { collection: 'products', limit: 10000 });
    let allProducts = productsResponse?.documents || productsResponse?.result || productsResponse?.data || [];
    
    try {
      const localProdsRes = localFind('products');
      const localProds = localProdsRes?.documents || localProdsRes?.result || [];
      const pMap = new Map();
      allProducts.forEach(p => pMap.set(p.product_id || p.id || p._id, p));
      localProds.forEach(p => {
        const id = p.product_id || p.id || p._id;
        if (!pMap.has(id)) {
          pMap.set(id, p);
          allProducts.push(p);
        }
      });
    } catch (e) {
      console.log("Local merge error (products):", e.message);
    }

    const storesWithProducts = storesList.map(store => {
      const storeProds = allProducts.filter(p => String(p.store_id) === String(store.store_id) || String(p.store_id) === String(store.id) || String(p.store_id) === String(store._id));
      return { ...store, products: storeProds };
    });
    
    return res.json({ success: true, stores: storesWithProducts });
  } catch (err) {
    console.error("❌ GET /api/stores error:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getProducts = async (req, res) => {
  const { store_id } = req.query;
  try {
    const filter = store_id ? { store_id } : {};
    const query = filter;

    const response = await callFlexibleMcpTool(['find_documents', 'find', 'findDocuments'], {
      collection: 'products',
      filter: filter,
      query: query,
      limit: 1000
    });

    let productsList = response?.documents || response?.result || response?.data || [];
    
    try {
      const localProdsRes = localFind('products', filter);
      const localProds = localProdsRes?.documents || localProdsRes?.result || [];
      const pMap = new Map();
      productsList.forEach(p => pMap.set(p.product_id || p.id || p._id, p));
      localProds.forEach(p => {
        const id = p.product_id || p.id || p._id;
        if (!pMap.has(id)) {
          pMap.set(id, p);
          productsList.push(p);
        }
      });
    } catch (e) {
      console.log("Local merge error (products api):", e.message);
    }

    return res.json({
      success: true,
      products: productsList
    });
  } catch (err) {
    console.error("❌ GET /api/products error:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
};



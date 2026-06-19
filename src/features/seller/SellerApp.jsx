import { useState, useEffect, useMemo } from "react";
import { StoreProvider, useStore } from '../../store/storeContext';
import { SellerProvider } from './SellerContext';
import { SellerPreview } from './components/SellerPreview';
import { SellerAnalyticsPanel } from './components/SellerAnalyticsPanel';
import { SellerProductsPanel } from './components/SellerProductsPanel';
import { SellerSettingsPanel } from './components/SellerSettingsPanel';
import { SellerChatPanel } from './components/SellerChatPanel';
import { SellerSidebar } from './components/SellerSidebar';
import { SellerStoresPanel } from './components/SellerStoresPanel';
import { SellerModals } from './components/SellerModals';
import { SellerHeader } from './components/SellerHeader';
import { SellerConnectorsPanel } from './components/SellerConnectorsPanel';

import { sendChat, getStores } from "../../lib/agentApi";

import {
  CURATED_STORES,
  getSessionId
} from '../../utils/constants';
import { DynamicRenderer } from '../../engine/DynamicRenderer';
import { useSellerChat } from './hooks/useSellerChat';

export const SellerApp = ({ isDarkMode, setIsDarkMode, t, DynamicRenderer }) => {

  const {
    state,
    setAppMode, setStoreSchema, setDraftSchema, setPublishedSchema, setUserStores,
    setActiveAnalyticsStoreId, setAnalyticsData, setIsLoadingAnalytics,
    setBuyerSearchQuery, setBuyerAiQuery, setBuyerAiMessages, setBuyerAiStatus,
    setSelectedCategoryFilter, setFollowedStores, setCart, setIsCartOpen,
    setSelectedProductDetail, setSelectedStorefront, setModalQty, setSelectedPhilosophy, setToastMessage
  } = useStore();

  const {
    appMode, storeSchema, draftSchema, publishedSchema, userStores,
    activeAnalyticsStoreId, analyticsData, isLoadingAnalytics,
    buyerSearchQuery, buyerAiQuery, buyerAiMessages, buyerAiStatus,
    selectedCategoryFilter, followedStores, cart, isCartOpen,
    selectedProductDetail, selectedStorefront, modalQty, selectedPhilosophy, toastMessage
  } = state;

  // --- CSS Inject ---
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      * { box-sizing: border-box; }
      img { display: block; max-width: 100%; height: auto; }
      .product-img { min-height: 100%; min-width: 100%; display: block !important; opacity: 1 !important; }
      .product-card { transition: all 0.3s ease; border: 1px solid #222; border-radius: 12px; overflow: hidden; background: #161618; }
      .product-card:hover { border-color: #444; transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.3); }
      @keyframes typingBounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }
      @keyframes pulse { 0% { opacity: 0.4; } 50% { opacity: 0.8; } 100% { opacity: 0.4; } }
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      .loading-shimmer { animation: pulse 1.5s infinite ease-in-out; background: #1a1a1e; }
      .spinner-ring { 
        width: 44px; height: 44px; 
        border: 4px solid rgba(200, 184, 154, 0.1); 
        border-top: 4px solid #c8b89a; 
        border-radius: 50%; 
        animation: spin 0.8s linear infinite; 
      }
      .placeholder-static { background: #1a1a1e; display: flex; align-items: center; justify-content: center; position: absolute; inset: 0; }
      .chart-bar-container:hover .chart-tooltip { opacity: 1 !important; transform: translateY(-5px); }
      .chart-bar-container:hover .chart-bar { filter: brightness(1.2); }
    `;
    document.head.appendChild(style);
  }, []);
    const [activeNav, setActiveNav] = useState("studio");
  const [activePromoTab, setActivePromoTab] = useState("video");
  const [videoFormat, setVideoFormat] = useState("landscape");
  const [previewMode, setPreviewMode] = useState("desktop");
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [showPublishedModal, setShowPublishedModal] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const parsePriceNum = (priceStr) => {
    if (!priceStr) return 29.00;
    const s = String(priceStr);
    if (s.toLowerCase().includes("rp")) {
      return parseFloat(s.replace(/[^0-9]/g, "")) || 450000;
    }
    return parseFloat(s.replace(/[^0-9.]/g, "")) || 29.00;
  };

  const formatPriceStr = (num, originalStr) => {
    const s = String(originalStr || "");
    if (s.toLowerCase().includes("rp")) {
      return "Rp " + num.toLocaleString("id-ID");
    }
    return "$" + num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  useEffect(() => {
    if (activeNav === "analytics") {
      if (!activeAnalyticsStoreId && userStores.length > 0) {
        setActiveAnalyticsStoreId(userStores[0].id);
      }
    }
  }, [activeNav, userStores, activeAnalyticsStoreId]);

  // Fetch or mock analytics data when active store changes
  useEffect(() => {
    if (activeAnalyticsStoreId) {
      setIsLoadingAnalytics(true);
      const timer = setTimeout(() => {
        let hash = 0;
        for (let i = 0; i < activeAnalyticsStoreId.length; i++) hash += activeAnalyticsStoreId.charCodeAt(i);
        
        const rev = 15000 + (hash % 25000);
        const conv = 0.03 + ((hash % 40) / 1000);
        
        setAnalyticsData({
          summary: {
            total_revenue: rev,
            total_products: 12 + (hash % 30),
            avg_conversion: conv,
            healthy: 8 + (hash % 15)
          },
          products: [
            { weekly_revenue: [rev * 0.18, rev * 0.22, rev * 0.26, rev * 0.34] }
          ]
        });
        setIsLoadingAnalytics(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setAnalyticsData(null);
    }
  }, [activeAnalyticsStoreId, setAnalyticsData, setIsLoadingAnalytics]);

  // Sync published stores from backend on load
  useEffect(() => {
    let isMounted = true;
    import('../../lib/agentApi').then(({ getStores }) => {
        getStores(getSessionId()).then(res => {
          if (res.success && res.stores && isMounted) {
            setUserStores(prev => {
              const merged = [...prev];
              res.stores.forEach(dbStore => {
                const storeId = dbStore.store_id || dbStore.id || dbStore._id;
                const mappedStore = {
                  id: storeId,
                  name: dbStore.store_name || dbStore.name || "Unknown Store",
                  category: dbStore.category || "General",
                  logo: dbStore.branding?.logo || "",
                  cover: dbStore.branding?.heroImage || dbStore.branding?.cover || "",
                  trustScore: "99.9%",
                  followers: "1.2K",
                  desc: dbStore.description || "",
                  isUserStore: true,
                  createdAt: dbStore.created_at || new Date().toISOString()
                };
                if (!merged.find(s => s.id === storeId)) {
                  merged.push(mappedStore);
                }
              });
              return merged;
            });
          }
        }).catch(err => console.error("Failed to fetch stores on load:", err));
    });
    return () => { isMounted = false; };
  }, []);

  const filteredStores = useMemo(() => {
    const allCuratedStores = [...userStores, ...CURATED_STORES];
    return allCuratedStores
      .filter(s => selectedCategoryFilter === "all" || s.category === selectedCategoryFilter)
      .filter(s => !buyerSearchQuery || (s.name || "").toLowerCase().includes(buyerSearchQuery.toLowerCase()) || (s.category || "").toLowerCase().includes(buyerSearchQuery.toLowerCase()) || (s.desc || "").toLowerCase().includes(buyerSearchQuery.toLowerCase()));
  }, [userStores, selectedCategoryFilter, buyerSearchQuery]);

  const products = storeSchema?.layout?.find(s => s.type === "featured_products")?.props?.products || [];
  const setProducts = (fn) => setStoreSchema(prev => {
    const existingSection = prev.layout.find(s => s.type === "featured_products");
    const currentProducts = existingSection?.props?.products || [];
    const nextProducts = typeof fn === "function" ? fn(currentProducts) : fn;
    if (existingSection) {
      return {
        ...prev,
        layout: prev.layout.map(s => s.type === "featured_products" ? { ...s, props: { ...s.props, products: nextProducts } } : s)
      };
    } else {
      return {
        ...prev,
        layout: [...prev.layout, { id: "auto-products", type: "featured_products", variant: "grid", props: { sectionTitle: "Featured Products", products: nextProducts } }]
      };
    }
  });

  const setStoreData = (fn) => setStoreSchema(prev => {
    const existingSection = prev.layout.find(s => s.type === "hero");
    const currentProps = existingSection?.props || {};
    const nextData = typeof fn === "function" ? fn(currentProps) : fn;
    if (existingSection) {
      return {
        ...prev,
        layout: prev.layout.map(s => s.type === "hero" ? { ...s, props: { ...s.props, ...nextData } } : s)
      };
    } else {
      return {
        ...prev,
        layout: [{ id: "auto-hero", type: "hero", variant: "centered", props: { ...nextData } }, ...prev.layout]
      };
    }
  });

  const philosophy = storeSchema?.layout?.find(s => s.type === "philosophy")?.props?.items || [];
  const heroProps = storeSchema?.layout?.find(s => s.type === "hero")?.props || {};
  const storeData = { ...heroProps, ...heroProps.branding };
  const testimonials = storeSchema?.testimonials || [];
  const faq = storeSchema?.faq || [];
  const footerData = storeSchema?.footer || {};
  const heroStyles = storeSchema?.heroStyles || {};
  const themeColor = storeSchema?.theme?.themeColor || "#c8b89a";
  const heroBg = storeSchema?.theme?.heroBg || "linear-gradient(135deg, #16161a 0%, #09090b 100%)";
  const heroImage = storeSchema?.layout?.find(s => s.type === "hero")?.props?.heroImage || null;

  const agentLogic = useSellerChat({
    appMode,
    filteredStores: userStores,
    selectedStorefront,
    storeSchema,
    activeAnalyticsStoreId,
    activeNav,
    products,
    themeColor: storeSchema?.theme?.themeColor || "#ffffff",
    heroBg: storeSchema?.theme?.heroBg || "#000000",
    storeData,
    setStoreSchema,
    setStoreData: (data) => setStoreSchema(prev => ({ ...prev, layout: prev.layout.map(s => s.type === "hero" ? { ...s, props: { ...s.props, ...data } } : s) })),
    setProducts,
    setDraftSchema,
    setActiveNav,
    setUserStores
  });

  const {
    chatOpen, setChatOpen,
    chatWidth, startResizing, isResizing,
    messages, setMessages,
    messagesEndRef,
    isModeMenuOpen, setIsModeMenuOpen,
    chatMode, setChatMode,
    applyAction, handleAction, handleRetryAssets,
    agentActivity, executionState, isTyping, ephemeralThought,
    stopAgentWork,
    input, setInput, sendMessage,
    isAttachMenuOpen, setIsAttachMenuOpen,
    fileInputRef, handleImageUpload, pendingImages, setPendingImages,
    setSteps, selectedProducts, setSelectedProducts,
    buildingStage, visibilityMode, setVisibilityMode,
    openActionMenuId, setOpenActionMenuId,
    productImageInputRef, handleProductImageUpdate, setUploadingForProduct,
    lastUserMsgRef, steps
  } = agentLogic;

  const completedSteps = steps.filter(s => s.done).length;
  const toggleFollowStore = (storeId) => {
    setFollowedStores(prev => {
      const next = new Set(prev);
      if (next.has(storeId)) next.delete(storeId);
      else next.add(storeId);
      return next;
    });
  };

  const handlePublishStore = async () => {
    setIsPublishing(true);
    try {
      const productsList = storeSchema.layout?.find(s => s.type === "featured_products")?.props?.products || storeSchema.products || [];
      const heroTitle = storeSchema.layout?.find(s => s.type === "hero")?.props?.title;
      const heroSubtitle = storeSchema.layout?.find(s => s.type === "hero")?.props?.subtitle;
      const metaName = storeSchema.metadata?.brand_identity;
      const storeName = storeSchema.name || metaName || heroTitle || "Unknown Brand";
      const storeCategory = storeSchema.category || storeSchema.metadata?.category || storeSchema.metadata?.industry || "General Store";
      
      const payload = {
        session_id: getSessionId(),
        store_id: storeSchema.id,
        name: storeName,
        store_name: storeName,
        description: heroSubtitle || storeSchema.metadata?.objective || "An autonomous AI-curated store.",
        category: storeCategory,
        branding: {
          heroImage: heroImage || storeSchema.layout?.find(s => s.type === "hero")?.props?.heroImage || "",
          collection: storeData.collection || storeSchema.layout?.find(s => s.type === "hero")?.props?.collection,
          buttonText: storeData.buttonText || storeSchema.layout?.find(s => s.type === "hero")?.props?.buttonText,
          promoBanner: storeData.promoBanner || storeSchema.layout?.find(s => s.type === "hero")?.props?.promoBanner,
          heroVariant: storeData.heroVariant || storeSchema.layout?.find(s => s.type === "hero")?.props?.heroVariant,
          storeVideo: storeData.storeVideo || (storeData.storeVideos && storeData.storeVideos.length > 0 ? storeData.storeVideos[0] : "") || storeData.branding?.storeVideo || "",
          promoVideo: storeData.promoVideo || (storeData.promoVideos && storeData.promoVideos.length > 0 ? storeData.promoVideos[0] : "") || storeData.branding?.promoVideo || "",
          storeVideos: (storeData.storeVideos && storeData.storeVideos.length > 0) ? storeData.storeVideos : (storeData.storeVideo ? [storeData.storeVideo] : []),
          promoVideos: (storeData.promoVideos && storeData.promoVideos.length > 0) ? storeData.promoVideos : (storeData.promoVideo ? [storeData.promoVideo] : []),
          philosophy: storeSchema.layout?.find(s => s.type === "philosophy")?.props?.items || []
        },
        storeData: storeData,
        customSchema: storeSchema,
        products: productsList,
        type: "seller"
      };

      const { publishStore } = await import('../../lib/agentApi');
      const res = await publishStore(payload);
      if (!res.success) {
        throw new Error(res.error || "Unknown error");
      }
      
      const finalStoreId = res.store_id;
      setIsPublishing(false);
      setIsPublished(true);

      let gcsSchema = { ...storeSchema, id: finalStoreId };
      if (res.branding) {
        gcsSchema.layout = gcsSchema.layout.map(s => {
          if (s.type === "hero") {
            const safeBranding = { ...res.branding };
            Object.keys(safeBranding).forEach(key => { if (safeBranding[key] === undefined) delete safeBranding[key]; });
            return { ...s, props: { ...s.props, ...safeBranding } };
          }
          if (s.type === "philosophy" && res.branding.philosophy) {
            return { ...s, props: { ...s.props, items: res.branding.philosophy } };
          }
          return s;
        });
      }
      if (res.products && res.products.length > 0) {
        gcsSchema.layout = gcsSchema.layout.map(s => {
          if (s.type === "featured_products") {
            return { ...s, props: { ...s.props, products: res.products } };
          }
          return s;
        });
        setProducts(res.products);
      }

      const updatedSchema = gcsSchema;
      setPublishedSchema(updatedSchema);
      setStoreSchema(updatedSchema);
      setUserStores(prev => {
        const existingIndex = storeSchema.id ? prev.findIndex(s => s.id === storeSchema.id) : -1;
        const newStoreObj = {
          id: finalStoreId,
          name: storeName,
          category: storeCategory,
          logo: "",
          cover: updatedSchema.layout?.find(s => s.type === "hero")?.props?.heroImage || "",
          trustScore: "99.9%",
          followers: "1.2K",
          desc: updatedSchema.layout?.find(s => s.type === "hero")?.props?.subtitle || "Advanced botanical skincare crafted for autonomous commerce excellence.",
          isUserStore: true,
          customSchema: updatedSchema,
          storeData: res.storeData || res.branding || storeData
        };
        if (existingIndex >= 0) {
          const next = [...prev];
          next[existingIndex] = newStoreObj;
          return next;
        } else {
          return [...prev, newStoreObj];
        }
      });
      setShowPublishedModal(true);
      
      setTimeout(() => {
        try {
          const canvas = document.createElement('canvas');
          canvas.style.position = 'fixed';
          canvas.style.inset = '0';
          canvas.style.width = '100vw';
          canvas.style.height = '100vh';
          canvas.style.zIndex = '999999';
          canvas.style.pointerEvents = 'none';
          document.body.appendChild(canvas);
          import('canvas-confetti').then((confettiModule) => {
            const confetti = confettiModule.default;
            const myConfetti = confetti.create(canvas, { resize: true, useWorker: false });
            myConfetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } }).then(() => {
              if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
            });
          });
        } catch (e) {
          console.error("Confetti error", e);
        }
      }, 50);
      
      return true;
    } catch (err) {
      console.error("Publish failed:", err);
      alert("Failed to publish store: " + err.message);
      setIsPublishing(false);
      return false;
    }
  };

  const handleBuyerAiSubmit = async (e) => {
    e.preventDefault();
    if (!buyerAiQuery.trim()) return;
    const userText = buyerAiQuery.trim();
    const newMsgId = Math.random().toString(36).substr(2, 9);
    setBuyerAiMessages(prev => [...prev, { role: "user", text: userText, id: `user-${newMsgId}` }]);
    setBuyerAiQuery("");
    setBuyerAiStatus("Analyzing request...");
    try {
      setBuyerAiStatus("Thinking...");
      const storeContext = {
        session_id: "buyer_session_1",
        storeName: "SERA AI Store",
        chatMode: "buyer"
      };
      const response = await sendChat({
        input: userText,
        history: buyerAiMessages,
        storeContext,
        chatMode: "buyer"
      }, new AbortController().signal);
      if (!response.body) throw new Error("No response body");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (value) {
          const chunk = decoder.decode(value, { stream: !done });
          buffer += chunk;
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const data = JSON.parse(line);
              if (data.type === "cognition" && data.message) {
                setBuyerAiStatus(data.message);
              } else if (data.type === "final") {
                setBuyerAiMessages(prev => [...prev, { role: "agent", text: data.text, id: `agent-${newMsgId}` }]);
                setBuyerAiStatus("");
              }
            } catch (e) {
              // Ignore invalid JSON chunks
            }
          }
        }
        if (done) break;
      }
    } catch (err) {
      console.error("Failed buyer AI assistant search:", err);
      setBuyerAiMessages(prev => [...prev, {
        role: "agent",
        text: `Sorry, there was an issue communicating with SERA AI. Please try again.`,
        id: `agent-${newMsgId}`
      }]);
    } finally {
      setBuyerAiStatus("");
    }
  };
  const sellerContextValue = {
    isDarkMode, setIsDarkMode,
    t,
    products, setProducts,
    storeData, setStoreData,
    storeSchema,
    chatOpen, setChatOpen,
    chatWidth,
    startResizing, isResizing,
    messages, setMessages,
    messagesEndRef,
    isModeMenuOpen, setIsModeMenuOpen,
    chatMode, setChatMode,
    applyAction, handleAction, handleRetryAssets,
    agentActivity, executionState, isTyping, ephemeralThought,
    stopAgentWork,
    input, setInput, sendMessage,
    isAttachMenuOpen, setIsAttachMenuOpen,
    fileInputRef, handleImageUpload, pendingImages, setPendingImages,
    setSteps, selectedProductDetail, setSelectedProductDetail,
    showPublishedModal, setShowPublishedModal, toastMessage, lastUserMsgRef,
    buildingStage, previewMode, DynamicRenderer, setModalQty, setPreviewMode,
    philosophy, selectedPhilosophy, themeColor, heroBg, heroImage, testimonials, faq, footerData, heroStyles, setSelectedPhilosophy,
    activeNav, setActiveNav,
    selectedProducts, setSelectedProducts,
    openActionMenuId, setOpenActionMenuId,
    productImageInputRef, handleProductImageUpdate, setUploadingForProduct,
    userStores, setUserStores, activePromoTab, setActivePromoTab, videoFormat, setVideoFormat,
    activeAnalyticsStoreId, setActiveAnalyticsStoreId, analyticsData, isLoadingAnalytics,
    appMode, setAppMode, setStoreSchema, setDraftSchema, setPublishedSchema,
    isPublishing, setIsPublishing, isPublished, setIsPublished,
    buyerSearchQuery, setBuyerSearchQuery, filteredStores, selectedCategoryFilter, setSelectedCategoryFilter,
    getSessionId, handlePublishStore
  };

  return (
    <SellerProvider value={sellerContextValue}>
      <div className={isDarkMode ? "" : "light-mode"} style={{
      display: "flex",
      height: "100vh",
      width: "100%",
      background: t.bg,
      fontFamily: "'DM Sans', sans-serif",
      color: t.text,
      overflow: "hidden",
    }}>
      <style>{`
        :root { color-scheme: ${isDarkMode ? "dark" : "light"}; }
        * { box-sizing: border-box; margin: 0; padding: 0; scrollbar-width: thin; scrollbar-color: ${isDarkMode ? "#2a2a2e transparent" : "#e5e7eb #f9fafb"}; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: ${isDarkMode ? "transparent" : "#f9fafb"}; }
        ::-webkit-scrollbar-thumb { background: ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}; border-radius: 4px; }
        .nav-btn { background: none; border: none; cursor: pointer; padding: 10px; border-radius: 10px; color: ${isDarkMode ? "#4a4a52" : "#9ca3af"}; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
        .nav-btn:hover { background: ${isDarkMode ? "#1e1e22" : "#f3f4f6"}; color: ${isDarkMode ? "#c8b89a" : "#8b7355"}; }
        .nav-btn.active { background: ${isDarkMode ? "#1e1e22" : "#f3f4f6"}; color: ${isDarkMode ? "#c8b89a" : "#8b7355"}; }
        .product-card { background: ${t.card}; border: 1px solid ${t.border}; border-radius: 12px; overflow: hidden; transition: transform 0.2s, border-color 0.2s; cursor: pointer; }
        .product-card:hover { transform: translateY(-2px); border-color: ${isDarkMode ? "#333" : "#d1d5db"}; }
        .send-btn { background: #c8b89a; border: none; border-radius: 8px; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: opacity 0.2s; }
        .send-btn:hover { opacity: 0.85; }
        .chat-input { background: none; border: none; outline: none; color: ${t.text}; font-family: 'DM Sans', sans-serif; font-size: 13px; flex: 1; resize: none; }
        .chat-input::placeholder { color: ${isDarkMode ? "#444" : "#999"}; }
        .step-row { display: flex; align-items: center; gap: 8px; padding: 6px 0; font-size: 12px; }
        .tag { display: inline-flex; align-items: center; gap: 4px; font-size: 10px; padding: 2px 8px; border-radius: 20px; font-weight: 500; }
        .hero-title { white-space: pre-line; }
        
        .markdown-body h3 { font-size: 15px; font-weight: 700; color: ${t.text}; margin-top: 16px; margin-bottom: 8px; font-family: 'Playfair Display', serif; }
        .markdown-body h3:first-of-type { margin-top: 0; }
        .markdown-body p { margin-bottom: 12px; }
        .markdown-body ul { margin-left: 20px; margin-bottom: 16px; list-style-type: disc; }
        .markdown-body li { margin-bottom: 6px; padding-left: 4px; }
        .markdown-body li::marker { color: ${isDarkMode ? "#c8b89a" : "#8b7355"}; }
        .markdown-body strong { font-weight: 700; color: ${isDarkMode ? '#fff' : '#000'}; }
      `}</style>
      <SellerSidebar />
      {/* MAIN STORE AREA — scrollable */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        height: "100vh",
        background: t.bg,
      }}>
        <SellerHeader />
        {/* SELLER MODE: Studio Views */}
        {appMode === "seller" && (
          <>
            <SellerStoresPanel />
            <SellerPreview />
            <SellerAnalyticsPanel />
            <SellerProductsPanel />
            <SellerSettingsPanel />
            <SellerConnectorsPanel />
          </>
        )}
      </div>
      <SellerChatPanel />
      <SellerModals />
    </div>
    </SellerProvider>
  );
}

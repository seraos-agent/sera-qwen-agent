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
import { Plus } from 'lucide-react';

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
                cover: dbStore.branding?.heroImage || dbStore.branding?.cover || dbStore.hero_image || dbStore.cover || "https://images.unsplash.com/photo-1441984904996-e0b6ba687e08?auto=format&fit=crop&q=80",
                trustScore: "99.9%",
                followers: "1.2K",
                desc: dbStore.description || dbStore.store_desc || dbStore.desc || "Brand Identity",
                products: dbStore.products || [],
                customSchema: dbStore.customSchema || dbStore.schema || null,
                storeData: dbStore.storeData || {},
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
    setStoreData,
    setProducts,
    setDraftSchema,
    setActiveNav,
    setUserStores,
    setVideoFormat,
    setActivePromoTab
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
    if (buildingStage > 0) {
      alert("Please wait for the AI to finish generating the store assets before publishing.");
      return false;
    }
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
      <div className="seller-app-container" style={{
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

        /* --- DESKTOP SPECIFIC STYLES --- */
        @media (min-width: 769px) {
          .chat-floating-btn {
            display: none !important;
          }
        }

        /* --- MOBILE RESPONSIVENESS --- */
        @media (max-width: 768px) {
          .seller-app-container {
            flex-direction: column !important;
          }
          
          /* Sidebar becomes Bottom Navigation */
          .seller-sidebar {
            width: 100% !important;
            height: 60px !important;
            flex-direction: row !important;
            justify-content: space-around !important;
            position: fixed !important;
            bottom: 0 !important;
            border-right: none !important;
            border-top: 1px solid ${t.border} !important;
            z-index: 100 !important;
            padding: 0 !important;
          }
          .seller-sidebar .logo-container {
            display: none !important; /* Hide logo on bottom nav */
          }
          .seller-sidebar .bottom-settings {
            margin-top: 0 !important;
            flex-direction: row !important;
          }
          
          /* Main Content Area */
          .seller-main-content {
            height: calc(100vh - 60px) !important;
            padding-bottom: 20px !important;
          }
          
          /* Header adjustments */
          .seller-header {
            padding: 0 12px !important;
          }
          .seller-header-right {
            gap: 4px !important;
          }
          .seller-header-right button {
            padding: 4px 8px !important;
          }
          
          /* Chat Panel as Full-Screen Overlay */
          .seller-chat-panel {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: calc(100vh - 60px) !important;
            border-radius: 0 !important;
            z-index: 200 !important;
            border: none !important;
          }
          .chat-floating-btn {
            bottom: 70px !important;
            right: 16px !important;
          }
          
          .hide-on-mobile {
            display: none !important;
          }
          
          /* Analytics Mobile Adjustments */
          .analytics-header-container {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px !important;
          }
          .analytics-controls {
            flex-wrap: wrap !important;
            width: 100% !important;
          }
          .analytics-controls select, .analytics-controls button {
            flex: 1 1 auto !important;
          }
          .analytics-kpi-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
          .analytics-layout {
            grid-template-columns: 1fr !important;
          }
          
          /* Inventory Mobile Adjustments */
          .inventory-header-container {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px !important;
          }
          .inventory-controls {
            flex-wrap: wrap !important;
            width: 100% !important;
          }
          .inventory-controls > div, .inventory-controls > button {
            flex: 1 1 auto !important;
          }
          .inventory-controls input {
            width: 100% !important;
          }
          .table-container {
            border: none !important;
            background: transparent !important;
          }
          .inventory-table thead {
            display: none !important;
          }
          .inventory-table, .inventory-table tbody, .inventory-table tr, .inventory-table td {
            display: block !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }
          .inventory-table tr {
            margin-bottom: 16px !important;
            border-radius: 12px !important;
            padding: 16px !important;
            background: var(--card-bg, #161618) !important;
            border: 1px solid var(--card-border, #2a2a2e) !important;
          }
          .inventory-table td {
            padding: 8px 0 !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            border: none !important;
            text-align: right !important;
          }
          .inventory-table td::before {
            content: attr(data-label) !important;
            color: #888 !important;
            font-size: 11px !important;
            text-transform: uppercase !important;
            font-weight: 600 !important;
          }
          .inventory-table .td-product {
            flex-direction: row !important;
            justify-content: flex-start !important;
            margin-bottom: 12px !important;
            padding-bottom: 12px !important;
            border-bottom: 1px dashed rgba(150, 150, 150, 0.2) !important;
          }
          .inventory-table .td-product::before {
            display: none !important;
          }
          .inventory-table .td-checkbox {
            display: none !important;
          }
          .inventory-table .td-actions {
            justify-content: flex-end !important;
            margin-top: 8px !important;
          }
          .inventory-table .td-actions::before {
            display: none !important;
          }
          .inventory-pagination {
            flex-direction: column !important;
            gap: 16px !important;
            border-radius: 12px !important;
          }
          
          /* UI Adjustments for Panels */
          .seller-panel {
            padding: 24px 16px !important;
            padding-bottom: 100px !important;
          }
          .marketing-title-area h2, .analytics-header-container h2 {
            font-size: 20px !important;
          }
          .marketing-title-area p, .analytics-header-container p {
            font-size: 12px !important;
          }
          .marketing-stats-grid h3, .analytics-kpi-grid h3 {
            font-size: 20px !important;
          }
          .marketing-stats-grid > div, .analytics-kpi-grid > div {
            padding: 12px 16px !important;
          }
          .analytics-layout {
            grid-template-columns: 1fr !important;
          }
          
          /* Marketing UI Adjustments */
          .marketing-header {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 16px !important;
          }
          .marketing-title-area {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px !important;
          }
          .marketing-title-area > div:nth-child(2) {
            padding-left: 0 !important;
            border-left: none !important;
            width: 100% !important;
          }
          .marketing-title-area select {
            width: 100% !important;
          }
          .marketing-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .marketing-tabs {
            justify-content: space-between !important;
            gap: 4px !important;
          }
          .marketing-tabs > div {
            flex: 1 !important;
            padding: 10px 4px !important;
            flex-direction: column !important;
            justify-content: center !important;
            text-align: center !important;
            font-size: 10px !important;
            gap: 6px !important;
            border-radius: 12px !important;
          }
          .marketing-tabs > div svg {
            width: 18px !important;
            height: 18px !important;
          }
          .video-campaign-split {
            flex-direction: column !important;
            gap: 24px !important;
          }
          .image-campaigns-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
        <SellerSidebar />
        {/* MAIN STORE AREA — scrollable */}
        <div className="seller-main-content" style={{
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
        {/* Floating Action Button (FAB) for SERA Chat */}
        {appMode === "seller" && !chatOpen && (
          <button
            className="chat-floating-btn"
            onClick={() => setChatOpen(true)}
            style={{
              position: 'fixed',
              bottom: 32,
              right: 32,
              width: 48,
              height: 48,
              borderRadius: 24,
              background: "#c8b89a", /* Premium Gold */
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              zIndex: 90,
              transition: "transform 0.2s, box-shadow 0.2s"
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.2)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)"; }}
            title="Open SERA Chat"
          >
            <Plus size={24} color="#0f0f10" strokeWidth={2.5} />
          </button>
        )}
        <SellerModals />
      </div>
    </SellerProvider>
  );
}

import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/storeContext';
import { CURATED_STORES, getSessionId, INITIAL_PHILOSOPHY } from '../../utils/constants';
import { sendChat, BACKEND_URL } from '../../lib/agentApi';
import { BuyerProvider } from './BuyerContext';
import { useBuyerChat } from './hooks/useBuyerChat';
import { BuyerHeader } from './components/BuyerHeader';
import { BuyerHero } from './components/BuyerHero';
import { BuyerGrid } from './components/BuyerGrid';
import { BuyerFooterNav } from './components/BuyerFooterNav';
import { BuyerChatPanel } from './components/BuyerChatPanel';
import { SelectedStorefront } from './components/SelectedStorefront';
import { BuyerModals } from './components/BuyerModals';
import { BuyerCart } from './components/BuyerCart';
import { BuyerProfile } from './components/BuyerProfile';

export const BuyerApp = ({ isDarkMode, setIsDarkMode, t, DynamicRenderer }) => {
  // setIsDarkMode is kept from parent prop
  const {
    state: {
      appMode, userStores,
      buyerSearchQuery, buyerAiQuery, buyerAiMessages, buyerAiStatus,
      selectedCategoryFilter, followedStores,
      cart, isCartOpen, selectedProductDetail, selectedStorefront, modalQty,
      selectedPhilosophy, toastMessage
    },
    setAppMode, setUserStores,
    setBuyerAiQuery, setBuyerAiMessages, setBuyerAiStatus,
    setSelectedCategoryFilter, setFollowedStores,
    setCart, setIsCartOpen, setSelectedProductDetail, setSelectedStorefront, setModalQty,
    setSelectedPhilosophy, setToastMessage
  } = useStore();

  // ── Fetch all public stores on mount ──────────────────────────────────────
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/stores?session_id=all`)
      .then(r => r.json())
      .then(data => {
        if (data.success && Array.isArray(data.stores)) {
          const formattedStores = data.stores.map(match => {
            const id = match.store_id || match._id || match.id;
            const name = match.store_name || match.name || 'Unknown Store';
            const desc = match.description || match.desc || 'An autonomous AI-curated store.';
            const cover = match.branding?.heroImage || match.branding?.cover || match.cover || null;
            const philosophyItems = match.branding?.philosophy || INITIAL_PHILOSOPHY;
            const validProducts = (match.products || []).filter(
              p => p.name && p.price && !p.name.toLowerCase().includes('generating') && !p.name.includes('...')
            );
            return {
              ...match,
              id,
              name,
              desc,
              category: match.category || 'General',
              cover,
              isUserStore: match.session_id === getSessionId(),
              trustScore: match.trustScore || '97% Trust',
              followers: match.followers || '1.2k',
              customSchema: match.customSchema || {
                id,
                name,
                category: match.category || 'General',
                metadata: { brand_identity: name, objective: desc },
                theme: { themeColor: '#c8b89a', heroBg: 'linear-gradient(135deg, #111113 0%, #1a1a1e 100%)', isDarkMode: true, fontFamily: "'Playfair Display', serif" },
                layout: [
                  { type: 'hero', props: { title: name, subtitle: desc, heroImage: cover, collection: match.branding?.collection || 'New Collection', buttonText: match.branding?.buttonText || 'Shop Now', promoBanner: match.branding?.promoBanner || '', heroVariant: match.branding?.heroVariant || 'centered' } },
                  { type: 'featured_products', props: { products: validProducts } },
                  { type: 'philosophy', props: { items: philosophyItems } },
                  { type: 'footer', props: {} }
                ]
              },
              storeData: { ...match, products: validProducts }
            };
          });
          setUserStores(formattedStores);
        }
      })
      .catch(err => console.error('Failed to fetch public stores:', err));
  }, [setUserStores]);

  // ── Listen for "View Store" events from chat bubbles ──────────────────────
  useEffect(() => {
    const handleOpenStore = (e) => {
      let storeId = '';
      if (typeof e.detail === 'string') storeId = e.detail.trim();
      else if (e.detail?.storeId) storeId = String(e.detail.storeId).trim();
      if (!storeId) return;

      const allStores = [...(userStores || []), ...CURATED_STORES];
      const found = allStores.find(s =>
        String(s.id) === String(storeId) ||
        String(s._id) === String(storeId) ||
        String(s.store_id) === String(storeId) ||
        String(s.name || '').toLowerCase().replace(/\s+/g, '_') === String(storeId).toLowerCase()
      );
      if (found) {
        setSelectedStorefront(found);
        return;
      }
      // Fallback: hit backend
      fetch(`${BACKEND_URL}/api/stores?session_id=all`)
        .then(r => r.json())
        .then(data => {
          const match = (data.stores || []).find(s =>
            String(s.id) === String(storeId) ||
            String(s._id) === String(storeId) ||
            String(s.store_id) === String(storeId)
          );
          if (match) setSelectedStorefront(match);
        })
        .catch(() => { });
    };
    window.addEventListener('sera:openStore', handleOpenStore);

    const handleOpenProduct = (e) => {
      let productId = '';
      if (typeof e.detail === 'string') productId = e.detail.trim();
      else if (e.detail?.productId) productId = String(e.detail.productId).trim();
      if (!productId) return;

      // Try finding the product in already fetched stores
      const allStores = [...(userStores || []), ...CURATED_STORES];
      let foundProduct = null;
      let foundStore = null;

      for (const s of allStores) {
        const prod = (s.products || []).find(p => String(p.id || p.product_id) === String(productId));
        if (prod) {
          foundProduct = prod;
          foundStore = s;
          break;
        }
      }

      if (foundProduct) {
        setSelectedProductDetail({ ...foundProduct, storeId: foundStore.id, storeName: foundStore.name });
      } else {
        // Fallback: we could hit backend but for now just show error or let user know
        console.warn('Product not found in current local stores:', productId);
        setToastMessage('Fetching product details...');
        // Hit search endpoint as fallback
        fetch(`${BACKEND_URL}/api/search-products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: productId })
        })
          .then(r => r.json())
          .then(data => {
            const match = (data.results || []).find(p => String(p.id || p.product_id) === String(productId));
            if (match) {
              setSelectedProductDetail({ ...match, storeId: match.store_id || 'unknown', storeName: match.store_name || 'Store' });
            } else {
              setToastMessage('Product not found.');
              setTimeout(() => setToastMessage(''), 3000);
            }
          })
          .catch(() => {
            setToastMessage('Failed to load product.');
            setTimeout(() => setToastMessage(''), 3000);
          });
      }
    };
    window.addEventListener('sera:openProduct', handleOpenProduct);

    return () => {
      window.removeEventListener('sera:openStore', handleOpenStore);
      window.removeEventListener('sera:openProduct', handleOpenProduct);
    };
  }, [userStores, setSelectedStorefront, setSelectedProductDetail, setToastMessage]);

  // ── Derived state ─────────────────────────────────────────────────────────
  const filteredStores = Array.from(new Map([...CURATED_STORES, ...(userStores || [])].map(s => [s.id || s._id || s.store_id, s])).values()).filter(s => {
    if (selectedCategoryFilter !== 'all' && s.category !== selectedCategoryFilter) return false;
    return true;
  });

  // ── Helper functions ──────────────────────────────────────────────────────
  const getDisplayBrandName = (store) => store?.name || 'Unknown Brand';

  const toggleFollowStore = (storeId) => {
    setFollowedStores(prev => {
      const set = prev instanceof Set ? new Set(prev) : new Set(Array.isArray(prev) ? prev : []);
      if (set.has(storeId)) set.delete(storeId);
      else set.add(storeId);
      return set;
    });
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

  const formatPrice = (priceStr) => {
    if (!priceStr) return '';
    return priceStr.startsWith('$') ? priceStr : `$${priceStr}`;
  };

  const parsePriceNum = (priceStr) => {
    if (!priceStr) return 29.00;
    const s = String(priceStr);
    if (s.toLowerCase().includes('rp')) return parseFloat(s.replace(/[^0-9]/g, '')) || 450000;
    return parseFloat(s.replace(/[^0-9.]/g, '')) || 29.00;
  };

  const formatPriceStr = (num, originalStr) => {
    const s = String(originalStr || '');
    if (s.toLowerCase().includes('rp')) return 'Rp ' + num.toLocaleString('id-ID');
    return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getStockCount = (name) => {
    if (!name) return 46;
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = hash + name.charCodeAt(i);
    return (hash % 45) + 12;
  };

  const getStorePhilosophy = (store) => {
    if (store.isUserStore) return store.customSchema?.layout?.find(l => l.type === 'philosophy')?.props?.items || INITIAL_PHILOSOPHY;
    if (store.storeData?.branding?.philosophy?.length > 0) return store.storeData.branding.philosophy;
    if (store.branding?.philosophy?.length > 0) return store.branding.philosophy;
    return INITIAL_PHILOSOPHY;
  };

  // ── AI Chat hook ──────────────────────────────────────────────────────────
  const chat = useBuyerChat({
    buyerAiQuery,
    setBuyerAiQuery,
    buyerAiMessages,
    setBuyerAiMessages,
    setBuyerAiStatus,
    userStores,
    setSelectedStorefront
  });

  // ── Local UI State ────────────────────────────────────────────────────────
  const [buyerActiveNav, setBuyerActiveNav] = useState('explore');

  // ── Context value (shared across all child components) ────────────────────
  const contextValue = {
    // theme
    t,
    isDarkMode,
    setIsDarkMode,
    // navigation
    buyerActiveNav,
    setBuyerActiveNav,
    // chat panel
    chatOpen: chat.chatOpen,
    setChatOpen: chat.setChatOpen,
    chatWidth: chat.chatWidth,
    startResizing: chat.startResizing,
    isResizing: chat.isResizing,
    abortController: chat.abortController,
    handleAbort: chat.handleAbort,
    streamingMessage: chat.streamingMessage,
    chatEndRef: chat.chatEndRef,
    handleBuyerAiSubmit: chat.handleBuyerAiSubmit,
    // global state passthrough
    appMode, userStores, buyerSearchQuery, buyerAiQuery, buyerAiMessages, buyerAiStatus,
    selectedCategoryFilter, followedStores,
    cart, isCartOpen, selectedProductDetail, selectedStorefront, modalQty, selectedPhilosophy,
    toastMessage,
    // setters
    setAppMode, setBuyerAiQuery, setBuyerAiMessages, setBuyerAiStatus,
    setSelectedCategoryFilter, setFollowedStores,
    setCart, setIsCartOpen, setSelectedProductDetail, setSelectedStorefront,
    setModalQty, setSelectedPhilosophy, setToastMessage,
    // derived
    filteredStores,
    // helpers
    getDisplayBrandName, toggleFollowStore, showToast,
    formatCurrency, formatPrice, parsePriceNum, formatPriceStr,
    getStockCount, getStorePhilosophy,
    // DynamicRenderer (passed from parent)
    DynamicRenderer
  };

  return (
    <BuyerProvider value={contextValue}>
      <style>{`
        /* --- DESKTOP SPECIFIC STYLES --- */
        @media (min-width: 769px) {
          .buyer-bottom-nav {
            display: none !important;
          }
          
          /* Shopping Cart Desktop Styling */
          .cart-item-image {
            width: 200px !important;
            height: 200px !important;
            border-radius: 20px !important;
          }
          .cart-item-info {
            min-height: 200px !important;
          }
          .cart-item-title {
            font-size: 24px !important;
            margin-bottom: 12px !important;
          }
          .cart-item-price {
            font-size: 28px !important;
          }
        }
        
        /* --- BUYER MOBILE RESPONSIVENESS --- */
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          
          .buyer-app-container {
            flex-direction: column !important;
          }
          
          /* Chat Panel as Full-Screen Overlay */
          .buyer-chat-panel {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 66px !important;
            width: auto !important;
            height: auto !important;
            border-radius: 0 !important;
            z-index: 9998 !important;
            border: none !important;
            background: ${isDarkMode ? '#111113' : '#ffffff'} !important;
          }
          
          /* Headers & Layouts */
          .buyer-header {
            padding: 0 16px !important;
          }
          .buyer-content-wrapper {
            padding: 0 16px !important;
          }
          
          /* Typography Shrinks */
          h2 {
            font-size: 18px !important;
          }
          p {
            font-size: 11px !important;
          }
          
          /* Grid Overrides */
          .buyer-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          div[style*="grid-template-columns: repeat(auto-fill, minmax(280px"] {
            grid-template-columns: 1fr 1fr !important;
            gap: 12px !important;
          }
          div[style*="grid-template-columns: repeat(auto-fit, minmax(260px"] {
            grid-template-columns: 1fr 1fr !important;
            gap: 12px !important;
          }
          
          /* Typography inside cards */
          h3 { font-size: 16px !important; }
          h4 { font-size: 13px !important; line-height: 1.2 !important; }
          
          /* Bottom Navigation */
          .buyer-bottom-nav {
            bottom: 0 !important;
            left: 0 !important;
            transform: none !important;
            width: 100% !important;
            border-radius: 0 !important;
            border: none !important;
            border-top: 1px solid ${t.border} !important;
            padding: 12px 24px !important;
            padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px)) !important;
            justify-content: space-between !important;
            gap: 0 !important;
            background: ${isDarkMode ? '#0f0f10' : '#ffffff'} !important;
            box-shadow: none !important;
            box-sizing: border-box !important;
            backdrop-filter: none !important;
            z-index: 9999 !important;
          }
        }
      `}</style>
      <div className="buyer-app-container" style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative', background: t.bg }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', height: '100vh', position: 'relative' }}>
          <BuyerHeader />

          <div style={{ display: buyerActiveNav === 'explore' ? 'block' : 'none' }}>
            <BuyerHero />
            <BuyerGrid />
          </div>

          <div style={{ display: buyerActiveNav === 'following' ? 'block' : 'none', padding: '60px 48px', color: t.text }}>
            <div style={{ marginBottom: 40 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, marginBottom: 12 }}>Following</h2>
              <p style={{ color: t.subtext }}>Stores you love, all in one place.</p>
            </div>
            {(() => {
              const allStores = [...CURATED_STORES, ...(userStores || [])];
              const followedList = allStores.filter(store => followedStores?.has(store.id || store.store_id || store._id));
              
              if (followedList.length === 0) {
                return <div style={{ padding: '40px 0', textAlign: 'center', color: t.subtext, background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', borderRadius: 16 }}>You are not following any stores yet.</div>;
              }
              
              return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
                  {followedList.map(store => (
                    <div
                      key={store.id}
                      onClick={() => setSelectedStorefront(store)}
                      style={{ position: 'relative', aspectRatio: '3/4', borderRadius: 24, overflow: 'hidden', cursor: 'pointer', boxShadow: isDarkMode ? 'none' : '0 12px 32px rgba(0,0,0,0.08)', border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`, transition: 'transform 0.3s ease' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      {store.cover ? (
                        <img loading="lazy" src={store.cover} alt={store.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} onError={e => e.currentTarget.style.display = 'none'} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: isDarkMode ? '#161618' : '#f9fafb', position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>🛍️</div>
                      )}
                      {/* Gradient Overlay */}
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 40%, transparent 100%)', zIndex: 1 }} />
                      {/* Content */}
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, zIndex: 2, display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: 10, fontWeight: 800, color: '#c8b89a', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>{store.category}</span>
                        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 8, lineHeight: 1.1 }}>{store.name}</h3>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, lineHeight: 1.5, marginBottom: 20, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{store.desc}</p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>👥 {store.followers}</span>
                          <button
                            onClick={e => { e.stopPropagation(); toggleFollowStore(store.id || store.store_id || store._id); }}
                            style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', borderRadius: 100, padding: '6px 14px', fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s ease' }}
                          >
                            Following
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          <div style={{ display: buyerActiveNav === 'profile' ? 'block' : 'none' }}>
            <BuyerProfile />
          </div>

          <div style={{ display: buyerActiveNav === 'cart' ? 'block' : 'none' }}>
            <BuyerCart />
          </div>

          <BuyerFooterNav />
        </div>

        <BuyerChatPanel />
        <SelectedStorefront />
        <BuyerModals />

        {/* Toast Notification */}
        {toastMessage && (
          <div style={{
            position: 'fixed', bottom: 120, left: '50%', transform: 'translateX(-50%)',
            background: isDarkMode ? '#1a1a1e' : '#fff',
            border: `1px solid ${t.border}`,
            color: t.text, padding: '12px 24px', borderRadius: 12,
            fontSize: 13, fontWeight: 600, zIndex: 400,
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.3s ease',
            fontFamily: "'DM Sans', sans-serif"
          }}>
            {toastMessage}
          </div>
        )}
      </div>
    </BuyerProvider>
  );
};

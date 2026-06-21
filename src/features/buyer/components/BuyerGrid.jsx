import React from 'react';
import { useBuyerContext } from '../BuyerContext';
import { CURATED_STORES } from '../../../utils/constants';

export const BuyerGrid = () => {
  const {
    t, isDarkMode,
    userStores, buyerSearchQuery, selectedCategoryFilter, setSelectedCategoryFilter,
    followedStores, filteredStores, toggleFollowStore,
    setSelectedStorefront, setSelectedProductDetail, setModalQty,
    getDisplayBrandName
  } = useBuyerContext();

  const [visibleCount, setVisibleCount] = React.useState(12);
  const loaderRef = React.useRef(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount(prev => prev + 12);
        }
      },
      { threshold: 0.1 }
    );
    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, []);


  return (
    <div className="buyer-content-wrapper" style={{ padding: '0 48px', width: '100%', margin: '0 auto' }}>

      {/* Category Filter Tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 40, overflowX: 'auto', paddingBottom: 12, WebkitOverflowScrolling: 'touch' }}>
        {['all', 'Modern Lifestyle', 'Artisanal Coffee', 'Creator Gadgets', 'Organic Skincare'].map(cat => {
          const displayCat = cat === 'all' ? 'All'
            : cat === 'Modern Lifestyle' ? 'Lifestyle'
              : cat === 'Artisanal Coffee' ? 'Coffee'
                : cat === 'Creator Gadgets' ? 'Electronics'
                  : cat === 'Organic Skincare' ? 'Skincare' : cat;

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategoryFilter(cat)}
              style={{
                background: selectedCategoryFilter === cat ? (isDarkMode ? '#c8b89a' : '#8b7355') : (isDarkMode ? '#1a1a1e' : '#f3f4f6'),
                color: selectedCategoryFilter === cat ? (isDarkMode ? '#0f0f10' : '#ffffff') : (isDarkMode ? '#ffffff' : '#111827'),
                border: `1px solid ${selectedCategoryFilter === cat ? 'transparent' : (isDarkMode ? '#2a2a2e' : '#e5e7eb')}`,
                borderRadius: 100, padding: '6px 16px', fontSize: 12,
                fontWeight: selectedCategoryFilter === cat ? 700 : 500,
                cursor: 'pointer', whiteSpace: 'nowrap'
              }}
              onMouseEnter={e => { if (selectedCategoryFilter !== cat) e.currentTarget.style.background = isDarkMode ? '#2a2a2e' : '#e5e7eb'; }}
              onMouseLeave={e => { if (selectedCategoryFilter !== cat) e.currentTarget.style.background = isDarkMode ? '#1a1a1e' : '#f3f4f6'; }}
            >
              {displayCat}
            </button>
          )
        })}
      </div>

      {/* Top Curated Stores */}
      <div style={{ marginBottom: 56 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4, flexWrap: 'wrap' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: t.text, margin: 0 }}>Top Curated Stores</h2>
            <span style={{ fontSize: 10, color: '#c8b89a', fontWeight: 700, background: isDarkMode ? '#1a1a1e' : '#f3f4f6', padding: '2px 8px', borderRadius: 12, border: `1px solid ${t.border}`, whiteSpace: 'nowrap' }}>
              AI Verified
            </span>
          </div>
          <p style={{ color: t.subtext, fontSize: 13, margin: 0 }}>Discover autonomous AI-powered brands backed by verified reputation and trust indicators.</p>
        </div>
        <div className="buyer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
          {filteredStores.map(store => {
            const isFollowing = followedStores instanceof Set ? followedStores.has(store.id) : false;
            return (
              <div
                key={store.id}
                onClick={() => setSelectedStorefront(store)}
                style={{ position: 'relative', aspectRatio: '3/4', borderRadius: 24, overflow: 'hidden', cursor: 'pointer', boxShadow: isDarkMode ? 'none' : '0 12px 32px rgba(0,0,0,0.08)', border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`, transition: 'transform 0.3s ease' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {store.cover ? (
                  <img src={store.cover} alt={store.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} onError={e => e.currentTarget.style.display = 'none'} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: isDarkMode ? '#161618' : '#f9fafb', position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>🛍️</div>
                )}
                {/* Trust Badge */}
                <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 3 }}>
                  <div style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', padding: '4px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4, border: '1px solid rgba(255,255,255,0.1)' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80' }} />
                    <span style={{ color: '#fff', fontSize: 9, fontWeight: 700, letterSpacing: 0.5 }}>{(store.trustScore || '').replace(/ Trust/i, '')}</span>
                  </div>
                </div>
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
                      onClick={e => { e.stopPropagation(); toggleFollowStore(store.id); }}
                      style={{ background: isFollowing ? 'rgba(255,255,255,0.1)' : '#c8b89a', color: isFollowing ? '#fff' : '#0f0f10', border: isFollowing ? '1px solid rgba(255,255,255,0.2)' : 'none', backdropFilter: isFollowing ? 'blur(8px)' : 'none', borderRadius: 100, padding: '6px 14px', fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s ease' }}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Featured Video Campaigns */}
      {(() => {
        const allCampaigns = [];
        Array.from(new Map([...CURATED_STORES, ...(userStores || [])].map(s => [s.id || s._id || s.store_id, s])).values()).forEach(s => {
          const sData = s.storeData || s.customSchema?.storeData || s.schema?.storeData || {};
          const videos = sData.promoVideos?.length > 0 ? sData.promoVideos
            : sData.promoVideo ? [sData.promoVideo]
              : s.promoVideo ? [s.promoVideo]
                : sData.branding?.promoVideos?.length > 0 ? sData.branding.promoVideos
                  : s.branding?.promoVideos?.length > 0 ? s.branding.promoVideos
                    : sData.branding?.promoVideo ? [sData.branding.promoVideo]
                      : s.branding?.promoVideo ? [s.branding.promoVideo]
                        : sData.branding?.videoUrl ? [sData.branding.videoUrl]
                          : s.branding?.videoUrl ? [s.branding.videoUrl]
                            : [];
          [...new Set(videos)].forEach((vidUrl, idx) => {
            allCampaigns.push({ id: `${s.id}-promo-${idx}`, store: s, videoUrl: vidUrl });
          });
        });
        if (allCampaigns.length === 0) return null;
        return (
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: t.text, margin: 0 }}>Featured Video Campaigns</h2>
                <span style={{ background: "rgba(239, 68, 68, 0.9)", color: "#fff", fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 100, textTransform: "uppercase", letterSpacing: 0.5 }}>Flash Sale</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
              {allCampaigns.map(camp => (
                <div key={camp.id} style={{ width: "100%", cursor: 'pointer' }} onClick={e => { e.stopPropagation(); window.dispatchEvent(new CustomEvent('sera:openStore', { detail: { storeId: camp.store.id || camp.store.store_id || camp.store._id } })); }}>
                  <div style={{ borderRadius: 16, overflow: 'hidden', position: 'relative', aspectRatio: '9/16', background: t.card, border: `1px solid ${t.border}` }}>
                    <video src={camp.videoUrl} autoPlay loop muted playsInline preload="auto"
                      onCanPlay={e => { e.currentTarget.style.opacity = '1'; }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0, transition: 'opacity 0.4s ease' }}
                    />
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "40%", background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)", pointerEvents: "none" }} />
                    <div style={{ position: "absolute", bottom: "8px", left: "8px", right: "8px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12 }}>
                      <p style={{ color: "#fff", fontSize: 11, fontWeight: 500, margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textShadow: "0 1px 2px rgba(0,0,0,0.8)", lineHeight: 1.3 }}>{camp.store?.storeData?.description || "Curated specifically for you. Tap to view the full catalog."}</p>
                      <span style={{ background: "rgba(239, 68, 68, 0.9)", backdropFilter: "blur(4px)", color: "#fff", fontSize: 8, fontWeight: 800, padding: "3px 8px", borderRadius: 100, textTransform: "uppercase", letterSpacing: 0.5, flexShrink: 0 }}>View Store</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Trending Products From Stores */}
      <div style={{ marginBottom: 56 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: t.text, marginBottom: 4 }}>Trending Products From Stores</h2>
            <p style={{ color: t.subtext, fontSize: 13 }}>Curated items directly promoted by our top AI storefronts.</p>
          </div>
          <span style={{ fontSize: 12, color: t.subtext }}>Updated in real-time</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {(() => {
            const allProducts = Array.from(new Map([...CURATED_STORES, ...(userStores || [])].map(s => [s.id || s._id || s.store_id, s])).values())
              .flatMap(s =>
                (s.storeData?.products || s.products || (s.customSchema || s.schema)?.layout?.find(l => l.type === 'featured_products')?.props?.products || [])
                  .filter(p => p.name && p.price && !p.name.toLowerCase().includes('generating') && !p.name.includes('...'))
                  .map(p => ({
                    id: p.name || p.id,
                    name: p.name, price: p.price,
                    desc: p.description || p.desc,
                    image: p.imageUrl || p.image,
                    verticalVideoUrl: p.verticalVideoUrl,
                    landscapeVideoUrl: p.landscapeVideoUrl,
                    storeId: s.id || s.store_id || s._id,
                    store: (s.customSchema || s.schema)?.metadata?.brand_identity || s.storeData?.title || s.name || 'AI Store',
                    aiTag: p.promo || 'Trending',
                    rating: 4.8,
                    sales: 340 + (((p.id || p.name || 'A').charCodeAt(0) * 43) % 500)
                  }))
              )
              .filter(p => selectedCategoryFilter === 'all' || [...CURATED_STORES, ...(userStores || [])].find(s => s.id === p.storeId)?.category === selectedCategoryFilter)
              .filter(p => !buyerSearchQuery || p.name.toLowerCase().includes(buyerSearchQuery.toLowerCase()) || p.store.toLowerCase().includes(buyerSearchQuery.toLowerCase()) || p.aiTag.toLowerCase().includes(buyerSearchQuery.toLowerCase()));

            return (
              <>
                {allProducts.slice(0, visibleCount).map(prod => (
                  <div
                    key={prod.id}
                    onClick={() => {
                      setSelectedProductDetail({ name: prod.name, price: prod.price, desc: prod.desc || 'Premium curated item directly promoted by our top AI storefronts.', imageUrl: prod.image, verticalVideoUrl: prod.verticalVideoUrl, landscapeVideoUrl: prod.landscapeVideoUrl, promo: prod.aiTag, store: prod.store, rating: prod.rating, sales: prod.sales });
                      setModalQty(1);
                    }}
                    style={{ background: isDarkMode ? '#161618' : '#fff', border: `1px solid ${t.border}`, borderRadius: 16, overflow: 'hidden', transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column', cursor: 'pointer', boxShadow: isDarkMode ? 'none' : '0 6px 18px rgba(0,0,0,0.03)' }}
                  >
                    <div style={{ height: 220, width: '100%', background: '#1a1a1e', position: 'relative' }}>
                      <img src={prod.image} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(200,184,154,0.9)', color: '#0f0f10', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, backdropFilter: 'blur(4px)' }}>
                        {prod.aiTag}
                      </div>
                    </div>
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <span
                        onClick={e => { e.stopPropagation(); window.dispatchEvent(new CustomEvent('sera:openStore', { detail: { storeId: prod.storeId } })); }}
                        style={{ fontSize: 11, color: '#c8b89a', marginBottom: 4, fontWeight: 700, cursor: 'pointer' }}
                      >
                        View Store
                      </span>
                      <h4 style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 4, lineHeight: 1.3 }}>{prod.name}</h4>
                      <p style={{ fontSize: 12, color: t.subtext, marginBottom: 12, lineHeight: 1.4, flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{prod.desc}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: `1px solid ${t.border}` }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: isDarkMode ? '#c8b89a' : '#8b7355' }}>{prod.price}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: t.subtext }}>
                          <span>⭐ {prod.rating}</span>
                          <span>•</span>
                          <span>{prod.sales}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={loaderRef} style={{ width: '100%', height: 20, padding: 10, display: "flex", justifyContent: "center" }}>
                  {visibleCount < allProducts.length && <span style={{ color: t.subtext, fontSize: 12 }}>Loading more items...</span>}
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useBuyerContext } from '../BuyerContext';
import { CURATED_STORES } from '../../../utils/constants';

export const SelectedStorefront = () => {
  const {
    t, isDarkMode,
    selectedStorefront, setSelectedStorefront,
    followedStores, toggleFollowStore, showToast,
    chatOpen, chatWidth, setChatOpen,
    getStorePhilosophy,
    setSelectedProductDetail, setModalQty, setSelectedPhilosophy,
    DynamicRenderer
  } = useBuyerContext();

  if (!selectedStorefront) return null;

  const getDisplayBrandName = (store) => store?.name || 'Unknown Brand';

  return (
    <div style={{
      position: 'fixed', top: 0, bottom: 0, left: 0,
      right: chatOpen ? chatWidth : 0,
      background: isDarkMode ? '#0f0f10' : '#fff',
      zIndex: 180, overflowY: 'auto',
      display: 'flex', flexDirection: 'column',
      animation: 'fadeIn 0.3s ease',
      borderRight: chatOpen ? `1px solid ${t.border}` : 'none'
    }}>
      {/* Top Bar / Back Navigation */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: isDarkMode ? 'rgba(15,15,16,0.9)' : 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${t.border}`,
        padding: '16px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <button
          onClick={() => setSelectedStorefront(null)}
          style={{ background: 'none', border: 'none', color: t.text, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Back to AI Discovery
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: '#4ade80', background: 'rgba(74,222,128,0.1)', padding: '4px 12px', borderRadius: 20, border: '1px solid rgba(74,222,128,0.2)', fontWeight: 600 }}>
            Verified AI Brand • {selectedStorefront.trustScore} Trust
          </span>
          <button
            onClick={() => {
              toggleFollowStore(selectedStorefront.id);
              showToast(followedStores.has(selectedStorefront.id)
                ? `Unfollowed ${selectedStorefront.name}`
                : `Following ${selectedStorefront.name}!`
              );
            }}
            style={{
              background: followedStores.has(selectedStorefront.id) ? (isDarkMode ? '#2a2a2e' : '#e5e7eb') : '#c8b89a',
              color: followedStores.has(selectedStorefront.id) ? t.text : '#0f0f10',
              border: 'none', borderRadius: 12,
              padding: '8px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer'
            }}
          >
            {followedStores.has(selectedStorefront.id) ? 'Following' : 'Follow'}
          </button>
          {!chatOpen && (
            <button
              onClick={() => setChatOpen(true)}
              style={{
                marginLeft: 8, background: isDarkMode ? '#1a1a1e' : '#f3f4f6',
                border: `1px solid ${isDarkMode ? '#2a2a2e' : '#e5e7eb'}`,
                borderRadius: 6, padding: '4px 10px', cursor: 'pointer',
                color: isDarkMode ? '#c8b89a' : '#82693f',
                fontSize: 11, fontFamily: "'DM Sans', sans-serif",
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all 0.2s', fontWeight: 600
              }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              Open SERA
            </button>
          )}
        </div>
      </div>

      {/* Legacy Store Cover Banner (no customSchema) */}
      {!selectedStorefront.customSchema && (() => {
        const stData = selectedStorefront.storeData || {};
        const sVids = stData.storeVideos?.length > 0
          ? stData.storeVideos
          : stData.storeVideo ? [stData.storeVideo]
          : stData.branding?.storeVideos?.length > 0 ? stData.branding.storeVideos
          : selectedStorefront.branding?.storeVideos?.length > 0 ? selectedStorefront.branding.storeVideos
          : stData.branding?.storeVideo ? [stData.branding.storeVideo]
          : selectedStorefront.branding?.storeVideo ? [selectedStorefront.branding.storeVideo]
          : [];

        return (
          <>
            {/* Hero Banner */}
            <div style={{
              position: 'relative', width: '100%', minHeight: '450px', flexShrink: 0,
              background: selectedStorefront.cover
                ? `url('${selectedStorefront.cover}') center/cover no-repeat`
                : (isDarkMode ? '#1a1a1e' : '#f3f4f6'),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '80px 0', borderBottom: `1px solid ${t.border}`, overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: selectedStorefront.cover
                  ? 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)'
                  : (isDarkMode ? 'linear-gradient(to bottom, rgba(15,15,16,0.3) 0%, rgba(15,15,16,0.85) 100%)' : 'linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.85) 100%)'),
                zIndex: 1
              }} />
              <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 20px', maxWidth: 800 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#c8b89a', letterSpacing: 4, textTransform: 'uppercase', display: 'block', marginBottom: 16 }}>
                  {selectedStorefront.category || 'Verified Brand'}
                </span>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 64, fontWeight: 700, color: selectedStorefront.cover ? '#fff' : t.text, marginBottom: 20, lineHeight: 1.1 }}>
                  {selectedStorefront.name}
                </h1>
                <p style={{ fontSize: 18, color: selectedStorefront.cover ? 'rgba(255,255,255,0.8)' : t.subtext, lineHeight: 1.6, maxWidth: 600, margin: '0 auto' }}>
                  {selectedStorefront.desc}
                </p>
              </div>
            </div>

            {/* Store Videos */}
            {sVids.length > 0 && (
              <section style={{ padding: '60px 40px', background: isDarkMode ? '#0f0f10' : '#ffffff' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
                  {[...new Set(sVids)].map((vidUrl, i) => (
                    <div key={i} style={{ maxWidth: 1100, margin: '0 auto', borderRadius: 24, overflow: 'hidden', position: 'relative', aspectRatio: '21/9', background: '#000', boxShadow: '0 24px 60px rgba(0,0,0,0.5)', width: '100%' }}>
                      <video
                        src={vidUrl} autoPlay loop muted playsInline preload="auto"
                        onCanPlay={e => { e.currentTarget.style.opacity = '0.8'; }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0, transition: 'opacity 0.5s ease' }}
                      />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '40px 60px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                          <span style={{ background: '#ef4444', color: '#fff', fontSize: 11, fontWeight: 800, padding: '4px 12px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: 1 }}>Flash Sale</span>
                          <span style={{ color: '#fff', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80' }} /> Live Now
                          </span>
                        </div>
                        <h2 style={{ fontSize: 42, color: '#fff', fontFamily: "'Playfair Display', serif", fontWeight: 700, marginBottom: 12, lineHeight: 1.1 }}>Exclusive Collection</h2>
                        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, maxWidth: 500, lineHeight: 1.5, marginBottom: 24 }}>Explore our cinematic product showcases directly inside the storefront.</p>
                        <button style={{ background: '#fff', color: '#000', border: 'none', borderRadius: 8, padding: '12px 32px', fontSize: 14, fontWeight: 700, cursor: 'pointer', width: 'fit-content', transition: 'transform 0.2s' }}>Shop Featured</button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        );
      })()}

      {/* Dynamic Store Content */}
      <div style={{ flex: 1 }}>
        <DynamicRenderer
          layout={selectedStorefront.customSchema
            ? selectedStorefront.customSchema.layout.map(s => {
                if (s.type === 'featured_products' && s.props?.products) {
                  return {
                    ...s,
                    props: {
                      ...s.props,
                      products: s.props.products.filter(p => p.name && p.name.trim() !== '' && p.price && !p.name.toLowerCase().includes('generating') && !p.name.includes('...'))
                    }
                  };
                }
                return s;
              })
            : [
                { id: `store-header-${selectedStorefront.id}`, type: 'header', variant: 'default', props: { title: selectedStorefront.name } },
                { id: `store-products-${selectedStorefront.id}`, type: 'featured_products', variant: 'grid', props: { sectionTitle: 'Signature Items' } },
                { id: `store-phil-${selectedStorefront.id}`, type: 'philosophy', variant: 'scroller', props: { items: getStorePhilosophy(selectedStorefront), themeColor: '#c8b89a' } },
                { id: `store-foot-${selectedStorefront.id}`, type: 'footer', variant: 'default', props: { title: selectedStorefront.name, subtitle: selectedStorefront.desc, themeColor: '#c8b89a' } }
              ]
          }
          globalProps={{
            ...(selectedStorefront.customSchema?.layout?.find(s => s.type === 'hero')?.props || {}),
            ...(selectedStorefront.storeData || {}),
            title: selectedStorefront.name || selectedStorefront.storeData?.title || selectedStorefront.customSchema?.metadata?.brand_identity || selectedStorefront.customSchema?.layout?.find(s => s.type === 'hero')?.props?.title,
            subtitle: selectedStorefront.desc || selectedStorefront.storeData?.subtitle || selectedStorefront.customSchema?.metadata?.objective || selectedStorefront.customSchema?.layout?.find(s => s.type === 'hero')?.props?.subtitle || 'Premium quality curated for you.',
            collection: selectedStorefront.storeData?.collection || selectedStorefront.customSchema?.layout?.find(s => s.type === 'hero')?.props?.collection || 'New Collection',
            buttonText: selectedStorefront.storeData?.buttonText || selectedStorefront.customSchema?.layout?.find(s => s.type === 'hero')?.props?.buttonText || 'Shop Now',
            branding: selectedStorefront.branding || {},
            themeColor: selectedStorefront.customSchema ? (selectedStorefront.customSchema.theme?.themeColor || '#c8b89a') : '#c8b89a',
            products: selectedStorefront.customSchema
              ? (selectedStorefront.customSchema?.layout?.find(s => s.type === 'featured_products')?.props?.products || [])
              : (selectedStorefront.storeData?.products || selectedStorefront.schema?.layout?.find(s => s.type === 'featured_products')?.props?.products || []),
            isDarkMode,
            onSelectProduct: (prod) => {
              setSelectedProductDetail({ ...prod, store: selectedStorefront.name });
              setModalQty(1);
            },
            onSelectPhilosophy: setSelectedPhilosophy,
            isBuyerMode: true
          }}
        />
      </div>
    </div>
  );
};

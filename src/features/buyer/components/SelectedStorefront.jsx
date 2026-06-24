import React, { useState } from 'react';
import { VideoPlayer } from '../../../components/VideoPlayer';
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
      borderRight: chatOpen ? `1px solid ${t.border}` : 'none',
      paddingBottom: 100 // Extra padding to prevent bottom nav from covering content
    }}>
      {/* Header */}
          <div style={{
            position: 'sticky', top: 0, zIndex: 50,
            background: isDarkMode ? 'rgba(17,17,19,0.85)' : 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            borderBottom: `1px solid ${t.border}`,
            padding: '6px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', width: 60 }}>
              <button 
                onClick={() => setSelectedStorefront(null)}
                style={{ background: 'none', border: 'none', color: t.text, cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
                title="Back to Explore"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"></path></svg>
              </button>
            </div>

            <div style={{ display: 'flex', gap: 'clamp(12px, 3vw, 24px)', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
              <a 
                href="#featured_products" 
                onClick={(e) => { e.preventDefault(); document.querySelector('.section-wrapper-featured_products')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} 
                style={{ color: isDarkMode ? '#9ca3af' : '#6b7280', textDecoration: "none", fontSize: 'clamp(11px, 2vw, 13px)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = isDarkMode ? '#ffffff' : '#000000'}
                onMouseLeave={e => e.currentTarget.style.color = isDarkMode ? '#9ca3af' : '#6b7280'}
              >Shop</a>
              <a 
                href="#philosophy" 
                onClick={(e) => { e.preventDefault(); document.querySelector('.section-wrapper-philosophy')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} 
                style={{ color: isDarkMode ? '#9ca3af' : '#6b7280', textDecoration: "none", fontSize: 'clamp(11px, 2vw, 13px)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = isDarkMode ? '#ffffff' : '#000000'}
                onMouseLeave={e => e.currentTarget.style.color = isDarkMode ? '#9ca3af' : '#6b7280'}
              >Our Story</a>
              <a 
                href="#footer" 
                onClick={(e) => { e.preventDefault(); document.querySelector('.section-wrapper-footer')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} 
                style={{ color: isDarkMode ? '#9ca3af' : '#6b7280', textDecoration: "none", fontSize: 'clamp(11px, 2vw, 13px)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = isDarkMode ? '#ffffff' : '#000000'}
                onMouseLeave={e => e.currentTarget.style.color = isDarkMode ? '#9ca3af' : '#6b7280'}
              >FAQ</a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 60, justifyContent: 'flex-end' }}>
              {!chatOpen && (
                <button 
                  onClick={() => setChatOpen(true)}
                  style={{ background: '#c8b89a', color: '#0f0f10', border: 'none', borderRadius: 16, padding: '4px 10px', fontSize: 10, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, transition: 'transform 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  title="Open AI Concierge"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                  SERA
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
            <div className="section-wrapper-hero" style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '21 / 9',
              minHeight: 400,
              maxHeight: '80vh',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: selectedStorefront.cover ? `url('${selectedStorefront.cover}')` : (isDarkMode ? "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80')" : "url('https://images.unsplash.com/photo-1441984904996-e0b6ba687e08?auto=format&fit=crop&q=80')"),
                backgroundSize: 'cover', backgroundPosition: 'center',
                filter: 'blur(0)',
                transform: 'scale(1.05)',
                transition: 'transform 0.5s ease'
              }} />
              <div style={{
                position: 'absolute', inset: 0,
                background: selectedStorefront.cover
                  ? 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)'
                  : (isDarkMode ? 'linear-gradient(to bottom, rgba(15,15,16,0.3) 0%, rgba(15,15,16,0.85) 100%)' : 'linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.85) 100%)'),
                zIndex: 1
              }} />
              <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 16px', maxWidth: 800 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: '#c8b89a', letterSpacing: 4, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                  {selectedStorefront.category || 'Verified Brand'}
                </span>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(20px, 5vw, 48px)', fontWeight: 700, color: selectedStorefront.cover ? '#fff' : t.text, marginBottom: 8, lineHeight: 1.1 }}>
                  {selectedStorefront.name}
                </h1>
                <p style={{ fontSize: 'clamp(11px, 3vw, 16px)', color: selectedStorefront.cover ? 'rgba(255,255,255,0.8)' : t.subtext, lineHeight: 1.4, maxWidth: 600, margin: '0 auto' }}>
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
                      <VideoPlayer
                        key={vidUrl}
                        src={vidUrl}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8, transition: 'opacity 0.5s ease' }}
                      />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 'clamp(20px, 4vw, 40px) clamp(20px, 6vw, 60px)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                          <span style={{ background: '#ef4444', color: '#fff', fontSize: 11, fontWeight: 800, padding: '4px 12px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: 1 }}>Flash Sale</span>
                          <span style={{ color: '#fff', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80' }} /> Live Now
                          </span>
                        </div>
                        <h2 style={{ fontSize: 'clamp(24px, 5vw, 42px)', color: '#fff', fontFamily: "'Playfair Display', serif", fontWeight: 700, marginBottom: 12, lineHeight: 1.1 }}>Exclusive Collection</h2>
                        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'clamp(14px, 3vw, 16px)', maxWidth: 500, lineHeight: 1.5, marginBottom: 24 }}>Explore our cinematic product showcases directly inside the storefront.</p>
                        <button style={{ background: '#fff', color: '#000', border: 'none', borderRadius: 8, padding: 'clamp(8px, 2vw, 12px) clamp(20px, 4vw, 32px)', fontSize: 14, fontWeight: 700, cursor: 'pointer', width: 'fit-content', transition: 'transform 0.2s' }}>Shop Featured</button>
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

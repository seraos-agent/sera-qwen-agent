import React from 'react';
import confetti from 'canvas-confetti';
import { useBuyerContext } from '../BuyerContext';

export const BuyerModals = () => {
  const {
    t, isDarkMode,
    selectedPhilosophy, setSelectedPhilosophy,
    selectedProductDetail, setSelectedProductDetail,
    modalQty, setModalQty,
    setCart, showToast,
    getStockCount, parsePriceNum, formatPriceStr
  } = useBuyerContext();

  return (
    <>
      {/* PHILOSOPHY DETAIL MODAL */}
      {selectedPhilosophy && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', padding: 20 }}
          onClick={() => setSelectedPhilosophy(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: isDarkMode ? '#161618' : '#fff', border: `1px solid ${t.border}`, borderRadius: 24, overflow: 'hidden', width: '100%', maxWidth: 800, display: 'flex', flexDirection: window.innerWidth < 768 ? 'column' : 'row', boxShadow: '0 24px 60px rgba(0,0,0,0.6)', maxHeight: '90vh' }}
          >
            <div style={{ width: window.innerWidth < 768 ? '100%' : '45%', background: '#1a1a1e', position: 'relative', minHeight: 300 }}>
              <img src={selectedPhilosophy.imageUrl} alt={selectedPhilosophy.label || selectedPhilosophy.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ width: window.innerWidth < 768 ? '100%' : '55%', padding: '40px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 20 }}>
                <button onClick={() => setSelectedPhilosophy(null)} style={{ background: 'none', border: 'none', color: t.subtext, cursor: 'pointer', fontSize: 20 }}>&times;</button>
              </div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, color: t.text, marginBottom: 24, lineHeight: 1.2 }}>
                {selectedPhilosophy.label || selectedPhilosophy.title}
              </h2>
              <p style={{ fontSize: 16, color: t.subtext, lineHeight: 1.8, fontWeight: 300 }}>
                {selectedPhilosophy.sub || selectedPhilosophy.body}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT DETAIL MODAL (QUICK VIEW / PDP) */}
      {selectedProductDetail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', padding: 20 }}>
          <div style={{ background: isDarkMode ? '#161618' : '#fff', border: `1px solid ${t.border}`, borderRadius: 24, overflow: 'hidden', width: '100%', maxWidth: 850, display: 'flex', flexDirection: window.innerWidth < 768 ? 'column' : 'row', boxShadow: '0 24px 60px rgba(0,0,0,0.6)', maxHeight: '90vh' }}>
            {/* Left: Image / Video */}
            <div style={{ width: window.innerWidth < 768 ? '100%' : '50%', background: '#1a1a1e', position: 'relative', minHeight: 300 }}>
              {selectedProductDetail.verticalVideoUrl ? (
                <video src={selectedProductDetail.verticalVideoUrl} autoPlay loop muted playsInline preload="auto"
                  onCanPlay={e => { e.currentTarget.style.opacity = '1'; }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0, transition: 'opacity 0.4s ease' }}
                />
              ) : selectedProductDetail.landscapeVideoUrl ? (
                <video src={selectedProductDetail.landscapeVideoUrl} autoPlay loop muted playsInline preload="auto"
                  onCanPlay={e => { e.currentTarget.style.opacity = '1'; }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0, transition: 'opacity 0.4s ease' }}
                />
              ) : (
                <img src={selectedProductDetail.imageUrl} alt={selectedProductDetail.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
              {selectedProductDetail.promo && (
                <div style={{ position: 'absolute', top: 20, left: 20, background: '#c8b89a', color: '#0f0f10', fontSize: 11, fontWeight: 800, padding: '6px 12px', borderRadius: 8 }}>
                  {selectedProductDetail.promo}
                </div>
              )}
            </div>

            {/* Right: Content */}
            <div style={{ width: window.innerWidth < 768 ? '100%' : '50%', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflowY: 'auto' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, color: t.subtext, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{selectedProductDetail.store}</span>
                  <button onClick={() => setSelectedProductDetail(null)} style={{ background: 'none', border: 'none', color: t.subtext, cursor: 'pointer', fontSize: 20 }}>&times;</button>
                </div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: t.text, marginBottom: 16, lineHeight: 1.2 }}>{selectedProductDetail.name}</h2>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: isDarkMode ? '#c8b89a' : '#8b7355' }}>{selectedProductDetail.price}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 13, color: '#c8b89a', background: isDarkMode ? '#111113' : '#f3f4f6', padding: '4px 10px', borderRadius: 6, border: `1px solid ${t.border}` }}>
                      • {getStockCount(selectedProductDetail.name)} in stock
                    </span>
                    {selectedProductDetail.rating && (
                      <span style={{ fontSize: 13, color: t.subtext, background: isDarkMode ? '#111113' : '#f3f4f6', padding: '4px 10px', borderRadius: 6 }}>
                        ⭐ {selectedProductDetail.rating} • {selectedProductDetail.sales}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 20, marginBottom: 28 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Description</h4>
                  <p style={{ fontSize: 14, color: t.subtext, lineHeight: 1.6 }}>{selectedProductDetail.desc}</p>
                </div>
              </div>

              <div>
                {/* Quantity */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>Quantity</span>
                  <div style={{ display: 'flex', alignItems: 'center', background: isDarkMode ? '#111113' : '#f3f4f6', border: `1px solid ${t.border}`, borderRadius: 10, overflow: 'hidden' }}>
                    <button onClick={() => setModalQty(Math.max(1, modalQty - 1))} style={{ background: 'none', border: 'none', color: t.text, width: 36, height: 36, cursor: 'pointer', fontSize: 16, fontWeight: 600 }}>-</button>
                    <span style={{ width: 40, textAlign: 'center', fontSize: 14, fontWeight: 700, color: t.text }}>{modalQty}</span>
                    <button onClick={() => setModalQty(modalQty + 1)} style={{ background: 'none', border: 'none', color: t.text, width: 36, height: 36, cursor: 'pointer', fontSize: 16, fontWeight: 600 }}>+</button>
                  </div>
                </div>

                {/* Add to Cart */}
                <div style={{ display: 'flex', gap: 16 }}>
                  <button
                    onClick={() => {
                      const priceClean = parsePriceNum(selectedProductDetail.price);
                      setCart(prev => {
                        const existingIndex = prev.findIndex(item => item.name === selectedProductDetail.name && item.store === selectedProductDetail.store);
                        if (existingIndex > -1) {
                          const next = [...prev];
                          next[existingIndex] = { ...next[existingIndex], qty: next[existingIndex].qty + modalQty };
                          return next;
                        }
                        return [...prev, { ...selectedProductDetail, qty: modalQty, priceNum: priceClean, id: Math.random().toString(36).substr(2, 9) }];
                      });
                      setSelectedProductDetail(null);
                      showToast(`Added ${modalQty}x ${selectedProductDetail.name} to Cart!`);
                      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 }, zIndex: 300 });
                    }}
                    style={{ flex: 1, background: '#c8b89a', color: '#0f0f10', border: 'none', borderRadius: 14, padding: '16px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 24px rgba(200,184,154,0.3)', transition: 'transform 0.2s' }}
                  >
                    Add to Cart • {formatPriceStr(parsePriceNum(selectedProductDetail.price) * modalQty, selectedProductDetail.price)}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

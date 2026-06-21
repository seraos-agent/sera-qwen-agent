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
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', padding: 'clamp(12px, 3vw, 20px)' }}
          onClick={() => setSelectedPhilosophy(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ position: 'relative', background: isDarkMode ? '#161618' : '#fff', border: `1px solid ${t.border}`, borderRadius: 24, overflow: 'hidden', width: '100%', maxWidth: 800, display: 'flex', flexDirection: window.innerWidth < 768 ? 'column' : 'row', boxShadow: '0 24px 60px rgba(0,0,0,0.6)', maxHeight: '85vh' }}
          >
            <button onClick={() => setSelectedPhilosophy(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 24, width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>&times;</button>
            <div style={{ width: window.innerWidth < 768 ? '100%' : '45%', background: '#1a1a1e', position: 'relative', height: window.innerWidth < 768 ? 'clamp(150px, 30vh, 250px)' : 'auto', minHeight: window.innerWidth < 768 ? 0 : 300 }}>
              <img src={selectedPhilosophy.imageUrl} alt={selectedPhilosophy.label || selectedPhilosophy.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ width: window.innerWidth < 768 ? '100%' : '55%', padding: 'clamp(20px, 5vw, 40px)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(20px, 5vw, 36px)', fontWeight: 700, color: t.text, marginBottom: 'clamp(12px, 3vw, 24px)', lineHeight: 1.2, paddingRight: 24 }}>
                {selectedPhilosophy.label || selectedPhilosophy.title}
              </h2>
              <p style={{ fontSize: 'clamp(12px, 3.5vw, 16px)', color: t.subtext, lineHeight: 1.8, fontWeight: 300 }}>
                {selectedPhilosophy.sub || selectedPhilosophy.body}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT DETAIL MODAL (QUICK VIEW / PDP) */}
      {selectedProductDetail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: window.innerWidth < 768 ? 'flex-end' : 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', padding: window.innerWidth < 768 ? 0 : 'clamp(12px, 3vw, 20px)' }} onClick={() => setSelectedProductDetail(null)}>
          
          <div onClick={e => e.stopPropagation()} style={{ position: 'relative', background: isDarkMode ? '#161618' : '#fff', border: window.innerWidth < 768 ? 'none' : `1px solid ${t.border}`, borderRadius: window.innerWidth < 768 ? '24px 24px 0 0' : 24, overflowY: 'auto', width: '100%', maxWidth: 850, display: 'flex', flexDirection: window.innerWidth < 768 ? 'column' : 'row', boxShadow: '0 -10px 40px rgba(0,0,0,0.5)', maxHeight: window.innerWidth < 768 ? '90vh' : '85vh' }}>
            
            <button onClick={() => setSelectedProductDetail(null)} style={{ position: window.innerWidth < 768 ? 'fixed' : 'absolute', top: window.innerWidth < 768 ? 16 : 16, right: window.innerWidth < 768 ? 16 : 16, background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 24, width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, backdropFilter: 'blur(4px)' }}>&times;</button>

            {/* Desktop Layout (Left Image, Right Content) */}
            {window.innerWidth >= 768 ? (
              <>
                <div style={{ width: '50%', background: '#1a1a1e', position: 'relative' }}>
                  {selectedProductDetail.verticalVideoUrl ? (
                    <video src={selectedProductDetail.verticalVideoUrl} autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : selectedProductDetail.landscapeVideoUrl ? (
                    <video src={selectedProductDetail.landscapeVideoUrl} autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <img src={selectedProductDetail.imageUrl} alt={selectedProductDetail.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                  {selectedProductDetail.promo && (
                    <div style={{ position: 'absolute', top: 16, left: 16, background: '#c8b89a', color: '#0f0f10', fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 8 }}>{selectedProductDetail.promo}</div>
                  )}
                </div>
                <div style={{ width: '50%', display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ padding: '40px', flex: 1, overflowY: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 11, color: t.subtext, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{selectedProductDetail.store}</span>
                    </div>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: t.text, marginBottom: 16, lineHeight: 1.2, paddingRight: 24 }}>{selectedProductDetail.name}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                      <span style={{ fontSize: 24, fontWeight: 800, color: isDarkMode ? '#c8b89a' : '#8b7355' }}>{selectedProductDetail.price}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 11, color: '#c8b89a', background: isDarkMode ? '#111113' : '#f3f4f6', padding: '4px 8px', borderRadius: 6, border: `1px solid ${t.border}` }}>• {getStockCount(selectedProductDetail.name)} in stock</span>
                      </div>
                    </div>
                    <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 20 }}>
                      <h4 style={{ fontSize: 12, fontWeight: 700, color: t.text, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Description</h4>
                      <p style={{ fontSize: 15, color: t.subtext, lineHeight: 1.6, whiteSpace: 'pre-line' }}>{selectedProductDetail.desc}</p>
                    </div>
                  </div>
                  <div style={{ padding: '0 40px 40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>Quantity</span>
                        <div style={{ display: 'flex', alignItems: 'center', background: isDarkMode ? '#111113' : '#f3f4f6', border: `1px solid ${t.border}`, borderRadius: 10, overflow: 'hidden' }}>
                          <button onClick={() => setModalQty(Math.max(1, modalQty - 1))} style={{ background: 'none', border: 'none', color: t.text, width: 36, height: 36, cursor: 'pointer', fontSize: 16, fontWeight: 600 }}>-</button>
                          <span style={{ width: 40, textAlign: 'center', fontSize: 14, fontWeight: 700, color: t.text }}>{modalQty}</span>
                          <button onClick={() => setModalQty(modalQty + 1)} style={{ background: 'none', border: 'none', color: t.text, width: 36, height: 36, cursor: 'pointer', fontSize: 16, fontWeight: 600 }}>+</button>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 11, color: t.subtext, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Total Price</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: isDarkMode ? '#c8b89a' : '#8b7355' }}>{formatPriceStr(parsePriceNum(selectedProductDetail.price) * modalQty, selectedProductDetail.price)}</div>
                      </div>
                    </div>
                    <button onClick={() => {
                        const priceClean = parsePriceNum(selectedProductDetail.price);
                        setCart(prev => {
                          const existingIndex = prev.findIndex(item => item.name === selectedProductDetail.name && item.store === selectedProductDetail.store);
                          if (existingIndex > -1) { const next = [...prev]; next[existingIndex] = { ...next[existingIndex], qty: next[existingIndex].qty + modalQty }; return next; }
                          return [...prev, { ...selectedProductDetail, qty: modalQty, priceNum: priceClean, id: Math.random().toString(36).substr(2, 9) }];
                        });
                        setSelectedProductDetail(null);
                        showToast(`Added ${modalQty}x ${selectedProductDetail.name} to Cart!`);
                        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 }, zIndex: 300 });
                      }}
                      style={{ width: '100%', background: '#c8b89a', color: '#0f0f10', border: 'none', borderRadius: 14, padding: '16px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 24px rgba(200,184,154,0.3)', transition: 'transform 0.2s' }}>
                      Add to Cart
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Mobile Layout (Everything scrolls as one big page) */
              <>
                <div style={{ width: '100%', background: '#1a1a1e', position: 'relative', aspectRatio: '4/4' }}>
                  {selectedProductDetail.verticalVideoUrl ? (
                    <video src={selectedProductDetail.verticalVideoUrl} autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : selectedProductDetail.landscapeVideoUrl ? (
                    <video src={selectedProductDetail.landscapeVideoUrl} autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <img src={selectedProductDetail.imageUrl} alt={selectedProductDetail.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                  {selectedProductDetail.promo && (
                    <div style={{ position: 'absolute', top: 16, left: 16, background: '#c8b89a', color: '#0f0f10', fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 8 }}>{selectedProductDetail.promo}</div>
                  )}
                </div>
                
                <div style={{ padding: '24px 20px 80px', display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 11, color: t.subtext, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{selectedProductDetail.store}</span>
                    </div>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: t.text, marginBottom: 12, lineHeight: 1.2, paddingRight: 24 }}>{selectedProductDetail.name}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 22, fontWeight: 800, color: isDarkMode ? '#c8b89a' : '#8b7355' }}>{selectedProductDetail.price}</span>
                      <span style={{ fontSize: 11, color: '#c8b89a', background: isDarkMode ? '#111113' : '#f3f4f6', padding: '4px 8px', borderRadius: 6, border: `1px solid ${t.border}` }}>• {getStockCount(selectedProductDetail.name)} in stock</span>
                    </div>
                  </div>

                  <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 20 }}>
                    <h4 style={{ fontSize: 12, fontWeight: 700, color: t.text, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Description</h4>
                    <p style={{ fontSize: 14, color: t.subtext, lineHeight: 1.6, whiteSpace: 'pre-line' }}>{selectedProductDetail.desc}</p>
                  </div>

                  <div style={{ background: isDarkMode ? '#111113' : '#f9fafb', border: `1px solid ${t.border}`, borderRadius: 24, padding: '24px 20px', marginTop: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>Qty</span>
                        <div style={{ display: 'flex', alignItems: 'center', background: isDarkMode ? '#161618' : '#fff', border: `1px solid ${t.border}`, borderRadius: 12, overflow: 'hidden' }}>
                          <button onClick={() => setModalQty(Math.max(1, modalQty - 1))} style={{ background: 'none', border: 'none', color: t.text, width: 36, height: 36, cursor: 'pointer', fontSize: 18, fontWeight: 600 }}>-</button>
                          <span style={{ width: 40, textAlign: 'center', fontSize: 14, fontWeight: 700, color: t.text }}>{modalQty}</span>
                          <button onClick={() => setModalQty(modalQty + 1)} style={{ background: 'none', border: 'none', color: t.text, width: 36, height: 36, cursor: 'pointer', fontSize: 18, fontWeight: 600 }}>+</button>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 11, color: t.subtext, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Total Price</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: isDarkMode ? '#c8b89a' : '#8b7355' }}>{formatPriceStr(parsePriceNum(selectedProductDetail.price) * modalQty, selectedProductDetail.price)}</div>
                      </div>
                    </div>
                    <button onClick={() => {
                        const priceClean = parsePriceNum(selectedProductDetail.price);
                        setCart(prev => {
                          const existingIndex = prev.findIndex(item => item.name === selectedProductDetail.name && item.store === selectedProductDetail.store);
                          if (existingIndex > -1) { const next = [...prev]; next[existingIndex] = { ...next[existingIndex], qty: next[existingIndex].qty + modalQty }; return next; }
                          return [...prev, { ...selectedProductDetail, qty: modalQty, priceNum: priceClean, id: Math.random().toString(36).substr(2, 9) }];
                        });
                        setSelectedProductDetail(null);
                        showToast(`Added ${modalQty}x ${selectedProductDetail.name} to Cart!`);
                        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 }, zIndex: 300 });
                      }}
                      style={{ width: '100%', background: '#c8b89a', color: '#0f0f10', border: 'none', borderRadius: 16, padding: '16px', fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 24px rgba(200,184,154,0.3)', transition: 'transform 0.2s' }}>
                      Add to Cart
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

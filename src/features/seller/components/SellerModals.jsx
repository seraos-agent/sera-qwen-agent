import React from 'react';
import { VideoPlayer } from '../../../components/VideoPlayer';
import { useSeller } from '../SellerContext';

export const SellerModals = () => {
  const {
    isDarkMode, t, selectedPhilosophy, setSelectedPhilosophy,
    showPublishedModal, setShowPublishedModal, storeSchema,
    selectedProductDetail, setSelectedProductDetail, modalQty, setModalQty,
    previewMode
  } = useSeller();

  const isMobileView = window.innerWidth < 768 || previewMode === "mobile";

  return (
    <>
      {/* PHILOSOPHY DETAIL MODAL */}
      {selectedPhilosophy && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)", padding: 20 }} onClick={() => setSelectedPhilosophy(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: isDarkMode ? "#161618" : "#fff", border: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}`, borderRadius: 24, overflow: "hidden", width: "100%", maxWidth: 800, display: "flex", flexDirection: isMobileView ? "column" : "row", boxShadow: "0 24px 60px rgba(0,0,0,0.6)", maxHeight: "90vh" }}>
            <div style={{ width: isMobileView ? "100%" : "45%", background: "#1a1a1e", position: "relative", minHeight: 300 }}>
              <img src={selectedPhilosophy.imageUrl} alt={selectedPhilosophy.label || selectedPhilosophy.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ width: isMobileView ? "100%" : "55%", padding: "40px", display: "flex", flexDirection: "column", overflowY: "auto" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <span style={{ fontSize: 13, color: t.subtext, fontWeight: 600, textTransform: "uppercase" }}>PREVIEW MODE</span>
                <button onClick={() => setSelectedPhilosophy(null)} style={{ background: "none", border: "none", color: t.subtext, cursor: "pointer", fontSize: 20 }}>&times;</button>
              </div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, color: t.text, marginBottom: 24, lineHeight: 1.2 }}>{selectedPhilosophy.label || selectedPhilosophy.title}</h2>
              <p style={{ fontSize: 16, color: t.subtext, lineHeight: 1.8, fontWeight: 300 }}>{selectedPhilosophy.sub || selectedPhilosophy.body}</p>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT DETAIL MODAL (QUICK VIEW / PDP) */}
      {selectedProductDetail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', padding: 20 }}>
          <div style={{ background: isDarkMode ? '#161618' : '#fff', border: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}`, borderRadius: 24, overflow: 'hidden', width: '100%', maxWidth: isMobileView ? 400 : 850, display: 'flex', flexDirection: isMobileView ? 'column' : 'row', boxShadow: '0 24px 60px rgba(0,0,0,0.6)', maxHeight: '90vh' }}>
            {/* Left: Image / Video */}
            <div style={{ width: isMobileView ? '100%' : '50%', background: '#1a1a1e', position: 'relative', minHeight: 300, aspectRatio: isMobileView ? '4/4' : 'auto' }}>
              {selectedProductDetail.verticalVideoUrl ? (
                <VideoPlayer 
                  key={selectedProductDetail.verticalVideoUrl}
                  src={selectedProductDetail.verticalVideoUrl} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 1, transition: 'opacity 0.4s ease' }}
                />
              ) : selectedProductDetail.landscapeVideoUrl ? (
                <VideoPlayer 
                  key={selectedProductDetail.landscapeVideoUrl}
                  src={selectedProductDetail.landscapeVideoUrl} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 1, transition: 'opacity 0.4s ease' }}
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
            <div style={{ width: isMobileView ? '100%' : '50%', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflowY: 'auto' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, color: t.subtext, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{selectedProductDetail.store}</span>
                  <button onClick={() => setSelectedProductDetail(null)} style={{ background: 'none', border: 'none', color: t.subtext, cursor: 'pointer', fontSize: 20 }}>&times;</button>
                </div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: t.text, marginBottom: 16, lineHeight: 1.2 }}>{selectedProductDetail.name}</h2>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: isDarkMode ? '#c8b89a' : '#8b7355' }}>{selectedProductDetail.price}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 13, color: '#c8b89a', background: isDarkMode ? '#111113' : '#f3f4f6', padding: '4px 10px', borderRadius: 6, border: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}` }}>
                      • 46 in stock
                    </span>
                    {selectedProductDetail.rating && (
                      <span style={{ fontSize: 13, color: t.subtext, background: isDarkMode ? '#111113' : '#f3f4f6', padding: '4px 10px', borderRadius: 6 }}>
                        ⭐ {selectedProductDetail.rating} • {selectedProductDetail.sales}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ borderTop: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}`, paddingTop: 20, marginBottom: 28 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Description</h4>
                  <p style={{ fontSize: 14, color: t.subtext, lineHeight: 1.6 }}>{selectedProductDetail.desc}</p>
                </div>
              </div>

              <div>
                {/* Quantity */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>Quantity</span>
                  <div style={{ display: 'flex', alignItems: 'center', background: isDarkMode ? '#111113' : '#f3f4f6', border: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}`, borderRadius: 10, overflow: 'hidden' }}>
                    <button onClick={() => setModalQty(Math.max(1, modalQty - 1))} style={{ background: 'none', border: 'none', color: t.text, width: 36, height: 36, cursor: 'pointer', fontSize: 16, fontWeight: 600 }}>-</button>
                    <span style={{ width: 40, textAlign: 'center', fontSize: 14, fontWeight: 700, color: t.text }}>{modalQty}</span>
                    <button onClick={() => setModalQty(modalQty + 1)} style={{ background: 'none', border: 'none', color: t.text, width: 36, height: 36, cursor: 'pointer', fontSize: 16, fontWeight: 600 }}>+</button>
                  </div>
                </div>

                {/* Add to Cart */}
                <div style={{ display: 'flex', gap: 16 }}>
                  <button
                    onClick={() => setSelectedProductDetail(null)}
                    style={{ flex: 1, background: '#c8b89a', color: '#0f0f10', border: 'none', borderRadius: 14, padding: '16px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 24px rgba(200,184,154,0.3)', transition: 'transform 0.2s' }}
                  >
                    Add to Cart (Preview)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PUBLISH SUCCESS MODAL */}
      {showPublishedModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)", padding: 20 }} onClick={() => setShowPublishedModal(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: isDarkMode ? "#161618" : "#fff", border: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}`, borderRadius: 24, padding: 40, maxWidth: 400, textAlign: "center", boxShadow: "0 24px 60px rgba(0,0,0,0.6)" }}>
            <div style={{ width: 64, height: 64, background: "#c8b89a", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <svg width="32" height="32" fill="none" stroke="#0f0f10" strokeWidth="3" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"></path></svg>
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: t.text, marginBottom: 12 }}>Store Published</h2>
            <p style={{ fontSize: 14, color: t.subtext, marginBottom: 32, lineHeight: 1.6 }}>Your storefront is now live in the SERA Ecosystem and ready for autonomous traffic.</p>
            <div style={{ display: "flex", gap: 12, width: "100%" }}>
              <button
                onClick={() => setShowPublishedModal(false)}
                style={{ flex: 1, background: "transparent", color: t.text, border: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}`, borderRadius: 8, padding: "12px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "background 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.background = isDarkMode ? "#2a2a2e" : "#f3f4f6"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                OK
              </button>
              <button
                onClick={() => {
                  setShowPublishedModal(false);
                  window.open(`/?store=${storeSchema.id}`, "_blank");
                }}
                style={{ flex: 1, background: "#c8b89a", color: "#0f0f10", border: "none", borderRadius: 8, padding: "12px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
              >
                View Live Store
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

import React from 'react';
import { useSeller } from '../SellerContext';

export const SellerPreview = () => {
  const { activeNav, storeData, setStoreData, storeSchema, isTyping, buildingStage, isDarkMode, previewMode, DynamicRenderer, setModalQty, products, philosophy, themeColor, heroBg, heroImage, testimonials, faq, footerData, heroStyles, setSelectedPhilosophy, setSelectedProductDetail } = useSeller();

  return (
    <>
            {/* STUDIO TAB: Active AI Creation Sandbox */}
            <div style={{ display: activeNav === "studio" ? "flex" : "none", padding: previewMode === "mobile" ? "40px 0" : "0", background: previewMode === "mobile" ? (isDarkMode ? "#0a0a0c" : "#f3f4f6") : "transparent", justifyContent: "center" }}>
              <div style={{
                width: previewMode === "mobile" ? 375 : "100%",
                height: previewMode === "mobile" ? 812 : "auto",
                minHeight: previewMode === "mobile" ? 812 : "100vh",
                overflowY: previewMode === "mobile" ? "auto" : "visible",
                backgroundColor: isDarkMode ? "#0f0f10" : "#ffffff",
                backgroundImage: (storeSchema.layout.length === 0 && buildingStage === 0)
                  ? (isDarkMode ? "radial-gradient(rgba(200, 184, 154, 0.15) 1px, transparent 1px)" : "radial-gradient(rgba(0, 0, 0, 0.08) 1px, transparent 1px)")
                  : "none",
                backgroundSize: "24px 24px",
                border: previewMode === "mobile" ? (isDarkMode ? "12px solid #1a1a1e" : "12px solid #e5e7eb") : "none",
                borderRadius: previewMode === "mobile" ? 40 : 0,
                boxShadow: previewMode === "mobile" ? "0 20px 40px rgba(0,0,0,0.5)" : "none",
                position: "relative"
              }}>
                {/* Promo Banner */}
                {storeData.promoBanner && (
                  <div style={{
                    background: "linear-gradient(90deg, #c8b89a, #e6d8b8, #c8b89a)",
                    backgroundSize: "200% auto",
                    animation: "gradientFlow 3s linear infinite",
                    padding: "12px 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    color: "#0f0f10",
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: 1,
                    zIndex: 20,
                    position: "relative",
                    boxShadow: "0 4px 15px rgba(200, 184, 154, 0.3)"
                  }}>
                    <style>{`
                @keyframes gradientFlow {
                  0% { background-position: 0% center; }
                  100% { background-position: 200% center; }
                }
              `}</style>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                    </svg>
                    {storeData.promoBanner.toUpperCase()}
                    <div style={{
                      position: "absolute", right: 16, cursor: "pointer", opacity: 0.6, display: "flex", alignItems: "center"
                    }} onClick={() => setStoreData(p => ({ ...p, promoBanner: "" }))} title="Tutup">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </div>
                  </div>
                )}
                {/* Canvas: idle/empty state handled by parent background */}
                {/* Canvas skeleton removed — real layout renders immediately from schema_preview */}
                {storeSchema.layout.length === 0 && (buildingStage > 0) && (() => {
                  const sk = isDarkMode ? "linear-gradient(90deg,#1a1a1e 25%,#252528 50%,#1a1a1e 75%)" : "linear-gradient(90deg,#e5e7eb 25%,#d1d5db 50%,#e5e7eb 75%)";
                  const skStyle = { backgroundImage: sk, backgroundSize: "200% 100%", animation: "shimmer 1.8s infinite linear", borderRadius: 8 };
                  const stage = buildingStage;
                  return (
                    <div style={{ background: "transparent", minHeight: 600 }}>
                      <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}} @keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}`}</style>

                      {/* Hero skeleton — always visible once SERA starts */}
                      <div style={{ margin: "0 32px 24px", height: 240, background: isDarkMode ? "#121214" : "#ffffff", borderRadius: 16, border: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, overflow: "hidden", position: "relative" }}>
                        <div style={{ ...skStyle, width: "28%", height: 8 }} />
                        <div style={{ ...skStyle, width: "52%", height: 36, borderRadius: 6 }} />
                        <div style={{ ...skStyle, width: "42%", height: 12 }} />
                        <div style={{ ...skStyle, width: 130, height: 40, borderRadius: 24, opacity: stage >= 2 ? 1 : 0.3, transition: "opacity 0.5s", backgroundImage: stage >= 3 ? "none" : sk, backgroundColor: stage >= 3 ? "rgba(200,184,154,0.3)" : "transparent" }} />
                      </div>
                      {/* Product grid — reveals when layout design step starts */}
                      <div style={{ padding: "0 32px 24px", opacity: stage >= 3 ? 1 : 0, transition: "opacity 0.6s" }}>
                        <div style={{ ...skStyle, width: 180, height: 14, marginBottom: 18 }} />
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: 16 }}>
                          {[0, 1, 2, 3, 4, 5].map(i => (
                            <div key={i} style={{ opacity: stage >= 4 ? 1 : i < 3 ? 0.7 : 0.3, transition: `opacity 0.4s ${i * 0.08}s` }}>
                              <div style={{ ...skStyle, height: 160, borderRadius: 10, marginBottom: 10 }} />
                              <div style={{ ...skStyle, width: "75%", height: 11, marginBottom: 7 }} />
                              <div style={{ ...skStyle, width: "40%", height: 11 }} />
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Philosophy strip — reveals on final asset generation step */}
                      <div style={{ padding: "0 32px 32px", display: "flex", gap: 16, opacity: stage >= 4 ? 1 : 0, transition: "opacity 0.6s 0.2s" }}>
                        {[0, 1, 2].map(i => (
                          <div key={i} style={{ flex: 1, height: 120, borderRadius: 12, ...skStyle, opacity: 0.5 + i * 0.15 }} />
                        ))}
                      </div>
                    </div>
                  );
                })()}
                <DynamicRenderer
                  layout={storeSchema.layout}
                  globalProps={{
                    products,
                    items: philosophy,
                    ...storeData,
                    promoVideos: storeData.promoVideos || (storeData.promoVideo ? [storeData.promoVideo] : []),
                    storeVideos: storeData.storeVideos || (storeData.storeVideo ? [storeData.storeVideo] : []),
                    branding: storeData || {},
                    themeColor,
                    heroBg,
                    heroImage,
                    isDarkMode,
                    isBuilding: buildingStage > 0,
                    testimonials,
                    faq,
                    footerData,
                    heroStyles,
                    onSelectProduct: (prod) => {
                      setSelectedProductDetail(prod);
                      if (setModalQty) setModalQty(1);
                    },
                    onSelectPhilosophy: (philo) => {
                      setSelectedPhilosophy(philo);
                    }
                  }}
                />                {/* Draft Proposal Overlay removed to favor interactive Chat UI proposal cards */}
                {/* End Dynamic Layout */}
              </div>
            </div>
    </>
  );
};

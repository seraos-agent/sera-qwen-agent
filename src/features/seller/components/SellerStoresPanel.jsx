import React from 'react';
import { useSeller } from '../SellerContext';

export const SellerStoresPanel = () => {
  const { activeNav, isDarkMode, t, themeColor, userStores, setStoreSchema, activeAnalyticsStoreId, setActiveAnalyticsStoreId, analyticsData, isLoadingAnalytics, setIsPublishing, isPublishing, isPublished, setIsPublished, storeSchema, storeData, heroImage, products, setProducts, setPublishedSchema, setUserStores, activePromoTab, setActivePromoTab, videoFormat, setVideoFormat, selectedPhilosophy, setSelectedPhilosophy, appMode, setActiveNav, filteredStores, selectedCategoryFilter, setSelectedCategoryFilter, buyerSearchQuery, setBuyerSearchQuery, setAppMode, getSessionId } = useSeller();
  
  return (
    <>
            {/* STORES TAB: Multi-Store Management Grid */}
            <div style={{ display: activeNav === "stores" ? "block" : "none", padding: "40px 28px", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
                <div>
                  <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: t.text, marginBottom: 8 }}>My Storefronts</h1>
                  <p style={{ fontSize: 13, color: t.subtext }}>Manage your autonomous AI commerce storefronts or launch a new brand in the Studio.</p>
                </div>
                <button
                  onClick={() => {
                    setStoreSchema({
                      metadata: { brand_identity: "New AI Store", objective: "Autonomous Commerce" },
                      theme: { themeColor: "#c8b89a", heroBg: "linear-gradient(135deg, #111113 0%, #1a1a1e 100%)", isDarkMode: true, fontFamily: "'Playfair Display', serif" },
                      layout: [],
                      testimonials: [], faq: [], footer: { about: "Powered by SERA AI Agent Commerce OS.", links: ["Shop All", "About Us", "Contact"] }, heroStyles: { height: "500px", padding: "60px 40px", textAlign: "center" }
                    });
                    setActiveNav("studio");
                  }}
                  style={{
                    background: "#c8b89a", color: "#0f0f10", border: "none", borderRadius: 8, padding: "10px 20px",
                    fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                    fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s"
                  }}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
                  Create New Store in Studio
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
                {userStores.map(store => (
                  <div
                    key={store.id}
                    style={{
                      background: isDarkMode ? "#161618" : "#fff",
                      border: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}`,
                      borderRadius: 16, overflow: "hidden", transition: "all 0.3s",
                      display: "flex", flexDirection: "column"
                    }}
                  >
                    <div style={{ height: 180, position: "relative", background: isDarkMode ? "#111" : "#e5e7eb" }}>
                      {store.cover ? (
                        <img loading="lazy" src={store.cover} alt={store.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", background: isDarkMode ? "linear-gradient(135deg, #1a1a1e 0%, #000 100%)" : "linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="32" height="32" fill="none" stroke={isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                        </div>
                      )}
                      <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", color: "#c8b89a", fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 12, border: "1px solid rgba(200,184,154,0.3)" }}>
                        Live Ecosystem
                      </div>
                    </div>
                    <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column" }}>
                      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: t.text, marginBottom: 4 }}>{store.name}</h3>
                      <p style={{ fontSize: 12, color: "#c8b89a", marginBottom: 12, fontWeight: 600 }}>{store.category}</p>
                      <p style={{ fontSize: 12, color: t.subtext, marginBottom: 20, flex: 1, lineHeight: 1.5 }}>{store.desc}</p>
                      <div style={{ display: "flex", gap: 12, borderTop: `1px solid ${t.border}`, paddingTop: 16 }}>
                        <button
                          onClick={() => {
                            setStoreSchema({ ...store.customSchema, id: store.id });
                            setActiveNav("studio");
                          }}
                          style={{
                            flex: 1, background: isDarkMode ? "#222226" : "#f3f4f6", color: t.text, border: "none",
                            borderRadius: 8, padding: "8px 0", fontSize: 12, fontWeight: 600, cursor: "pointer",
                            transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = isDarkMode ? "#2a2a30" : "#e5e7eb"}
                          onMouseLeave={e => e.currentTarget.style.background = isDarkMode ? "#222226" : "#f3f4f6"}
                        >
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                          Edit in Studio
                        </button>
                        <button
                          onClick={async () => {
                            if (userStores.length <= 1) {
                              alert("You must keep at least one active store.");
                              return;
                            }
                            if (window.confirm(`Are you sure you want to delete ${store.name}?`)) {
                              try {
                                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/stores/${store.id}`, {
                                  method: 'DELETE'
                                });
                                const data = await response.json();
                                if (data.success) {
                                  setUserStores(prev => prev.filter(s => s.id !== store.id));
                                } else {
                                  alert("Failed to delete store: " + data.error);
                                }
                              } catch (err) {
                                console.error("Error deleting store:", err);
                                alert("Failed to delete store. See console for details.");
                              }
                            }
                          }}
                          style={{
                            background: "transparent", color: "#f87171", border: `1px solid ${isDarkMode ? "#333338" : "#e5e7eb"}`,
                            borderRadius: 8, padding: "8px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                            transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center"
                          }}
                          title="Delete Store"
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(248,113,113,0.1)"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

    </>
  );
};

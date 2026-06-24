import React, { useState, useEffect } from 'react';
import { VideoPlayer } from '../../../../components/VideoPlayer';
import { useSeller } from '../../SellerContext';

export const PromotionsTab = () => {
  const { 
    activeNav, isDarkMode, t, products, setProducts, 
    selectedProducts, setSelectedProducts, openActionMenuId, setOpenActionMenuId, themeColor,
    productImageInputRef, handleProductImageUpdate, setUploadingForProduct, sendMessage,
    userStores, setStoreSchema, storeSchema,
    activePromoTab, setActivePromoTab, videoFormat, setVideoFormat, storeData, setStoreData
  } = useSeller();

  return (
    <>
            {/* Promotions content (Mock) */}
            <div className="seller-panel" style={{ display: activeNav === "promotions" ? "block" : "none", padding: "40px 28px", paddingBottom: "100px" }}>
              <div className="marketing-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div className="marketing-title-area" style={{ display: "flex", alignItems: "center", gap: 24 }}>
                  <div>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: t.text, marginBottom: 8 }}>Marketing & Promotions</h2>
                    <p style={{ fontSize: 14, color: t.subtext }}>Manage campaigns, creatives, and offers for your store</p>
                  </div>
                  <div style={{ paddingLeft: 24, borderLeft: `1px solid ${t.border}` }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: t.subtext, letterSpacing: 0.5, marginBottom: 8 }}>TARGET STORE</p>
                    <select
                      value={storeSchema.id || ""}
                      onChange={(e) => {
                        const selectedStore = userStores.find(s => s.id === e.target.value);
                        if (selectedStore) {
                          setStoreSchema({ ...selectedStore.customSchema, id: selectedStore.id });
                        }
                      }}
                      style={{
                        background: isDarkMode ? "#0f0f10" : "#ffffff", color: t.text, border: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}`, borderRadius: 8,
                        padding: "8px 12px", fontSize: 14, outline: "none", cursor: "pointer",
                        minWidth: 200, fontFamily: "'DM Sans', sans-serif"
                      }}
                    >
                      {!storeSchema.id && <option value="">Current Active Store</option>}
                      {userStores.map((store, idx) => (
                        <option key={store.id || idx} value={store.id}>{store.name || "Untitled Store"}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button style={{ background: "#c8b89a", color: "#0f0f10", border: "none", padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
                  New Campaign
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {/* Stats Row */}
                <div className="marketing-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                  {(() => {
                    let h = 0;
                    const str = storeSchema?.id || "default";
                    for(let i=0; i<str.length; i++) h += str.charCodeAt(i);
                    return [
                      { label: "ACTIVE CAMPAIGNS", value: `${2 + (h % 5)}`, trend: `↑ ${1 + (h % 3)} this week`, trendColor: "#4ade80" },
                      { label: "TOTAL REACH", value: `${(10 + (h % 15)).toFixed(1)}k`, trend: `↑ ${10 + (h % 20)}% vs last week`, trendColor: "#4ade80" },
                      { label: "CONVERSIONS", value: `${150 + (h % 300)}`, trend: `↑ ${(5 + (h % 10)).toFixed(1)}% rate`, trendColor: "#4ade80" },
                      { label: "REVENUE FROM PROMOS", value: `$${(5 + (h % 8)).toFixed(1)}k`, trend: `↑ ${15 + (h % 30)}% this month`, trendColor: "#4ade80" },
                    ];
                  })().map((stat, i) => (
                    <div key={i} style={{ background: isDarkMode ? "rgba(255,255,255,0.02)" : "#ffffff", border: "none", borderRadius: 16, padding: "20px", boxShadow: isDarkMode ? "inset 0 1px 0 rgba(255,255,255,0.05)" : "0 4px 20px rgba(0,0,0,0.03)" }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: t.subtext, letterSpacing: 0.5, marginBottom: 12 }}>{stat.label}</p>
                      <h3 style={{ fontSize: 24, fontWeight: 700, color: t.text, marginBottom: 8 }}>{stat.value}</h3>
                      <p style={{ fontSize: 12, color: stat.trendColor, fontWeight: 500 }}>{stat.trend}</p>
                    </div>
                  ))}
                </div>
                {/* Tabs Row */}
                <div className="marketing-tabs" style={{ display: "flex", gap: 12, paddingBottom: "16px", borderBottom: `1px solid ${isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`, width: "100%" }}>
                  {[
                    { id: "banner", label: "Banner", icon: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /></svg> },
                    { id: "discounts", label: "Discounts", icon: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg> },
                    { id: "image", label: "Image", icon: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg> },
                    { id: "video", label: "Video", icon: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg> },
                    { id: "offers", label: "Offers", icon: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg> }
                  ].map(tab => (
                    <div
                      key={tab.id}
                      onClick={() => setActivePromoTab(tab.id)}
                      style={{
                        padding: "10px 20px", borderRadius: 100, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s", flexShrink: 0,
                        ...(activePromoTab === tab.id
                          ? { fontWeight: 600, background: isDarkMode ? "#c8b89a" : "#111827", color: isDarkMode ? "#0f0f10" : "#ffffff", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }
                          : { fontWeight: 500, color: t.subtext, background: isDarkMode ? "rgba(255,255,255,0.03)" : "#f3f4f6" })
                      }}
                    >
                      {tab.icon}
                      {tab.label}
                    </div>
                  ))}
                </div>
                {/* Video Campaigns Section */}
                {activePromoTab === "video" && (
                  <div style={{ animation: "fadeIn 0.3s ease-out" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 600, color: t.text, marginBottom: 4 }}>Video Campaigns</h3>
                        <p style={{ fontSize: 13, color: t.subtext }}>Cinematic video assets for your storefront</p>
                      </div>
                      {/* Segmented Control for Flip */}
                      <div style={{ display: "flex", background: isDarkMode ? "#121214" : "#f3f4f6", borderRadius: 8, padding: 4, border: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}` }}>
                        <div
                          onClick={() => setVideoFormat("landscape")}
                          style={{ padding: "6px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer", background: videoFormat === "landscape" ? (isDarkMode ? "#2c2c35" : "#ffffff") : "transparent", color: videoFormat === "landscape" ? t.text : t.subtext, boxShadow: videoFormat === "landscape" ? "0 2px 4px rgba(0,0,0,0.1)" : "none", transition: "all 0.2s" }}
                        >Landscape (16:9)</div>
                        <div
                          onClick={() => setVideoFormat("vertical")}
                          style={{ padding: "6px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer", background: videoFormat === "vertical" ? (isDarkMode ? "#2c2c35" : "#ffffff") : "transparent", color: videoFormat === "vertical" ? t.text : t.subtext, boxShadow: videoFormat === "vertical" ? "0 2px 4px rgba(0,0,0,0.1)" : "none", transition: "all 0.2s" }}
                        >Vertical (9:16)</div>
                      </div>
                    </div>
                    <div className="video-campaign-split" style={{ display: "flex", gap: 40, alignItems: "center" }}>
                      {/* LEFT SIDE: Preview */}
                      <div style={{ flex: "1", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 280, position: "relative" }}>
                        {videoFormat === "landscape" ? (
                          // Landscape Preview
                          <div style={{ width: "100%", minHeight: 160, aspectRatio: "16/9", background: isDarkMode ? "#1a1a1e" : "#f3f4f6", borderRadius: 12, overflow: "hidden", position: "relative", border: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}` }}>
                            {storeData.storeVideo ? (
                              <VideoPlayer
                                key={storeData.storeVideo}
                                src={storeData.storeVideo}
                                style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.9, transition: "opacity 0.4s ease" }}
                              />
                            ) : (
                              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: t.subtext, background: isDarkMode ? "#1a1a1e" : "#e5e7eb", padding: "16px", textAlign: "center" }}>
                                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ marginBottom: 10, opacity: 0.5 }}><rect x="2" y="6" width="20" height="12" rx="2" ry="2" /><path d="M10 10l5 2-5 2v-4z" /></svg>
                                <span style={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", fontWeight: 700, opacity: 0.5 }}>No Video</span>
                                <span style={{ fontSize: 11, color: t.subtext, marginTop: 6, opacity: 0.4, maxWidth: "100%", whiteSpace: "normal" }}>Upload or generate a 16:9 video</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          // Vertical Preview — Buyer-style card
                          <div style={{ height: 340, aspectRatio: "9/16", borderRadius: 16, overflow: "hidden", position: "relative", background: isDarkMode ? "#1a1a1e" : "#f3f4f6", cursor: "pointer", border: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}` }}>
                            {storeData.promoVideo ? (
                              <>
                                <VideoPlayer
                                  key={storeData.promoVideo}
                                  src={storeData.promoVideo}
                                  style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 1, transition: "opacity 0.4s ease" }}
                                />
                                {/* Gradient overlay */}
                                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 45%)" }} />
                                {/* LIVE badge */}
                                <div style={{ position: "absolute", top: 12, left: 12, display: "flex", alignItems: "center", gap: 6, background: "rgba(239,68,68,0.85)", backdropFilter: "blur(6px)", padding: "4px 10px", borderRadius: 100, border: "1px solid rgba(239,68,68,0.4)" }}>
                                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", animation: "pulse 1.5s infinite" }} />
                                  <span style={{ fontSize: 10, fontWeight: 800, color: "#fff", letterSpacing: 1, textTransform: "uppercase" }}>Live</span>
                                </div>
                                {/* Bottom info */}
                                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 16px 20px" }}>
                                  <span style={{ fontSize: 10, fontWeight: 800, color: themeColor, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 4 }}>Promo Campaign</span>
                                  <h3 style={{ color: "#fff", fontSize: 18, fontWeight: 700, marginBottom: 10, lineHeight: 1.2, fontFamily: "'Playfair Display', serif" }}>
                                    {storeSchema?.metadata?.brand_identity || storeData.title || "My Store"}
                                  </h3>
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>Special Campaign</span>
                                    <span style={{ color: "#4ade80", fontSize: 11, fontWeight: 700, background: "rgba(74,222,128,0.15)", padding: "4px 10px", borderRadius: 8, backdropFilter: "blur(4px)", border: "1px solid rgba(74,222,128,0.3)" }}>View Store</span>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: t.subtext, background: isDarkMode ? "#1a1a1e" : "#e5e7eb" }}>
                                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ marginBottom: 10, opacity: 0.5 }}><rect x="6" y="2" width="12" height="20" rx="2" ry="2" /><path d="M10 10l5 2-5 2v-4z" /></svg>
                                <span style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", fontWeight: 700, opacity: 0.5 }}>No Video</span>
                                <span style={{ fontSize: 10, color: t.subtext, marginTop: 6, opacity: 0.4 }}>Upload or generate a 9:16 video</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* RIGHT SIDE: Tools & Controls */}
                      <div style={{ flex: "1", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                        {videoFormat === "landscape" ? (
                          // Landscape Tools
                          <div style={{ border: "none", borderRadius: 20, padding: 24, background: isDarkMode ? "rgba(255,255,255,0.03)" : "#ffffff", boxShadow: isDarkMode ? "inset 0 1px 0 rgba(255,255,255,0.05)" : "0 4px 24px rgba(0,0,0,0.04)" }}>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: storeData.storeVideo ? "rgba(200, 184, 154, 0.1)" : "transparent", padding: "4px 10px", borderRadius: 100, border: storeData.storeVideo ? `1px solid #c8b89a` : `1px solid ${t.border}`, marginBottom: 16 }}>
                              <div style={{ width: 6, height: 6, borderRadius: "50%", background: storeData.storeVideo ? "#c8b89a" : t.subtext }} />
                              <span style={{ fontSize: 11, fontWeight: 700, color: storeData.storeVideo ? "#c8b89a" : t.subtext, textTransform: "uppercase", letterSpacing: 1 }}>{storeData.storeVideo ? "Active Banner" : "Inactive"}</span>
                            </div>
                            <h4 style={{ fontSize: 20, fontWeight: 600, color: t.text, fontFamily: "'Playfair Display', serif", marginBottom: 12 }}>Storefront Banner Video</h4>
                            <p style={{ fontSize: 14, color: t.subtext, lineHeight: 1.6, marginBottom: 24 }}>
                              A cinematic 16:9 landscape video that spans across the top of your boutique, creating an immersive first impression for your buyers.
                            </p>
                            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                              <label style={{ flex: 1, background: isDarkMode ? "#2c2c35" : "#e5e7eb", color: t.text, border: "none", padding: "12px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.2s" }} onMouseEnter={e => e.target.style.background = isDarkMode ? "#3c3c45" : "#d1d5db"} onMouseLeave={e => e.target.style.background = isDarkMode ? "#2c2c35" : "#e5e7eb"}>
                                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                Upload Video
                                <input
                                  type="file"
                                  accept="video/mp4,video/webm,video/quicktime"
                                  style={{ display: "none" }}
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      const url = URL.createObjectURL(e.target.files[0]);
                                      setStoreData(p => {
                                        const currentList = p.storeVideos || (p.storeVideo ? [p.storeVideo] : []);
                                        return { ...p, storeVideo: url, storeVideos: [...currentList, url] };
                                      });
                                    }
                                  }}
                                />
                              </label>
                              <button
                                onClick={() => setStoreData(p => {
                                  const url = "https://www.w3schools.com/html/mov_bbb.mp4";
                                  const currentList = p.storeVideos || (p.storeVideo ? [p.storeVideo] : []);
                                  return { ...p, storeVideo: url, storeVideos: [...currentList, url] };
                                })}
                                style={{ flex: 1, background: isDarkMode ? "#2c2c35" : "#e5e7eb", color: t.text, border: "none", padding: "12px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "background 0.2s" }}
                                onMouseEnter={(e) => e.target.style.background = isDarkMode ? "#3c3c45" : "#d1d5db"}
                                onMouseLeave={(e) => e.target.style.background = isDarkMode ? "#2c2c35" : "#e5e7eb"}
                              >
                                <span></span> Generate AI
                              </button>
                              {storeData.storeVideo && (
                                <button
                                  onClick={() => setStoreData(p => ({ ...p, storeVideo: "" }))}
                                  style={{ background: "transparent", color: "#ef4444", border: `1px solid rgba(239, 68, 68, 0.3)`, padding: "12px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
                                  onMouseEnter={(e) => e.target.style.background = "rgba(239, 68, 68, 0.1)"}
                                  onMouseLeave={(e) => e.target.style.background = "transparent"}
                                >
                                  Disable
                                </button>
                              )}
                            </div>
                            <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8, minHeight: 70 }}>
                              {(storeData.storeVideos || (storeData.storeVideo ? [storeData.storeVideo] : [])).map((vid, idx) => (
                                <div key={idx} style={{ position: "relative", width: 120, height: 68, borderRadius: 8, overflow: "hidden", border: storeData.storeVideo === vid ? `2px solid #c8b89a` : `1px solid ${t.border}`, flexShrink: 0, cursor: "pointer", background: "#000" }} onClick={() => setStoreData(p => ({ ...p, storeVideo: vid }))}>
                                  <VideoPlayer
                                    key={vid}
                                    src={vid}
                                    preload="metadata"
                                    hideControls
                                    style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.7, transition: "opacity 0.3s ease" }}
                                  />
                                  <button onClick={(e) => { e.stopPropagation(); setStoreData(p => { const nv = (p.storeVideos || []).filter(v => v !== vid); return { ...p, storeVideos: nv, storeVideo: p.storeVideo === vid ? (nv[0] || "") : p.storeVideo }; }); }} style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.7)", color: "#fff", border: "none", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          // Vertical Tools
                          <div style={{ border: "none", borderRadius: 20, padding: 24, background: isDarkMode ? "rgba(255,255,255,0.03)" : "#ffffff", boxShadow: isDarkMode ? "inset 0 1px 0 rgba(255,255,255,0.05)" : "0 4px 24px rgba(0,0,0,0.04)" }}>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: storeData.promoVideo ? "rgba(200, 184, 154, 0.1)" : "transparent", padding: "4px 10px", borderRadius: 100, border: storeData.promoVideo ? `1px solid #c8b89a` : `1px solid ${t.border}`, marginBottom: 16 }}>
                              <div style={{ width: 6, height: 6, borderRadius: "50%", background: storeData.promoVideo ? "#c8b89a" : t.subtext }} />
                              <span style={{ fontSize: 11, fontWeight: 700, color: storeData.promoVideo ? "#c8b89a" : t.subtext, textTransform: "uppercase", letterSpacing: 1 }}>{storeData.promoVideo ? "Active Promo" : "Inactive"}</span>
                            </div>
                            <h4 style={{ fontSize: 20, fontWeight: 600, color: t.text, fontFamily: "'Playfair Display', serif", marginBottom: 12 }}>Featured Promo Campaign</h4>
                            <p style={{ fontSize: 14, color: t.subtext, lineHeight: 1.6, marginBottom: 24 }}>
                              A modern 9:16 vertical video designed for high engagement. Appears in the Buyer Feed and the "Trending Now" section of your store.
                            </p>
                            <div style={{ marginBottom: 24 }}>
                              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: t.subtext, marginBottom: 8 }}>Video Caption (Max 75 chars)</label>
                              <textarea
                                maxLength={75}
                                rows={2}
                                placeholder="e.g., Limited edition!"
                                value={storeData.description || ""}
                                onChange={e => setStoreData({ ...storeData, description: e.target.value })}
                                style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${t.border}`, background: isDarkMode ? "#1a1a1e" : "#f9fafb", color: t.text, fontSize: 13, outline: "none", resize: "vertical", minHeight: "60px", fontFamily: "inherit" }}
                              />
                            </div>
                            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                              <label style={{ flex: 1, background: t.text, color: t.bg, border: "none", padding: "12px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "opacity 0.2s" }} onMouseEnter={e => e.target.style.opacity = 0.8} onMouseLeave={e => e.target.style.opacity = 1}>
                                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                Upload Video
                                <input
                                  type="file"
                                  accept="video/mp4,video/webm,video/quicktime"
                                  style={{ display: "none" }}
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      const url = URL.createObjectURL(e.target.files[0]);
                                      setStoreData(p => {
                                        const currentList = p.promoVideos || (p.promoVideo ? [p.promoVideo] : []);
                                        return { ...p, promoVideo: url, promoVideos: [...currentList, url] };
                                      });
                                    }
                                  }}
                                />
                              </label>
                              <button
                                onClick={() => setStoreData(p => {
                                  const url = "https://www.w3schools.com/html/mov_bbb.mp4";
                                  const currentList = p.promoVideos || (p.promoVideo ? [p.promoVideo] : []);
                                  return { ...p, promoVideo: url, promoVideos: [...currentList, url] };
                                })}
                                style={{ flex: 1, background: isDarkMode ? "#2c2c35" : "#e5e7eb", color: t.text, border: "none", padding: "12px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "background 0.2s" }}
                                onMouseEnter={(e) => e.target.style.background = isDarkMode ? "#3c3c45" : "#d1d5db"}
                                onMouseLeave={(e) => e.target.style.background = isDarkMode ? "#2c2c35" : "#e5e7eb"}
                              >
                                <span></span> Generate AI
                              </button>
                              {storeData.promoVideo && (
                                <button
                                  onClick={() => setStoreData(p => ({ ...p, promoVideo: "" }))}
                                  style={{ background: "transparent", color: "#ef4444", border: `1px solid rgba(239, 68, 68, 0.3)`, padding: "12px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
                                  onMouseEnter={(e) => e.target.style.background = "rgba(239, 68, 68, 0.1)"}
                                  onMouseLeave={(e) => e.target.style.background = "transparent"}
                                >
                                  Disable
                                </button>
                              )}
                            </div>
                            <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8, minHeight: 110 }}>
                              {(storeData.promoVideos || (storeData.promoVideo ? [storeData.promoVideo] : [])).map((vid, idx) => (
                                <div key={idx} style={{ position: "relative", width: 68, height: 120, borderRadius: 8, overflow: "hidden", border: storeData.promoVideo === vid ? `2px solid #c8b89a` : `1px solid ${t.border}`, flexShrink: 0, cursor: "pointer", background: "#000" }} onClick={() => setStoreData(p => ({ ...p, promoVideo: vid }))}>
                                  <VideoPlayer key={vid} src={vid} hideControls style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.7 }} />
                                  <button onClick={(e) => { e.stopPropagation(); setStoreData(p => { const nv = (p.promoVideos || []).filter(v => v !== vid); return { ...p, promoVideos: nv, promoVideo: p.promoVideo === vid ? (nv[0] || "") : p.promoVideo }; }); }} style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.7)", color: "#fff", border: "none", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Social Media Banner */}
                    <div style={{ background: isDarkMode ? "rgba(168, 85, 247, 0.1)" : "rgba(168, 85, 247, 0.05)", border: isDarkMode ? "1px solid rgba(168, 85, 247, 0.2)" : "1px solid rgba(168, 85, 247, 0.3)", borderRadius: 12, padding: "20px", display: "flex", gap: 16, alignItems: "center", marginTop: 24 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(168, 85, 247, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="24" height="24" fill="none" stroke="#a855f7" strokeWidth="2" viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
                      </div>
                      <div>
                        <h4 style={{ fontSize: 14, fontWeight: 700, color: "#a855f7", marginBottom: 4 }}>Social Media Publishing — Coming Next</h4>
                        <p style={{ fontSize: 13, color: t.subtext, lineHeight: 1.5 }}>Publish directly to TikTok, Instagram Reels, and YouTube Shorts. SERA will auto-generate captions and hashtags for each platform.</p>
                      </div>
                    </div>
                  </div>
                )}
                {/* Image Campaigns Section */}
                {activePromoTab === "image" && (
                  <div style={{ animation: "fadeIn 0.3s ease-out" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 600, color: t.text, marginBottom: 4 }}>Image Campaigns</h3>
                        <p style={{ fontSize: 13, color: t.subtext }}>High-resolution creatives for your store & ads</p>
                      </div>
                      <button style={{ background: "none", color: "#c8b89a", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>+ Upload Image</button>
                    </div>
                    <div className="image-campaigns-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                      {[1, 2, 3].map(i => (
                        <div key={i} style={{ background: isDarkMode ? "#1a1a1e" : "#f9fafb", borderRadius: 12, overflow: "hidden", border: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}`, height: 200, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                          <svg width="32" height="32" fill="none" stroke={t.subtext} strokeWidth="2" viewBox="0 0 24 24" style={{ opacity: 0.5 }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Active Banner Control */}
                {activePromoTab === "banner" && (
                  <div style={{ animation: "fadeIn 0.3s ease-out" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 600, color: t.text, marginBottom: 4 }}>Top Banner Announcement</h3>
                        <p style={{ fontSize: 12, color: t.subtext }}>Displays a promotional message at the top of your live store.</p>
                      </div>
                      <div style={{ width: 36, height: 20, background: storeData.promoBanner ? "#4ade80" : (isDarkMode ? "#333" : "#d1d5db"), borderRadius: 20, position: "relative", cursor: "pointer" }} onClick={() => setStoreData(p => ({ ...p, promoBanner: p.promoBanner ? "" : "Flash Sale: Diskon 20% Hari Ini!" }))}>
                        <div style={{ width: 16, height: 16, background: storeData.promoBanner ? "#0f0f10" : (isDarkMode ? "#888" : "#fff"), borderRadius: "50%", position: "absolute", [storeData.promoBanner ? "right" : "left"]: 2, top: 2, transition: "all 0.2s ease" }} />
                      </div>
                    </div>
                    <input
                      id="promo-banner-text"
                      name="promo-banner-text"
                      type="text"
                      value={storeData.promoBanner}
                      onChange={(e) => setStoreData(p => ({ ...p, promoBanner: e.target.value }))}
                      placeholder="Enter banner text here to activate..."
                      style={{ width: "100%", background: isDarkMode ? "#0f0f10" : "#ffffff", border: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}`, padding: "10px 14px", borderRadius: 6, color: t.text, fontSize: 13, outline: "none", opacity: storeData.promoBanner ? 1 : 0.5, pointerEvents: storeData.promoBanner ? "auto" : "none" }}
                    />
                  </div>
                )}
                {/* Discount Codes */}
                {activePromoTab === "discounts" && (
                  <div style={{ animation: "fadeIn 0.3s ease-out" }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: t.text, marginBottom: 16 }}>Discount Codes</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 16 }}>
                      {[
                        { code: "GLOWUP20", discount: "20% OFF", uses: "142 / 500", status: "Active" },
                        { code: "WELCOME10", discount: "10% OFF", uses: "89 / ∞", status: "Active" },
                        { code: "FREESHIP", discount: "Free Shipping", uses: "312 / ∞", status: "Active" },
                      ].map((promo, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: isDarkMode ? "rgba(255,255,255,0.03)" : "#ffffff", borderRadius: 16, border: "none", boxShadow: isDarkMode ? "inset 0 1px 0 rgba(255,255,255,0.05)" : "0 2px 10px rgba(0,0,0,0.03)" }}>
                          <div>
                            <p style={{ fontSize: 14, fontWeight: 700, color: "#c8b89a", letterSpacing: 1, marginBottom: 4 }}>{promo.code}</p>
                            <p style={{ fontSize: 11, color: t.subtext }}>{promo.discount} • {promo.uses} uses</p>
                          </div>
                          <span style={{ padding: "4px 8px", background: "rgba(74, 222, 128, 0.1)", color: "#4ade80", borderRadius: 4, fontSize: 11, fontWeight: 500 }}>{promo.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Product Specific Offers */}
                {activePromoTab === "offers" && (
                  <div style={{ animation: "fadeIn 0.3s ease-out" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 600, color: t.text }}>Product Offers</h3>
                      <button style={{ background: "none", color: "#c8b89a", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>+ Add Offer</button>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {products.filter(p => p.promo).map((p, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 16px 0 0", background: isDarkMode ? "rgba(255,255,255,0.02)" : "#ffffff", borderRadius: 16, border: "none", boxShadow: isDarkMode ? "inset 0 1px 0 rgba(255,255,255,0.05)" : "0 2px 10px rgba(0,0,0,0.03)", overflow: "hidden" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                            {(() => {
                              const imgUrl = p.verifiedUrl || p.imageUrl || p.image;
                              return imgUrl ? (
                                <img src={imgUrl} alt={p.name} style={{ width: 72, height: 72, minWidth: 72, minHeight: 72, flexShrink: 0, objectFit: "cover", borderRight: `1px solid ${t.border}` }} />
                              ) : (
                                <div style={{ width: 72, height: 72, minWidth: 72, minHeight: 72, flexShrink: 0, background: isDarkMode ? "#2a2a2e" : "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, borderRight: `1px solid ${t.border}` }}>🛍️</div>
                              );
                            })()}
                            <div style={{ padding: "12px 0" }}>
                              <p style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{p.name}</p>
                              <p style={{ fontSize: 12, color: t.subtext }}>Original: {p.price}</p>
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <span style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", fontSize: 11, fontWeight: 700, padding: "4px 8px", borderRadius: 4 }}>{p.promo}</span>
                            <button style={{ background: "none", border: "none", color: t.subtext, cursor: "pointer", padding: 4 }} title="Remove Promo">
                              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
    </>
  );
};

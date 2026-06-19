import React from 'react';
import { useSeller } from '../SellerContext';
import { publishStore } from '../../../lib/agentApi';
import { getSessionId } from '../../../utils/constants';
import confetti from 'canvas-confetti';

export const SellerHeader = () => {
  const { activeNav, setActiveNav, isDarkMode, setIsDarkMode, t, themeColor, userStores, setStoreSchema, activeAnalyticsStoreId, setActiveAnalyticsStoreId, analyticsData, isLoadingAnalytics, setIsPublishing, isPublishing, isPublished, setIsPublished, storeSchema, storeData, heroImage, products, setProducts, setPublishedSchema, setUserStores, activePromoTab, setActivePromoTab, videoFormat, setVideoFormat, selectedPhilosophy, setSelectedPhilosophy, appMode, filteredStores, selectedCategoryFilter, setSelectedCategoryFilter, buyerSearchQuery, setBuyerSearchQuery, setAppMode, previewMode, setPreviewMode, setShowPublishedModal, chatOpen, setChatOpen, handlePublishStore } = useSeller();
  
  return (
    <>
        {/* Top bar */}
        <div style={{
          position: "sticky",
          top: 0,
          background: isDarkMode ? "rgba(15, 15, 16, 0.95)" : "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
          padding: "0 24px",
          height: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 50,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: isDarkMode ? "#c8b89a" : "#8b7355", letterSpacing: 0.5 }}>SERA</span>
            <span style={{ fontSize: 11, color: isDarkMode ? "#6b6b75" : "#9ca3af", background: isDarkMode ? "#1a1a1e" : "#f3f4f6", padding: "2px 8px", borderRadius: 4 }}>AI Agent Commerce OS</span>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {appMode === "seller" && ["Studio", "Stores", "Analytics", "Channels", "Settings"].map(navLabel => (
              <button key={navLabel} onClick={() => setActiveNav(navLabel.toLowerCase())} style={{
                background: activeNav === navLabel.toLowerCase() ? (isDarkMode ? "#1e1e22" : "#e5e7eb") : "none",
                border: "none", cursor: "pointer", padding: "4px 12px", borderRadius: 6,
                fontSize: 12, color: activeNav === navLabel.toLowerCase() ? (isDarkMode ? "#c8b89a" : "#8b7355") : (isDarkMode ? "#4a4a52" : "#9ca3af"),
                fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
                fontWeight: activeNav === navLabel.toLowerCase() ? 600 : 400
              }}
                onMouseEnter={e => { if (activeNav !== navLabel.toLowerCase()) e.currentTarget.style.color = isDarkMode ? "#c8b89a" : "#8b7355"; }}
                onMouseLeave={e => { if (activeNav !== navLabel.toLowerCase()) e.currentTarget.style.color = isDarkMode ? "#4a4a52" : "#9ca3af"; }}
              >{navLabel}</button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Mobile/Desktop Toggle */}
            {appMode === "seller" && (
              <div style={{ display: "flex", background: isDarkMode ? "#1a1a1e" : "#f3f4f6", borderRadius: 6, border: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}`, padding: 2, marginLeft: 12 }}>
                <button onClick={() => setPreviewMode("desktop")} style={{ background: previewMode === "desktop" ? (isDarkMode ? "#2a2a2e" : "#fff") : "transparent", border: "none", borderRadius: 4, padding: "4px 8px", cursor: "pointer", color: previewMode === "desktop" ? t.text : t.subtext, display: "flex", alignItems: "center", boxShadow: previewMode === "desktop" && !isDarkMode ? "0 2px 4px rgba(0,0,0,0.05)" : "none" }} title="Desktop View">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                </button>
                <button onClick={() => setPreviewMode("mobile")} style={{ background: previewMode === "mobile" ? (isDarkMode ? "#2a2a2e" : "#fff") : "transparent", border: "none", borderRadius: 4, padding: "4px 8px", cursor: "pointer", color: previewMode === "mobile" ? t.text : t.subtext, display: "flex", alignItems: "center", boxShadow: previewMode === "mobile" && !isDarkMode ? "0 2px 4px rgba(0,0,0,0.05)" : "none" }} title="Mobile View">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12" y2="18" /></svg>
                </button>
              </div>
            )}
            {/* Dark/Light Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              style={{
                marginLeft: 12,
                background: isDarkMode ? "#1a1a1e" : "#f3f4f6",
                border: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}`,
                borderRadius: 6,
                width: 32, height: 32,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
                color: isDarkMode ? "#fbbf24" : "#6366f1"
              }}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? (
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
              ) : (
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
              )}
            </button>
            {/* Publish Button */}
            {appMode === "seller" && (
              <button
                onClick={async () => {
                  const success = await handlePublishStore();
                  if (success) {
                    console.log("Store published via unified handler.");
                  }
                }}
                style={{
                  marginLeft: 8, background: "#c8b89a", color: "#0f0f10", border: "none",
                  borderRadius: 6, padding: "4px 12px", cursor: "pointer",
                  fontWeight: 600, fontSize: 11, fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s"
                }}
              >
                {isPublishing ? "Publishing..." : "Publish"}
              </button>
            )}
            {/* Flip Mode Toggle Button (Modern Minimalist Pill) */}
            <button
              onClick={() => setAppMode(appMode === "buyer" ? "seller" : "buyer")}
              style={{
                marginLeft: 12,
                background: appMode === "buyer" ? (isDarkMode ? "#2a2a2e" : "#e5e7eb") : (isDarkMode ? "#1a1a1e" : "#f3f4f6"),
                border: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}`,
                color: appMode === "buyer" ? t.text : t.subtext,
                borderRadius: 20,
                padding: "4px 14px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
                transition: "all 0.2s ease"
              }}
              title={`Current Mode: ${appMode === "buyer" ? "Buyer Discovery" : "Seller Studio"}. Click to switch.`}
            >
              {appMode === "buyer" ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ transition: "all 0.3s ease" }}>
                    <rect x="2" y="6" width="20" height="12" rx="6"></rect>
                    <circle cx="8" cy="12" r="4" fill="currentColor"></circle>
                  </svg>
                  <span style={{ color: t.text, fontWeight: 700 }}>Buyer</span>
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ transition: "all 0.3s ease" }}>
                    <rect x="2" y="6" width="20" height="12" rx="6"></rect>
                    <circle cx="16" cy="12" r="4" fill="currentColor"></circle>
                  </svg>
                  <span style={{ color: t.text, fontWeight: 700 }}>Studio</span>
                </>
              )}
            </button>
            {/* Open chat button (only shows when chat is hidden) */}
            {!chatOpen && (
              <button onClick={() => setChatOpen(true)} style={{
                marginLeft: 8, background: isDarkMode ? "#1a1a1e" : "#f3f4f6", border: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}`,
                borderRadius: 6, padding: "4px 10px", cursor: "pointer",
                color: isDarkMode ? "#c8b89a" : "#82693f", fontSize: 11, fontFamily: "'DM Sans', sans-serif",
                display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s",
                fontWeight: 600
              }}>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
                Open SERA
              </button>
            )}
          </div>
        </div>
    </>
  );
};

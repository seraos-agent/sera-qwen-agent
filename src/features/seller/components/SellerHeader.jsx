import React from 'react';
import { useSeller } from '../SellerContext';
import { publishStore } from '../../../lib/agentApi';
import { getSessionId } from '../../../utils/constants';
import confetti from 'canvas-confetti';

export const SellerHeader = () => {
  const { activeNav, setActiveNav, isDarkMode, setIsDarkMode, t, themeColor, userStores, setStoreSchema, activeAnalyticsStoreId, setActiveAnalyticsStoreId, analyticsData, isLoadingAnalytics, setIsPublishing, isPublishing, isPublished, setIsPublished, storeSchema, storeData, heroImage, products, setProducts, setPublishedSchema, setUserStores, activePromoTab, setActivePromoTab, videoFormat, setVideoFormat, selectedPhilosophy, setSelectedPhilosophy, appMode, filteredStores, selectedCategoryFilter, setSelectedCategoryFilter, buyerSearchQuery, setBuyerSearchQuery, setAppMode, previewMode, setPreviewMode, setShowPublishedModal, chatOpen, setChatOpen, handlePublishStore, buildingStage } = useSeller();
  
  return (
    <>
        {/* Top bar */}
        <div className="seller-header" style={{
          position: "sticky",
          top: 0,
          background: isDarkMode ? "rgba(15, 15, 16, 0.95)" : "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
          padding: "0 24px",
          height: 44,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 50,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button 
              onClick={() => { setActiveNav('profile'); if (window.innerWidth <= 768) setChatOpen(false); }}
              style={{ width: 28, height: 28, borderRadius: "50%", background: isDarkMode ? "#1a1a1e" : "#f3f4f6", border: `2px solid ${activeNav === 'profile' ? '#c8b89a' : (isDarkMode ? '#2a2a2e' : '#e5e7eb')}`, padding: 0, overflow: "hidden", cursor: "pointer", transition: "all 0.2s" }}
              title="Profile Settings"
            >
              <img src="/sera-logo.png" alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: isDarkMode ? "#c8b89a" : "#8b7355", letterSpacing: 0.5 }}>SERA</span>
              <span className="hide-on-mobile" style={{ fontSize: 11, color: isDarkMode ? "#6b6b75" : "#9ca3af", background: isDarkMode ? "#1a1a1e" : "#f3f4f6", padding: "2px 8px", borderRadius: 4 }}>AI Agent Commerce OS</span>
            </div>
          </div>
          {/* Top bar right area */}
          <div className="seller-header-right" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Mobile/Desktop Toggle */}
            {appMode === "seller" && (
              <div className="hide-on-mobile" style={{ display: "flex", background: isDarkMode ? "#1a1a1e" : "#f3f4f6", borderRadius: 6, border: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}`, padding: 2, marginLeft: 12 }}>
                <button onClick={() => setPreviewMode("desktop")} style={{ background: previewMode === "desktop" ? (isDarkMode ? "#2a2a2e" : "#fff") : "transparent", border: "none", borderRadius: 4, padding: "4px 8px", cursor: "pointer", color: previewMode === "desktop" ? t.text : t.subtext, display: "flex", alignItems: "center", boxShadow: previewMode === "desktop" && !isDarkMode ? "0 2px 4px rgba(0,0,0,0.05)" : "none" }} title="Desktop View">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                </button>
                <button onClick={() => setPreviewMode("mobile")} style={{ background: previewMode === "mobile" ? (isDarkMode ? "#2a2a2e" : "#fff") : "transparent", border: "none", borderRadius: 4, padding: "4px 8px", cursor: "pointer", color: previewMode === "mobile" ? t.text : t.subtext, display: "flex", alignItems: "center", boxShadow: previewMode === "mobile" && !isDarkMode ? "0 2px 4px rgba(0,0,0,0.05)" : "none" }} title="Mobile View">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12" y2="18" /></svg>
                </button>
              </div>
            )}
            {/* Desktop/Mobile toggle remains */}
            {/* Publish Button */}
            {appMode === "seller" && activeNav === "studio" && (
              <button
                onClick={async () => {
                  if (buildingStage > 0 || isPublishing) return;
                  const success = await handlePublishStore();
                  if (success) {
                    // Store published
                  }
                }}
                disabled={buildingStage > 0 || isPublishing}
                style={{
                  marginLeft: 8, background: "#c8b89a", color: "#0f0f10", border: "none",
                  borderRadius: 6, padding: "4px 12px", cursor: (buildingStage > 0 || isPublishing) ? "not-allowed" : "pointer",
                  opacity: (buildingStage > 0 || isPublishing) ? 0.5 : 1,
                  fontWeight: 600, fontSize: 11, fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s"
                }}
              >
                {isPublishing ? "Publishing..." : (buildingStage > 0 ? "Generating..." : "Publish")}
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

            {/* Desktop AI Concierge Button */}
            {!chatOpen && (
              <button 
                className="hide-on-mobile"
                onClick={() => setChatOpen(true)}
                style={{ marginLeft: 4, background: '#c8b89a', color: '#0f0f10', border: 'none', borderRadius: 16, padding: '4px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, transition: 'transform 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                title="Open AI Concierge"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                SERA
              </button>
            )}
          </div>
        </div>
    </>
  );
};

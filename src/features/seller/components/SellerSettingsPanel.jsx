import React from 'react';
import { useSeller } from '../SellerContext';

export const SellerSettingsPanel = () => {
  const { activeNav, isDarkMode, setIsDarkMode, t, themeColor, userStores } = useSeller();

  const cardStyle = {
    background: isDarkMode ? "#161618" : "#ffffff",
    border: 'none',
    borderRadius: 24,
    padding: "32px",
    boxShadow: isDarkMode ? 'none' : '0 12px 32px rgba(0,0,0,0.04)'
  };

  const itemStyle = {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "16px 20px", background: isDarkMode ? "#0f0f10" : "#f9fafb",
    borderRadius: 16, border: 'none'
  };

  return (
    <>
      <div className="seller-panel" style={{ display: activeNav === "profile" ? "block" : "none", padding: "40px 48px 100px 48px", animation: "fadeIn 0.5s ease-out" }}>
        
        {/* 1. Hero Profile Card */}
        <div style={{ position: "relative", marginBottom: 40, borderRadius: 24, overflow: "hidden", background: isDarkMode ? "#161618" : "#ffffff", boxShadow: isDarkMode ? 'none' : '0 12px 32px rgba(0,0,0,0.04)' }}>
          {/* Cover Gradient */}
          <div style={{ width: "100%", height: 160, background: `linear-gradient(135deg, ${themeColor} 0%, ${isDarkMode ? "#2a2a2e" : "#f3f4f6"} 100%)` }} />
          
          {/* Profile Details */}
          <div style={{ padding: "0 32px 32px 32px", display: "flex", flexDirection: "column", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: -40, marginBottom: 24 }}>
              <div style={{ width: 100, height: 100, borderRadius: "50%", background: isDarkMode ? "#1a1a1e" : "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", border: `4px solid ${isDarkMode ? '#161618' : '#ffffff'}`, boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 2 }}>
                 <img loading="lazy" src="/sera-logo.png" alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <button style={{ background: isDarkMode ? "#2a2a2e" : "#e5e7eb", color: t.text, border: "none", padding: "8px 20px", borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>Edit Profile</button>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 24 }}>
              <div>
                <h2 style={{ fontSize: 28, fontWeight: 700, color: t.text, marginBottom: 4, fontFamily: "'Playfair Display', serif" }}>Admin Owner</h2>
                <p style={{ fontSize: 14, color: t.subtext, marginBottom: 12 }}>admin@sera-ai.com</p>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ background: "rgba(200, 184, 154, 0.15)", color: themeColor, padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 700 }}>Pro Merchant</span>
                  <span style={{ fontSize: 13, color: t.subtext }}>Member since 2026</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 32, textAlign: "center", background: isDarkMode ? "#0f0f10" : "#f9fafb", padding: "16px 24px", borderRadius: 16 }}>
                <div>
                  <h4 style={{ fontSize: 24, fontWeight: 700, color: t.text }}>{userStores?.length || 1}</h4>
                  <p style={{ fontSize: 12, color: t.subtext }}>Stores Managed</p>
                </div>
                <div>
                  <h4 style={{ fontSize: 24, fontWeight: 700, color: t.text }}>$12.4k</h4>
                  <p style={{ fontSize: 12, color: t.subtext }}>Total GMV</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, marginBottom: 40 }}>
          {/* 2. Account Management */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: t.text, marginBottom: 20 }}>Account Security</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={itemStyle}>
                <div>
                  <p style={{ fontSize: 14, color: t.text, fontWeight: 600 }}>Password</p>
                  <p style={{ fontSize: 12, color: t.subtext, marginTop: 4 }}>Last changed 3 months ago</p>
                </div>
                <button style={{ background: "transparent", color: themeColor, border: `1px solid ${themeColor}`, padding: "6px 16px", borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Change</button>
              </div>
              <div style={itemStyle}>
                <div>
                  <p style={{ fontSize: 14, color: t.text, fontWeight: 600 }}>Two-Factor Auth</p>
                  <p style={{ fontSize: 12, color: t.subtext, marginTop: 4 }}>Secure your account</p>
                </div>
                <div style={{ width: 44, height: 24, background: "#4ade80", borderRadius: 24, position: "relative", cursor: "pointer", transition: "background 0.3s" }}>
                  <div style={{ width: 20, height: 20, background: "#0f0f10", borderRadius: "50%", position: "absolute", right: 2, top: 2, transition: "all 0.3s", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }} />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Subscription Plan */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: t.text, marginBottom: 20 }}>Subscription Plan</h3>
            <div style={{ background: isDarkMode ? "#0f0f10" : "#f9fafb", borderRadius: 16, padding: 24, border: `1px solid ${themeColor}40` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: themeColor, textTransform: "uppercase", letterSpacing: 1 }}>Current Plan</span>
                  <h4 style={{ fontSize: 20, fontWeight: 700, color: t.text, marginTop: 4 }}>Pro Merchant</h4>
                </div>
                <h4 style={{ fontSize: 24, fontWeight: 700, color: t.text }}>$49<span style={{ fontSize: 14, color: t.subtext, fontWeight: 500 }}>/mo</span></h4>
              </div>
              <p style={{ fontSize: 13, color: t.subtext, marginBottom: 20, lineHeight: 1.5 }}>Includes unlimited AI product generations, custom domains, and premium store analytics.</p>
              <button style={{ width: "100%", background: themeColor, color: "#0f0f10", border: "none", padding: "12px", borderRadius: 100, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Manage Billing</button>
            </div>
          </div>
        </div>

        {/* 4. Global Store Settings (Condensed) */}
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: t.text, marginBottom: 24 }}>Store Preferences</h2>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 24 }}>
          {/* Theme & System */}
          <div style={{...cardStyle, padding: "24px"}}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 16 }}>Theme & System</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{...itemStyle, padding: "12px 16px"}}>
                <p style={{ fontSize: 13, color: t.text, fontWeight: 600 }}>Dark Mode</p>
                <div onClick={() => setIsDarkMode(!isDarkMode)} style={{ width: 36, height: 20, background: isDarkMode ? themeColor : "#d1d5db", borderRadius: 20, position: "relative", cursor: "pointer", transition: "background 0.3s" }}>
                  <div style={{ width: 16, height: 16, background: isDarkMode ? "#0f0f10" : "#ffffff", borderRadius: "50%", position: "absolute", right: isDarkMode ? 2 : "auto", left: isDarkMode ? "auto" : 2, top: 2, transition: "all 0.3s", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }} />
                </div>
              </div>
              <div style={{...itemStyle, padding: "12px 16px", background: "transparent", border: `1px solid ${isDarkMode ? '#2a2a2e' : '#e5e7eb'}`}}>
                <p style={{ fontSize: 13, color: t.text, fontWeight: 600 }}>Brand Primary Color</p>
                <div style={{ display: "flex", gap: 8 }}>
                  {["#c8b89a", "#3b82f6", "#ef4444"].map((c, i) => (
                    <div key={i} style={{ width: 20, height: 20, borderRadius: "50%", background: c, border: i === 0 ? `2px solid ${isDarkMode ? "#fff" : "#000"}` : "none" }} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* AI Settings */}
          <div style={{...cardStyle, padding: "24px"}}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 16 }}>AI Assistant</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <select style={{ width: "100%", background: isDarkMode ? "#0f0f10" : "#f9fafb", border: 'none', color: t.text, padding: "12px 16px", borderRadius: 12, fontSize: 13, outline: "none", fontWeight: 500, cursor: 'pointer' }}>
                <option>Tone: Elegant & Premium</option>
                <option>Tone: Minimalist & Clean</option>
                <option>Tone: Friendly & Playful</option>
              </select>
              <div style={{...itemStyle, padding: "12px 16px"}}>
                <p style={{ fontSize: 13, color: t.text, fontWeight: 600 }}>Auto-generate SEO</p>
                <div style={{ width: 36, height: 20, background: themeColor, borderRadius: 20, position: "relative", cursor: "pointer", transition: "background 0.3s" }}>
                  <div style={{ width: 16, height: 16, background: "#0f0f10", borderRadius: "50%", position: "absolute", right: 2, top: 2, transition: "all 0.3s", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Payments */}
          <div style={{...cardStyle, padding: "24px"}}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 16 }}>Payment Gateways</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { name: "Stripe", active: true },
                { name: "Midtrans", active: true },
                { name: "PayPal", active: false }
              ].map((intg, i) => (
                <div key={i} style={{...itemStyle, padding: "10px 16px", background: "transparent", border: `1px solid ${isDarkMode ? '#2a2a2e' : '#e5e7eb'}`}}>
                  <p style={{ fontSize: 13, color: t.text, fontWeight: 600 }}>{intg.name}</p>
                  <div style={{ width: 36, height: 20, background: intg.active ? "#4ade80" : (isDarkMode ? "#333" : "#d1d5db"), borderRadius: 20, position: "relative", cursor: "pointer", transition: "background 0.3s" }}>
                    <div style={{ width: 16, height: 16, background: intg.active ? "#0f0f10" : (isDarkMode ? "#888" : "#fff"), borderRadius: "50%", position: "absolute", [intg.active ? "right" : "left"]: 2, top: 2, transition: "all 0.3s", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

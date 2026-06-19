import React from 'react';
import { useSeller } from '../SellerContext';

export const SellerSettingsPanel = () => {
  const { activeNav, isDarkMode, t, themeColor } = useSeller();

  return (
    <>
            {/* Settings content (Mock) */}
            <div style={{ display: activeNav === "settings" ? "block" : "none", padding: "40px 28px", paddingBottom: "100px" }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: t.text, marginBottom: 24 }}>Store Settings</h2>
              {/* Settings Sections */}
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {/* Brand Identity */}
                <div style={{ background: isDarkMode ? "#161618" : "#ffffff", border: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}`, borderRadius: 12, padding: "24px" }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: t.text, marginBottom: 16 }}>Brand Identity</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
                    <div>
                      <p style={{ fontSize: 12, color: t.subtext, marginBottom: 8 }}>Primary Color</p>
                      <div style={{ display: "flex", gap: 10 }}>
                        {["#c8b89a", "#3b82f6", "#ef4444", "#10b981", (isDarkMode ? "#e8e6e1" : "#1f2937")].map((c, i) => (
                          <div key={i} style={{ width: 24, height: 24, borderRadius: "50%", background: c, cursor: "pointer", border: i === 0 ? `2px solid ${isDarkMode ? "#fff" : "#000"}` : "2px solid transparent" }} />
                        ))}
                      </div>
                    </div>
                    <div>
                      <p style={{ fontSize: 12, color: t.subtext, marginBottom: 8 }}>Typography</p>
                      <select style={{ width: "100%", background: isDarkMode ? "#0f0f10" : "#ffffff", border: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}`, color: t.text, padding: "8px 12px", borderRadius: 6, fontSize: 13, outline: "none" }}>
                        <option>DM Sans & Playfair</option>
                        <option>Inter & Merriweather</option>
                        <option>Roboto & Lora</option>
                      </select>
                    </div>
                  </div>
                </div>
                {/* AI Assistant Preferences */}
                <div style={{ background: isDarkMode ? "#161618" : "#ffffff", border: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}`, borderRadius: 12, padding: "24px" }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: t.text, marginBottom: 16 }}>AI Assistant Preferences</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                      <p style={{ fontSize: 12, color: t.subtext, marginBottom: 8 }}>Tone of Voice (For product descriptions)</p>
                      <select style={{ width: "100%", background: isDarkMode ? "#0f0f10" : "#ffffff", border: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}`, color: t.text, padding: "8px 12px", borderRadius: 6, fontSize: 13, outline: "none" }}>
                        <option>Elegant & Premium</option>
                        <option>Minimalist & Clean</option>
                        <option>Friendly & Playful</option>
                      </select>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", background: isDarkMode ? "#0f0f10" : "#ffffff", borderRadius: 6, border: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}` }}>
                      <div>
                        <p style={{ fontSize: 13, color: t.text, fontWeight: 500 }}>Auto-generate SEO Tags</p>
                        <p style={{ fontSize: 11, color: t.subtext }}>Let AI optimize product tags for search engines.</p>
                      </div>
                      <div style={{ width: 36, height: 20, background: "#c8b89a", borderRadius: 20, position: "relative", cursor: "pointer" }}>
                        <div style={{ width: 16, height: 16, background: "#0f0f10", borderRadius: "50%", position: "absolute", right: 2, top: 2 }} />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Integrations */}
                <div style={{ background: isDarkMode ? "#161618" : "#ffffff", border: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}`, borderRadius: 12, padding: "24px" }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: t.text, marginBottom: 16 }}>Integrations</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                    {[
                      { name: "Stripe", desc: "Payment Gateway", active: true },
                      { name: "PayPal", desc: "Payment Gateway", active: false },
                      { name: "Instagram", desc: "Social Shopping", active: true },
                      { name: "TikTok", desc: "Social Shopping", active: false },
                    ].map((intg, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", background: isDarkMode ? "#0f0f10" : "#ffffff", borderRadius: 6, border: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}` }}>
                        <div>
                          <p style={{ fontSize: 13, color: t.text, fontWeight: 500 }}>{intg.name}</p>
                          <p style={{ fontSize: 11, color: t.subtext }}>{intg.desc}</p>
                        </div>
                        <div style={{ width: 36, height: 20, background: intg.active ? "#4ade80" : (isDarkMode ? "#333" : "#d1d5db"), borderRadius: 20, position: "relative", cursor: "pointer" }}>
                          <div style={{ width: 16, height: 16, background: intg.active ? "#0f0f10" : (isDarkMode ? "#888" : "#fff"), borderRadius: "50%", position: "absolute", [intg.active ? "right" : "left"]: 2, top: 2 }} />
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

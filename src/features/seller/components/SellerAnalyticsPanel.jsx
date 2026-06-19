import React from 'react';
import { useSeller } from '../SellerContext';

export const SellerAnalyticsPanel = () => {
  const { 
    activeNav, isDarkMode, t, themeColor,
    activeAnalyticsStoreId, setActiveAnalyticsStoreId, analyticsData, isLoadingAnalytics, userStores
  } = useSeller();
  return (
    <>
            {/* Analytics content (Enhanced) */}
            <div style={{ display: activeNav === "analytics" ? "block" : "none", padding: "40px 28px", paddingBottom: "100px", animation: "fadeIn 0.5s ease-out" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                <div>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: t.text, marginBottom: 4 }}>Store Analytics</h2>
                  <p style={{ fontSize: 14, color: t.subtext }}>Monitor your real-time store performance and agent AI insights.</p>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <select
                    value={activeAnalyticsStoreId}
                    onChange={e => setActiveAnalyticsStoreId(e.target.value)}
                    style={{ background: isDarkMode ? "#0f0f10" : "#ffffff", color: t.text, border: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}`, padding: "8px 16px", borderRadius: 8, fontSize: 14, outline: "none", cursor: "pointer" }}
                  >
                    {userStores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <button style={{ background: isDarkMode ? "#0f0f10" : "#ffffff", color: t.text, border: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}`, padding: "8px 16px", borderRadius: 8, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                    Last 30 Days
                  </button>
                  <button style={{ background: themeColor, color: "#0f0f10", border: "none", padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                    Export Report
                  </button>
                </div>
              </div>
              {/* Top KPI Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 32 }}>
                {[
                  { label: "Total Revenue", value: analyticsData?.summary?.total_revenue ? `$${analyticsData.summary.total_revenue.toLocaleString()}` : "$0", trend: analyticsData?.summary?.total_revenue ? "+15.3%" : "0%", up: true, icon: <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /> },
                  { label: "Products Tracked", value: analyticsData?.summary?.total_products || "0", trend: analyticsData?.summary?.total_products ? "+8.2%" : "0%", up: true, icon: <><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></> },
                  { label: "Avg Conversion", value: analyticsData?.summary?.avg_conversion ? `${(analyticsData.summary.avg_conversion * 100).toFixed(1)}%` : "0%", trend: analyticsData?.summary?.avg_conversion ? "-1.1%" : "0%", up: false, icon: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /> },
                  { label: "Healthy Products", value: analyticsData?.summary?.healthy || "0", trend: analyticsData?.summary?.healthy ? "+45%" : "0%", up: true, icon: <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /> },
                ].map((kpi, i) => (
                  <div key={i} style={{ background: isDarkMode ? "#161618" : "#ffffff", border: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}`, borderRadius: 16, padding: "24px", position: "relative", overflow: "hidden", transition: "transform 0.2s", cursor: "pointer", opacity: isLoadingAnalytics ? 0.5 : 1 }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: isDarkMode ? "#2a2a2e" : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", color: themeColor }}>
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">{kpi.icon}</svg>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 8px", borderRadius: 20, background: kpi.trend === "0%" ? "rgba(128,128,128,0.1)" : (kpi.up ? "rgba(74,222,128,0.1)" : "rgba(239,68,68,0.1)"), color: kpi.trend === "0%" ? t.subtext : (kpi.up ? "#4ade80" : "#ef4444"), display: "flex", alignItems: "center", gap: 4 }}>
                        {kpi.trend === "0%" ? "-" : (kpi.up ? "↑" : "↓")} {kpi.trend}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: t.subtext, marginBottom: 4, fontWeight: 500 }}>{kpi.label}</p>
                    <h3 style={{ fontSize: 28, fontWeight: 700, color: t.text, fontFamily: "'DM Sans', sans-serif" }}>{kpi.value}</h3>
                  </div>
                ))}
              </div>
              {/* Charts & Details Grid */}
              <div style={{ display: "grid", gridTemplateColumns: window.innerWidth < 1000 ? "1fr" : "2fr 1fr", gap: 24 }}>
                {/* Revenue Chart */}
                <div style={{ background: isDarkMode ? "#161618" : "#ffffff", border: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}`, borderRadius: 16, padding: "24px", display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                    <div>
                      <p style={{ fontSize: 16, fontWeight: 700, color: t.text }}>Revenue Overview</p>
                      <p style={{ fontSize: 12, color: t.subtext, marginTop: 4 }}>Daily performance in the last 7 days</p>
                    </div>
                  </div>
                  <div style={{ position: "relative", display: "flex", alignItems: "flex-end", gap: 16, height: 220, paddingBottom: 20, borderBottom: `1px dashed ${t.border}`, flex: 1 }}>
                    {/* SVG Line Chart Background */}
                    <svg style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 20, width: "100%", height: "calc(100% - 20px)", zIndex: 0, overflow: "hidden" }} preserveAspectRatio="none" viewBox="0 0 600 100">
                      <path
                        d={analyticsData?.products?.length > 0 ? "M 43,100 L 43,60 C 86,60 86,30 129,30 C 172,30 172,55 214,55 C 257,55 257,10 300,10 C 343,10 343,35 386,35 C 429,35 429,15 471,15 C 514,15 514,0 557,0 L 557,100 Z" : "M 43,100 L 43,95 L 557,95 L 557,100 Z"}
                        fill={analyticsData?.products?.length > 0 ? "rgba(34, 197, 94, 0.1)" : "rgba(128, 128, 128, 0.05)"}
                      />
                      <path
                        d={analyticsData?.products?.length > 0 ? "M 43,60 C 86,60 86,30 129,30 C 172,30 172,55 214,55 C 257,55 257,10 300,10 C 343,10 343,35 386,35 C 429,35 429,15 471,15 C 514,15 514,0 557,0" : "M 43,95 L 557,95"}
                        fill="none"
                        stroke={analyticsData?.products?.length > 0 ? "#22c55e" : "#555"}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                    {/* Interactive hover columns */}
                    {(() => {
                      const fallbackChartData = [
                        { day: "W1", val: 5, rev: "$0" }, { day: "W2", val: 5, rev: "$0" },
                        { day: "W3", val: 5, rev: "$0" }, { day: "W4", val: 5, rev: "$0" }
                      ];
                      if (analyticsData?.products?.length > 0) {
                        const sums = [0, 0, 0, 0];
                        analyticsData.products.forEach(p => {
                          if (p.weekly_revenue && p.weekly_revenue.length >= 4) {
                            sums[0] += p.weekly_revenue[0];
                            sums[1] += p.weekly_revenue[1];
                            sums[2] += p.weekly_revenue[2];
                            sums[3] += p.weekly_revenue[3];
                          }
                        });
                        const max = Math.max(...sums, 1);
                        return sums.map((s, idx) => ({ day: `W${idx + 1}`, val: Math.max((s / max) * 100, 5), rev: `$${(s / 1000).toFixed(1)}k` }));
                      }
                      return fallbackChartData;
                    })().map((d, i) => (
                      <div key={i} style={{ flex: 1, height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", position: "relative", cursor: "pointer", zIndex: 1 }} className="chart-bar-container">
                        {/* Dot marker on the line */}
                        <div style={{ position: "absolute", top: `${100 - d.val}%`, marginTop: -6, width: 12, height: 12, borderRadius: "50%", background: isDarkMode ? "#161618" : "#ffffff", border: "3px solid #22c55e", opacity: 0, transition: "opacity 0.2s ease" }} className="chart-tooltip" />
                        {/* Text Tooltip */}
                        <div style={{ position: "absolute", top: `${100 - d.val}%`, marginTop: -38, opacity: 0, transition: "all 0.2s ease", fontSize: 11, fontWeight: 700, color: t.text, background: isDarkMode ? "#0f0f10" : "#ffffff", padding: "6px 10px", borderRadius: 6, border: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}`, whiteSpace: "nowrap" }} className="chart-tooltip">{d.rev}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, padding: "0 10px" }}>
                    {["Week 1", "Week 2", "Week 3", "Week 4"].map(d => (
                      <span key={d} style={{ fontSize: 12, fontWeight: 600, color: t.subtext, flex: 1, textAlign: "center" }}>{d}</span>
                    ))}
                  </div>
                </div>
                {/* AI Agent Insights */}
                <div style={{ background: isDarkMode ? "#161618" : "#ffffff", border: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}`, borderRadius: 16, padding: "24px", display: "flex", flexDirection: "column" }}>
                  <p style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 24 }}>AI Agent Insights</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
                    <div style={{ background: "transparent", border: "none", padding: "8px 0", display: "flex", gap: 12 }}>
                      <div style={{ color: "#38bdf8", marginTop: 2 }}>
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                      </div>
                      <div>
                        <h4 style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 4 }}>High Inquiry Rate</h4>
                        <p style={{ fontSize: 12, color: t.subtext, lineHeight: 1.4 }}>The Buyer AI has successfully closed 34 sales by answering questions about your top products.</p>
                      </div>
                    </div>
                    <div style={{ background: "transparent", border: "none", padding: "8px 0", display: "flex", gap: 12 }}>
                      <div style={{ color: "#a855f7", marginTop: 2 }}>
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
                      </div>
                      <div>
                        <h4 style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 4 }}>Campaign Success</h4>
                        <p style={{ fontSize: 12, color: t.subtext, lineHeight: 1.4 }}>Your latest Flash Sale video campaign increased conversion rates by 12% in the last 2 hours.</p>
                      </div>
                    </div>
                  </div>
                  <button style={{ width: "100%", marginTop: 16, background: isDarkMode ? "#0f0f10" : "#ffffff", color: t.text, border: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}`, padding: "12px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.borderColor = themeColor} onMouseLeave={e => e.currentTarget.style.borderColor = t.border}>
                    View Detailed Report
                  </button>
                </div>
              </div>
            </div>
    </>
  );
};

import React from 'react';
import { SECTION_REGISTRY } from './SectionRegistry';
import { VideoPlayer } from '../components/VideoPlayer';

export function DynamicRenderer({ layout, globalProps }) {
  if (!layout || !Array.isArray(layout)) return null;
  return (
    <div className="dynamic-layout-root">
      {layout.map((section, idx) => {
        if (!section || !section.type) return null;
        const registryEntry = SECTION_REGISTRY[section.type];
        if (!registryEntry) {
          console.warn(`Section type "${section.type}" not found in registry.`);
          return null;
        }
        // Find variant or fallback
        const variants = registryEntry.variants || {};
        const VariantComponent = variants[section.variant] || variants["centered"] || variants["grid"] || Object.values(variants)[0];
        if (typeof VariantComponent !== "function") {
          console.error(`No valid variant found for section "${section.type}"`);
          return null;
        }
        const combinedProps = {
          ...globalProps,
          ...(section.props || {}),
          products: globalProps.products?.length ? globalProps.products : section.props?.products || [],
          items: globalProps.items?.length ? globalProps.items : section.props?.items || [],
          title: section.props?.title || globalProps.title,
          subtitle: section.props?.subtitle || globalProps.subtitle,
          buttonText: section.props?.buttonText || globalProps.buttonText,
          collection: section.props?.collection || globalProps.collection,
        };
        return (
          <div key={section.id || `${section.type}-${idx}`} className={`section-wrapper-${section.type}`}>
            <section id={section.id || section.type} style={{ position: "relative" }}>
              <VariantComponent {...combinedProps} />
            </section>
            {(() => {
              if (section.type !== "hero") return null;
              let sVids = Array.isArray(globalProps.storeVideos) ? globalProps.storeVideos.filter(v => typeof v === 'string' && v.trim() !== "") : [];
              if (sVids.length === 0 && typeof globalProps.storeVideo === 'string' && globalProps.storeVideo.trim() !== "") sVids = [globalProps.storeVideo];
              if (sVids.length === 0 && Array.isArray(globalProps.branding?.storeVideos)) sVids = globalProps.branding.storeVideos.filter(v => typeof v === 'string' && v.trim() !== "");
              if (sVids.length === 0 && typeof globalProps.branding?.storeVideo === 'string' && globalProps.branding.storeVideo.trim() !== "") sVids = [globalProps.branding.storeVideo];
              if (sVids.length === 0 && Array.isArray(section.props?.storeVideos)) sVids = section.props.storeVideos.filter(v => typeof v === 'string' && v.trim() !== "");
              if (sVids.length === 0 && typeof section.props?.storeVideo === 'string' && section.props.storeVideo.trim() !== "") sVids = [section.props.storeVideo];
              if (sVids.length === 0) return null;
              return (
                <section style={{ padding: "clamp(0px, 4vw, 60px) clamp(0px, 4vw, 40px)", background: globalProps.isDarkMode ? "#0f0f10" : "#ffffff" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
                    {[...new Set(sVids)].map((vidUrl, i) => (
                      <div key={i} style={{ maxWidth: 1100, margin: "0 auto", width: "100%" }}>
                        <div style={{ borderRadius: "clamp(0px, 4vw, 24px)", overflow: "hidden", position: "relative", aspectRatio: "16/9", background: globalProps.isDarkMode ? "#1a1a1e" : "#f3f4f6", border: `1px solid ${globalProps.isDarkMode ? "#2a2a2e" : "#e5e7eb"}` }}>
                          <VideoPlayer
                            key={vidUrl}
                            src={vidUrl}
                            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 1, transition: "opacity 0.4s ease" }}
                          />
                          <div style={{ position: "absolute", top: "8px", right: "8px" }}>
                            <span style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", color: "#fff", fontSize: 9, fontWeight: 600, padding: "2px 8px", borderRadius: 100, display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 4, height: 4, borderRadius: "50%", background: "#4ade80", animation: "pulse 1.5s infinite" }} /> Live Now</span>
                          </div>
                        </div>
                        <div style={{ paddingTop: "clamp(20px, 4vw, 32px)", paddingLeft: "clamp(4px, 2vw, 16px)", paddingRight: "clamp(4px, 2vw, 16px)", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                          <div style={{ marginBottom: "12px" }}>
                            <span style={{ background: "rgba(239, 68, 68, 0.9)", color: "#fff", fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 100, textTransform: "uppercase", letterSpacing: 0.5 }}>Flash Sale</span>
                          </div>
                          <h2 style={{ fontSize: "clamp(24px, 5vw, 36px)", color: globalProps.isDarkMode ? "#fff" : "#111", fontFamily: "'Playfair Display', serif", fontWeight: 700, marginBottom: "8px", lineHeight: 1.2 }}>{globalProps.title || "Exclusive Collection"}</h2>
                          <p style={{ color: globalProps.isDarkMode ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)", fontSize: "clamp(14px, 3vw, 16px)", maxWidth: 600, lineHeight: 1.6, marginBottom: "24px" }}>Explore our cinematic product showcases directly inside the storefront.</p>
                          <button style={{ background: globalProps.isDarkMode ? "#fff" : "#111", color: globalProps.isDarkMode ? "#000" : "#fff", border: "none", borderRadius: 8, padding: "12px 32px", fontSize: "14px", fontWeight: 700, cursor: "pointer", width: "fit-content", transition: "transform 0.2s" }}>Shop Featured</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })()}
            {(() => {
              if (section.type !== "featured_products" && !(idx === layout.length - 1 && !layout.some(s => s.type === "featured_products"))) return null;
              let pVids = Array.isArray(globalProps.promoVideos) ? globalProps.promoVideos.filter(v => typeof v === 'string' && v.trim() !== "") : [];
              if (pVids.length === 0 && typeof globalProps.promoVideo === 'string' && globalProps.promoVideo.trim() !== "") pVids = [globalProps.promoVideo];
              if (pVids.length === 0 && Array.isArray(globalProps.branding?.promoVideos)) pVids = globalProps.branding.promoVideos.filter(v => typeof v === 'string' && v.trim() !== "");
              if (pVids.length === 0 && typeof globalProps.branding?.promoVideo === 'string' && globalProps.branding.promoVideo.trim() !== "") pVids = [globalProps.branding.promoVideo];
              if (pVids.length === 0 && typeof globalProps.branding?.videoUrl === 'string' && globalProps.branding.videoUrl.trim() !== "") pVids = [globalProps.branding.videoUrl];
              if (pVids.length === 0 && Array.isArray(section.props?.promoVideos)) pVids = section.props.promoVideos.filter(v => typeof v === 'string' && v.trim() !== "");
              if (pVids.length === 0 && typeof section.props?.promoVideo === 'string' && section.props.promoVideo.trim() !== "") pVids = [section.props.promoVideo];
              if (pVids.length === 0 && typeof section.props?.videoUrl === 'string' && section.props.videoUrl.trim() !== "") pVids = [section.props.videoUrl];
              if (pVids.length === 0) return null;
              return (
                <section style={{ padding: "clamp(20px, 4vw, 80px) clamp(16px, 4vw, 40px)", background: globalProps.isDarkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", borderTop: `1px solid ${globalProps.isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}` }}>
                  <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "clamp(16px, 4vw, 32px)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(20px, 4vw, 32px)", fontWeight: 700, color: globalProps.isDarkMode ? "#fff" : "#111", margin: 0 }}>
                          Featured Video Campaigns
                        </h2>
                        <span style={{ background: "rgba(239, 68, 68, 0.9)", color: "#fff", fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 100, textTransform: "uppercase", letterSpacing: 0.5 }}>Flash Sale</span>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
                      {pVids.map((vidUrl, i) => (
                        <div key={i} style={{ width: "100%", display: "flex", justifyContent: "flex-start" }}>
                          <div style={{ width: "100%", maxWidth: globalProps.isSellerMobile ? 180 : 280, borderRadius: 16, overflow: "hidden", position: "relative", aspectRatio: "9/16", background: globalProps.isDarkMode ? "#1a1a1e" : "#f3f4f6", border: `1px solid ${globalProps.isDarkMode ? "#2a2a2e" : "#e5e7eb"}` }}>
                            <VideoPlayer
                              key={vidUrl}
                              src={vidUrl}
                              style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 1, transition: "opacity 0.4s ease" }}
                            />
                            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "40%", background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)", pointerEvents: "none" }} />
                            <div style={{ position: "absolute", bottom: "8px", left: "8px", right: "8px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12 }}>
                              <p style={{ color: "#fff", fontSize: 11, fontWeight: 500, margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textShadow: "0 1px 2px rgba(0,0,0,0.8)", lineHeight: 1.3 }}>{globalProps.description || "Limited edition collection. Grab yours before it's gone!"}</p>
                              <span style={{ background: "rgba(239, 68, 68, 0.9)", backdropFilter: "blur(4px)", color: "#fff", fontSize: 8, fontWeight: 800, padding: "3px 8px", borderRadius: 100, textTransform: "uppercase", letterSpacing: 0.5, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>Shop Now</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );
            })()}
          </div>
        );
      })}
    </div>
  );
}


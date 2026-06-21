import React from 'react';
import { storeThemeDark, storeThemeLight } from '../utils/constants';
import { ImageLoadingPlaceholder } from '../components/ImageLoadingPlaceholder';

export const SECTION_REGISTRY = {
  header: {
    variants: {
      default: (props) => null
    }
  },
  hero: {
    variants: {
      centered: (props) => {
        if (!props.title && !props.subtitle && !props.buttonText && !props.heroImage) return null;
        const t = props.isDarkMode ? storeThemeDark : storeThemeLight;
        const resolvedBg = props.heroImage ? `url('${props.heroImage}')` : (props.isDarkMode ? props.heroBg : "linear-gradient(to bottom, #ffffff, #f3f4f6)");
        const overlayOpacity = props.heroImage ? (props.isDarkMode ? 0.6 : 0.3) : 0;
        return (
          <div style={{
            width: '100%',
            aspectRatio: '21 / 9',
            minHeight: 350,
            maxHeight: '80vh',
            backgroundImage: resolvedBg,
            backgroundSize: "cover", backgroundPosition: "center", position: "relative",
            display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center",
            padding: "clamp(20px, 4vw, 80px) 20px", transition: "background 0.3s ease"
          }}>
            <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${overlayOpacity})`, zIndex: 0, transition: "background 0.3s ease" }}></div>
            <div style={{ position: "relative", zIndex: 2, maxWidth: 700 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: props.themeColor, letterSpacing: 4, textTransform: "uppercase", display: "block", marginBottom: 16 }}>{props.collection}</span>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(20px, 5vw, 52px)', fontWeight: 600, lineHeight: 1.1, marginBottom: 16, color: props.heroImage ? "#fff" : t.text.primary, transition: "color 0.3s ease" }}>{props.title}</h1>
              <p style={{ fontSize: 'clamp(11px, 3vw, 16px)', color: props.heroImage ? "#ccc" : t.text.secondary, maxWidth: 500, margin: "0 auto", lineHeight: 1.6, transition: "color 0.3s ease" }}>{props.subtitle}</p>
              <button style={{
                marginTop: 20, background: props.themeColor, color: "#0f0f10",
                border: "none", padding: "clamp(8px, 2vw, 14px) clamp(16px, 5vw, 40px)", borderRadius: 6,
                fontSize: 'clamp(11px, 2vw, 13px)', fontWeight: 700, cursor: "pointer", letterSpacing: 1, transition: "all 0.3s ease"
              }}>{props.buttonText}</button>
            </div>
          </div>
        );
      },
      split: (props) => {
        if (!props.title && !props.subtitle && !props.buttonText && !props.heroImage) return null;
        const t = props.isDarkMode ? storeThemeDark : storeThemeLight;
        const resolvedBg = props.heroImage ? `url('${props.heroImage}')` : (props.isDarkMode ? props.heroBg : "linear-gradient(to right, #ffffff, #f3f4f6)");
        const overlayOpacity = props.heroImage ? (props.isDarkMode ? 0.6 : 0.3) : 0;
        return (
          <div style={{
            width: '100%',
            aspectRatio: '21 / 9',
            minHeight: 400,
            maxHeight: '85vh',
            backgroundImage: resolvedBg,
            backgroundSize: "cover", backgroundPosition: "center", position: "relative",
            display: "flex", alignItems: "center", justifyContent: "flex-start", textAlign: "left",
            padding: "clamp(20px, 4vw, 60px) clamp(16px, 5vw, 60px)", transition: "background 0.3s ease"
          }}>
            <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${overlayOpacity})`, zIndex: 0, transition: "background 0.3s ease" }}></div>
            <div style={{ position: "relative", zIndex: 2, maxWidth: 500 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: props.themeColor, letterSpacing: 4, textTransform: "uppercase", display: "block", marginBottom: 16 }}>{props.collection}</span>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(20px, 5vw, 56px)', fontWeight: 600, lineHeight: 1.1, marginBottom: 16, color: props.heroImage ? "#fff" : t.text.primary, transition: "color 0.3s ease" }}>{props.title}</h1>
              <p style={{ fontSize: 'clamp(11px, 3vw, 16px)', color: props.heroImage ? "#ccc" : t.text.secondary, lineHeight: 1.6, transition: "color 0.3s ease" }}>{props.subtitle}</p>
              <button style={{
                marginTop: 20, background: props.themeColor, color: "#0f0f10",
                border: "none", padding: "clamp(8px, 2vw, 14px) clamp(16px, 5vw, 40px)", borderRadius: 6,
                fontSize: 'clamp(11px, 2vw, 13px)', fontWeight: 700, cursor: "pointer", letterSpacing: 1, transition: "all 0.3s ease"
              }}>{props.buttonText}</button>
            </div>
            {!props.heroImage && (
              <div style={{
                position: "absolute", right: 0, top: 0, bottom: 0, width: "45%",
                background: `linear-gradient(90deg, transparent, ${props.isDarkMode ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)'})`,
                backgroundSize: "cover", backgroundPosition: "center",
                clipPath: "polygon(15% 0, 100% 0, 100% 100%, 0% 100%)",
                opacity: 0.8, zIndex: 1
              }}></div>
            )}
          </div>
        );
      },
      "cinematic-fullscreen": (props) => {
        if (!props.title && !props.subtitle && !props.buttonText && !props.heroImage) return null;
        const t = props.isDarkMode ? storeThemeDark : storeThemeLight;
        const resolvedBg = props.heroImage ? `url('${props.heroImage}')` : (props.isDarkMode ? props.heroBg : "linear-gradient(to bottom, #ffffff, #f9fafb)");
        const overlayColor = props.isDarkMode ? "rgba(0,0,0,0.2), rgba(0,0,0,0.8)" : "rgba(255,255,255,0.1), rgba(255,255,255,0.6)";
        return (
          <div style={{
            width: '100%',
            aspectRatio: '16 / 9',
            minHeight: 500,
            maxHeight: '100vh',
            backgroundImage: resolvedBg,
            backgroundSize: "cover", backgroundPosition: "center", position: "relative",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center",
            padding: "0 20px", transition: "background 0.3s ease"
          }}>
            <div style={{ position: "absolute", inset: 0, background: props.heroImage ? (props.isDarkMode ? "linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.8))" : "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.5))") : `linear-gradient(to bottom, ${overlayColor})`, zIndex: 0, transition: "background 0.3s ease" }}></div>
            <div style={{ position: "relative", zIndex: 2, maxWidth: 900 }}>
              <h1 style={{
                fontFamily: "'Playfair Display', serif", fontSize: 'clamp(24px, 6vw, 84px)', fontWeight: 300,
                lineHeight: 1, marginBottom: 16, letterSpacing: "-0.02em",
                textShadow: props.heroImage || props.isDarkMode ? "0 10px 30px rgba(0,0,0,0.5)" : "none",
                color: props.heroImage ? "#fff" : t.text.primary, transition: "color 0.3s ease"
              }}>{props.title}</h1>
              <p style={{ fontSize: 'clamp(12px, 3.5vw, 20px)', opacity: 0.8, maxWidth: 600, margin: "0 auto 24px", fontWeight: 300, letterSpacing: 1, color: props.heroImage ? "#fff" : t.text.secondary, transition: "color 0.3s ease" }}>{props.subtitle}</p>
              <button style={{
                background: props.heroImage || props.isDarkMode ? "#fff" : "#111", color: props.heroImage || props.isDarkMode ? "#000" : "#fff", border: "none", padding: "clamp(10px, 2vw, 18px) clamp(20px, 5vw, 48px)", borderRadius: 100,
                fontSize: 'clamp(11px, 2vw, 14px)', fontWeight: 600, cursor: "pointer", transition: "all 0.3s ease",
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
              }}>{props.buttonText}</button>
            </div>
            <div style={{ position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)", animation: "pulse 2s infinite", color: props.heroImage ? "#fff" : t.text.primary }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 13l5 5 5-5M7 6l5 5 5-5" /></svg>
            </div>
          </div>
        );
      }
    }
  },
  featured_products: {
    variants: {
      grid: (props) => {
        const t = props.isDarkMode ? storeThemeDark : storeThemeLight;
        const [visibleCount, setVisibleCount] = React.useState(12);
        
        const allProducts = (props.products && props.products.length > 0) ? props.products : (props.isBuilding ? Array(4).fill({ name: "Generating Product...", price: "...", desc: "Curating product details and imagery..." }) : []);
        const displayProducts = allProducts.slice(0, visibleCount);

        const skStyle = {
          backgroundImage: t.surface.skeleton,
          backgroundSize: "200% 100%",
          animation: "shimmer 1.8s infinite linear"
        };
        return (
          <div style={{ padding: "clamp(30px, 5vw, 60px) clamp(16px, 4vw, 40px)", transition: "background 0.3s ease" }}>
            <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 30 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(24px, 5vw, 32px)', color: t.text.primary, transition: "color 0.3s ease" }}>{props.sectionTitle || "Curated Selection"}</h2>
              <span style={{ fontSize: 11, color: props.isDarkMode ? props.themeColor : t.text.primary, cursor: "pointer", fontWeight: 600, letterSpacing: 1, transition: "color 0.3s ease" }}>EXPLORE ALL</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(clamp(140px, 20vw, 240px), 1fr))", gap: 'clamp(12px, 3vw, 24px)' }}>
              {displayProducts.map((p, i) => (
                <div
                  key={i}
                  className="product-card hover-lift"
                  onClick={() => {
                    if (props.onSelectProduct) {
                      props.onSelectProduct({
                        ...p,
                        name: p.name,
                        price: p.price,
                        desc: p.desc || p.description || "An exclusive, high-quality product carefully curated for our collection. Designed to deliver excellence.",
                        imageUrl: p.imageUrl || p.image || "",
                        promo: p.promo || "Curated",
                        store: props.title || "Brand Store",
                        rating: "4.9",
                        sales: "1.2K+ sold"
                      });
                    }
                  }}
                  style={{
                    background: props.isDarkMode ? "#161618" : "#f9fafb",
                    border: "none",
                    borderRadius: 16,
                    overflow: "hidden",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.2s ease"
                  }}
                >
                  {/* Image: shimmer while loading, real image on top */}
                  <div style={{ aspectRatio: "1 / 1", width: "100%", position: "relative", ...((p.verifiedUrl || p.imageUrl) ? { backgroundColor: t.surface.secondary } : skStyle), transition: "background-color 0.3s ease" }}>
                    {!(p.verifiedUrl || p.imageUrl) && <ImageLoadingPlaceholder />}
                    {p.imageUrl && (
                      <img
                        key={`${p.imageUrl}-${p.verifiedUrl ? 'verified' : 'pending'}`}
                        src={p.imageUrl}
                        alt={p.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0, opacity: (p.verifiedUrl || p.imageUrl) ? 1 : 0, transition: "opacity 0.5s ease-in" }}
                        onLoad={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.display = "block"; }}
                        onError={e => { e.currentTarget.style.display = "none"; }}
                      />
                    )}
                    {p.promo && <div style={{ position: "absolute", top: 8, left: 8, background: props.themeColor || "rgba(200,184,154,0.9)", color: "#000", fontSize: 9, fontWeight: 800, padding: "3px 8px", borderRadius: 8, zIndex: 2, backdropFilter: "blur(4px)" }}>{p.promo}</div>}
                  </div>
                  {/* Text Container */}
                  <div style={{ padding: "clamp(12px, 2vw, 16px)", display: "flex", flexDirection: "column", flex: 1 }}>
                    <h3 style={{ fontSize: 'clamp(12px, 3vw, 15px)', fontWeight: 700, color: t.text.primary, transition: "color 0.3s ease", marginBottom: 4, lineHeight: 1.3 }}>{p.name}</h3>
                    <p style={{ fontSize: 'clamp(10px, 2.5vw, 12px)', color: t.text.secondary, marginBottom: 8, lineHeight: 1.4, flex: 1, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", transition: "color 0.3s ease" }}>{p.desc || p.description || "An exclusive, high-quality product carefully curated for our collection."}</p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8, flexWrap: "wrap", gap: 4 }}>
                      <span style={{ fontSize: 'clamp(13px, 3.5vw, 15px)', fontWeight: 800, color: props.themeColor || "#c8b89a" }}>{p.price}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: t.text.secondary }}>
                        <span>⭐ 4.9</span>
                        <span style={{ display: 'none' }}>•</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {visibleCount < allProducts.length && (
              <div style={{ display: "flex", justifyContent: "center", marginTop: 40 }}>
                <button
                  onClick={() => setVisibleCount(prev => prev + 12)}
                  style={{
                    background: "transparent",
                    border: `1px solid ${props.isDarkMode ? "#c8b89a" : "#8b7355"}`,
                    color: props.isDarkMode ? "#c8b89a" : "#8b7355",
                    padding: "10px 24px",
                    borderRadius: 100,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = props.isDarkMode ? "#c8b89a" : "#8b7355"; e.currentTarget.style.color = props.isDarkMode ? "#000" : "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = props.isDarkMode ? "#c8b89a" : "#8b7355"; }}
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        );
      },
      "editorial-grid": (props) => {
        const t = props.isDarkMode ? storeThemeDark : storeThemeLight;
        return (
          <div style={{ padding: "80px 40px", background: t.surface.primary, transition: "background 0.3s ease" }}>
            <div style={{ maxWidth: 600, marginBottom: 60 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 48, color: t.text.primary, marginBottom: 20, transition: "color 0.3s ease" }}>The Collection</h2>
              <p style={{ color: t.text.secondary, fontSize: 18, lineHeight: 1.6, transition: "color 0.3s ease" }}>Discover our latest pieces, crafted with precision and designed for the modern individual.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 20 }}>
              {((props.products && props.products.length > 0) ? props.products : (props.isBuilding ? Array(3).fill({ name: "Generating...", price: "..." }) : [])).slice(0, 3).map((p, i) => (
                <div key={i} style={{ gridColumn: i === 0 ? "span 8" : "span 4", height: i === 0 ? 600 : 290, position: "relative", overflow: "hidden", borderRadius: 4, backgroundColor: t.surface.secondary, transition: "background-color 0.3s ease" }}>
                  <img src={p.imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt={p.name} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 30 }}>
                    <h3 style={{ color: "#fff", fontSize: i === 0 ? 32 : 18 }}>{p.name}</h3>
                    <p style={{ color: props.themeColor, fontWeight: 600, marginTop: 5 }}>{p.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }
    }
  },
  philosophy: {
    variants: {
      scroller: (props) => {
        const t = props.isDarkMode ? storeThemeDark : storeThemeLight;
        const items = props.items || [];
        const doubledItems = [...items, ...items]; // For infinite scroll effect
        return (
          <div style={{ padding: "clamp(30px, 5vw, 80px) 0", background: "transparent", overflow: "hidden", transition: "background 0.3s ease" }}>
            <div style={{ padding: "0 clamp(16px, 4vw, 40px)", marginBottom: "clamp(20px, 4vw, 40px)" }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(24px, 5vw, 32px)', color: t.text.primary, transition: "color 0.3s ease" }}>Our Ethos</h2>
            </div>
            <div className="hide-scrollbar" style={{ overflowX: "hidden" }}>
              <style>{`
                .philosophy-card {
                  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .philosophy-card:hover {
                  transform: translateY(-8px);
                  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
                }
                .philosophy-card img {
                  transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease-in !important;
                }
                .philosophy-card:hover img {
                  transform: scale(1.06);
                }
              `}</style>
              <div className="philosophy-scroller">
                {doubledItems.map((v, i) => (
                  <div key={i} className="philosophy-card" onClick={() => props.onSelectPhilosophy && props.onSelectPhilosophy(v)} style={{ flex: "0 0 clamp(200px, 60vw, 350px)", height: "clamp(280px, 60vh, 450px)", position: "relative", borderRadius: 24, overflow: "hidden", cursor: "pointer", ...((v.verifiedUrl || v.imageUrl) ? { backgroundColor: t.surface.secondary } : { backgroundImage: t.surface.skeleton, backgroundSize: "200% 100%", animation: "shimmer 1.8s infinite linear" }) }}>
                    {!(v.verifiedUrl || v.imageUrl) && <ImageLoadingPlaceholder />}
                    {v.imageUrl && <img key={`${v.imageUrl}-${v.verifiedUrl ? 'verified' : 'pending'}`} src={v.imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0, opacity: (v.verifiedUrl || v.imageUrl) ? 1 : 0, transition: "opacity 0.5s ease-in" }} onLoad={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.display = "block"; }} onError={e => { e.currentTarget.style.display = "none"; }} />}
                    <div style={{ position: "absolute", inset: 0, padding: "clamp(20px, 4vw, 40px)", display: "flex", flexDirection: "column", justifyContent: "flex-end", background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)" }}>
                      <h4 style={{ fontSize: 'clamp(10px, 2.5vw, 12px)', fontWeight: 800, color: props.themeColor || "#fff", letterSpacing: 4, textTransform: "uppercase", marginBottom: 12 }}>{v.label || v.title}</h4>
                      <p style={{ fontSize: 'clamp(12px, 3.5vw, 15px)', color: "rgba(255,255,255,0.9)", lineHeight: 1.5, fontWeight: 300, display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{v.sub || v.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      }
    }
  },
  trust_bar: {
    variants: {
      ticker: (props) => null, // Legacy
      "static-badges": (props) => {
        const t = props.isDarkMode ? storeThemeDark : storeThemeLight;
        return (
          <div style={{ padding: "40px 20px", background: t.surface.secondary, borderBottom: `1px solid ${t.border.subtle}`, borderTop: `1px solid ${t.border.subtle}`, transition: "all 0.3s ease" }}>
            <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "40px 80px" }}>
              {((props.items && props.items.length > 0) ? props.items : [
                { label: "Premium Quality", icon: "", sub: "Handcrafted" },
                { label: "Free Shipping", icon: "📦", sub: "Worldwide" },
                { label: "Secure Payment", icon: "&#128274;", sub: "256-bit SSL" }
              ]).map((v, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ fontSize: 28, opacity: 0.8 }}>{v.icon || ""}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary, textTransform: "uppercase", letterSpacing: 1, transition: "color 0.3s ease" }}>{v.label}</div>
                    <div style={{ fontSize: 12, color: t.text.secondary, marginTop: 2, transition: "color 0.3s ease" }}>{v.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }
    }
  },
  testimonials: {
    variants: {
      cards: (props) => {
        const t = props.isDarkMode ? storeThemeDark : storeThemeLight;
        const fallbackTestimonials = [
          { author: "Eleanor V.", title: "Verified Buyer", quote: "An absolute game changer for my daily routine. The quality is unmatched." },
          { author: "Marcus T.", title: "Verified Buyer", quote: "I've tried everything on the market, but this brand finally delivers on its promises." },
          { author: "Sophia L.", title: "Verified Buyer", quote: "The aesthetic is beautiful and the product itself feels incredibly premium." }
        ];
        const displayTestimonials = (props.testimonials && props.testimonials.length > 0) ? props.testimonials : fallbackTestimonials;
        return (
          <div style={{ padding: "100px 40px", background: t.surface.primary, transition: "background 0.3s ease" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, color: t.text.primary, textAlign: "center", marginBottom: 60, transition: "color 0.3s ease" }}>Client Perspectives</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 30 }}>
                {displayTestimonials.map((testimonial, i) => (
                  <div key={i} style={{ padding: 40, background: t.surface.card, borderRadius: 16, border: `1px solid ${t.border.subtle}`, transition: "all 0.3s ease" }}>
                    <div style={{ color: props.themeColor || (props.isDarkMode ? "#fff" : "#000"), marginBottom: 20, fontSize: 18, transition: "color 0.3s ease" }}>★★★★★</div>
                    <p style={{ color: t.text.secondary, fontSize: 16, lineHeight: 1.6, fontStyle: "italic", marginBottom: 30, transition: "color 0.3s ease" }}>"{testimonial.quote}"</p>
                    <div style={{ borderTop: `1px solid ${t.border.subtle}`, paddingTop: 20, transition: "border-color 0.3s ease" }}>
                      <div style={{ color: t.text.primary, fontWeight: 700, fontSize: 14, transition: "color 0.3s ease" }}>{testimonial.author}</div>
                      <div style={{ color: t.text.muted, fontSize: 12, marginTop: 4, transition: "color 0.3s ease" }}>{testimonial.title}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      }
    }
  },
  faq: {
    variants: {
      accordion: (props) => {
        const t = props.isDarkMode ? storeThemeDark : storeThemeLight;
        const fallbackFaq = [
          { q: "What makes your products different?", a: "We combine autonomous AI curation with the highest quality sustainable materials to create bespoke experiences." },
          { q: "How long does shipping take?", a: "Orders are processed immediately by our AI systems. Standard shipping takes 3-5 business days globally." },
          { q: "Are your products cruelty-free?", a: "Absolutely. We are committed to 100% ethical and cruelty-free practices across our entire supply chain." }
        ];
        const displayFaq = (props.faq && props.faq.length > 0) ? props.faq : fallbackFaq;
        return (
          <div style={{ padding: "100px 40px", background: t.surface.primary, transition: "background 0.3s ease" }}>
            <div style={{ maxWidth: 800, margin: "0 auto" }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, color: t.text.primary, textAlign: "center", marginBottom: 60, transition: "color 0.3s ease" }}>Common Questions</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {displayFaq.map((f, i) => (
                  <div key={i} style={{ background: t.surface.secondary, padding: "24px 30px", borderRadius: 12, border: `1px solid ${t.border.subtle}`, transition: "all 0.3s ease" }}>
                    <h4 style={{ color: t.text.primary, fontSize: 16, fontWeight: 600, marginBottom: 12, transition: "color 0.3s ease" }}>{f.q}</h4>
                    <p style={{ color: t.text.secondary, fontSize: 15, lineHeight: 1.6, transition: "color 0.3s ease" }}>{f.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      }
    }
  },
  footer: {
    variants: {
      default: (props) => {
        const t = props.isDarkMode ? storeThemeDark : storeThemeLight;
        return (
          <footer style={{ background: t.surface.primary, borderTop: `1px solid ${t.border.subtle}`, padding: "80px 40px 40px 40px", color: t.text.muted, fontFamily: "'DM Sans', sans-serif", transition: "all 0.3s ease" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 60, marginBottom: 60 }}>
              {/* Col 1: Brand & AI Status */}
              <div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: t.text.primary, marginBottom: 12, transition: "color 0.3s ease" }}>
                  {props.title || "My Store"}
                </h3>
                <p style={{ fontSize: 14, color: t.text.muted, marginBottom: 24, lineHeight: 1.6, transition: "color 0.3s ease" }}>
                  {props.subtitle || "Powered by SERA AI Agent Commerce OS."}
                </p>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: t.surface.secondary, border: `1px solid ${t.border.subtle}`, padding: "6px 12px", borderRadius: 10, transition: "all 0.3s ease" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px #4ade80" }} />
                  <span style={{ fontSize: 11, color: t.text.primary, fontWeight: 600, transition: "color 0.3s ease" }}>AI Concierge Active • 24/7 Fulfilling</span>
                </div>
              </div>
              {/* Col 2: Navigation Links */}
              <div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <h4 style={{ color: t.text.primary, fontWeight: 700, marginBottom: 8, fontSize: 13, textTransform: "uppercase", letterSpacing: 1 }}>Collections</h4>
                  <a href="#featured_products" onClick={(e) => { e.preventDefault(); document.querySelector('.section-wrapper-featured_products')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} style={{ color: t.text.muted, textDecoration: "none", transition: "color 0.2s", cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.color = props.themeColor} onMouseLeave={e => e.currentTarget.style.color = t.text.muted}>Curated Selection</a>
                  <a href="#philosophy" onClick={(e) => { e.preventDefault(); document.querySelector('.section-wrapper-philosophy')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} style={{ color: t.text.muted, textDecoration: "none", transition: "color 0.2s", cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.color = props.themeColor} onMouseLeave={e => e.currentTarget.style.color = t.text.muted}>Our Ethos</a>
                  <a href="#hero" onClick={(e) => { e.preventDefault(); document.querySelector('.section-wrapper-hero')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} style={{ color: t.text.muted, textDecoration: "none", transition: "color 0.2s", cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.color = props.themeColor} onMouseLeave={e => e.currentTarget.style.color = t.text.muted}>Spring Release</a>
                </div>
              </div>
              {/* Col 3: Support & Trust */}
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: t.text.primary, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 20, transition: "color 0.3s ease" }}>Support & Trust</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 14 }}>
                  <span style={{ color: t.text.muted, cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = props.themeColor} onMouseLeave={e => e.currentTarget.style.color = t.text.muted}>24/7 AI Concierge</span>
                  <span style={{ color: t.text.muted, cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = props.themeColor} onMouseLeave={e => e.currentTarget.style.color = t.text.muted}>Track Fulfillment</span>
                  <span style={{ color: t.text.muted, cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = props.themeColor} onMouseLeave={e => e.currentTarget.style.color = t.text.muted}>Shipping & Returns</span>
                  <span style={{ color: t.text.muted, cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = props.themeColor} onMouseLeave={e => e.currentTarget.style.color = t.text.muted}>Privacy & Security</span>
                </div>
              </div>
              {/* Col 4: Newsletter */}
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: t.text.primary, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 20, transition: "color 0.3s ease" }}>AI Drops</h4>
                <p style={{ fontSize: 13, color: t.text.muted, marginBottom: 16, lineHeight: 1.5, transition: "color 0.3s ease" }}>Subscribe to receive early access to autonomous drops and bespoke formulations.</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <input type="email" placeholder="Enter your email" style={{ flex: 1, padding: "12px 16px", borderRadius: 8, border: `1px solid ${t.border.subtle}`, background: t.surface.secondary, color: t.text.primary, outline: "none", transition: "all 0.3s ease" }} />
                  <button style={{ background: props.themeColor || t.text.primary, color: props.isDarkMode ? "#000" : "#fff", border: "none", padding: "0 20px", borderRadius: 8, fontWeight: 700, cursor: "pointer", transition: "all 0.3s ease" }}>JOIN</button>
                </div>
              </div>
            </div>
            <div style={{ maxWidth: 1200, margin: "0 auto", borderTop: `1px solid ${t.border.subtle}`, paddingTop: 40, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20, transition: "border-color 0.3s ease" }}>
              <p style={{ fontSize: 13, color: t.text.muted, transition: "color 0.3s ease" }}>&copy; 2026 {props.title || "SERA Store"}. Generated autonomously by SERA Architecture.</p>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <span style={{ color: t.text.muted, cursor: "pointer", transition: "color 0.2s", display: "flex", alignItems: "center" }} onMouseEnter={e => e.currentTarget.style.color = props.themeColor} onMouseLeave={e => e.currentTarget.style.color = t.text.muted} title="X / Twitter">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </span>
                <span style={{ color: t.text.muted, cursor: "pointer", transition: "color 0.2s", display: "flex", alignItems: "center" }} onMouseEnter={e => e.currentTarget.style.color = props.themeColor} onMouseLeave={e => e.currentTarget.style.color = t.text.muted} title="Instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                </span>
              </div>
            </div>
          </footer>
        );
      }
    }
  },
  video_landscape: {
    variants: {
      default: (props) => {
        if (!props.videoUrl) return null;
        return (
          <section style={{ padding: "60px 40px", background: props.isDarkMode ? "#0f0f10" : "#ffffff" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%" }}>
              <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", borderRadius: "clamp(12px, 3vw, 24px)", overflow: "hidden", background: "#1a1a1e", border: `1px solid ${props.isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}` }}>
                <video
                  src={props.videoUrl}
                  autoPlay loop muted playsInline preload="auto"
                  onCanPlay={e => { e.currentTarget.style.opacity = '1'; }}
                  style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0, transition: "opacity 0.4s ease" }}
                />
                <div style={{ position: "absolute", top: "8px", right: "8px" }}>
                  <span style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", color: "#fff", fontSize: 9, fontWeight: 600, padding: "2px 8px", borderRadius: 100, display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 4, height: 4, borderRadius: "50%", background: "#4ade80", animation: "pulse 1.5s infinite" }} /> Live Now</span>
                </div>
              </div>
              <div style={{ paddingTop: "clamp(20px, 4vw, 32px)", paddingLeft: "clamp(4px, 2vw, 16px)", paddingRight: "clamp(4px, 2vw, 16px)", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <div style={{ marginBottom: "12px" }}>
                  <span style={{ background: "rgba(239, 68, 68, 0.9)", color: "#fff", fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 100, textTransform: "uppercase", letterSpacing: 0.5 }}>Flash Sale</span>
                </div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(24px, 5vw, 40px)", fontWeight: 700, color: props.isDarkMode ? "#fff" : "#111", margin: "0 0 12px 0", lineHeight: 1.1 }}>
                  {props.title || "Exclusive Collection"}
                </h2>
                <p style={{ color: props.isDarkMode ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)", fontSize: "clamp(14px, 3vw, 16px)", maxWidth: 600, lineHeight: 1.6, marginBottom: "24px" }}>{props.subtitle || "Explore our cinematic product showcases directly inside the storefront."}</p>
                <button style={{ background: props.isDarkMode ? "#fff" : "#111", color: props.isDarkMode ? "#000" : "#fff", border: "none", borderRadius: 8, padding: "12px 32px", fontSize: "14px", fontWeight: 700, cursor: "pointer", width: "fit-content", transition: "transform 0.2s" }}>Shop Featured</button>
              </div>
            </div>
          </section>
        );
      }
    }
  },
  video_vertical: {
    variants: {
      default: (props) => {
        if (!props.videoUrl) return null;
        return (
          <section style={{ padding: "80px 40px", background: props.isDarkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", borderTop: `1px solid ${props.isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}` }}>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 40 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: props.isDarkMode ? "#fff" : "#111", margin: 0 }}>
                    {props.title || "Featured Promo Campaigns"}
                  </h2>
                  <span style={{ background: "rgba(239, 68, 68, 0.9)", color: "#fff", fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 100, textTransform: "uppercase", letterSpacing: 0.5 }}>Flash Sale</span>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <div style={{ maxWidth: 300, width: "100%" }}>
                  <div style={{ borderRadius: 16, overflow: "hidden", position: "relative", aspectRatio: "9/16", background: props.isDarkMode ? "#1a1a1e" : "#f3f4f6", border: `1px solid ${props.isDarkMode ? "#2a2a2e" : "#e5e7eb"}` }}>
                    <video
                      src={props.videoUrl}
                      autoPlay loop muted playsInline preload="auto"
                      onCanPlay={e => { e.currentTarget.style.opacity = '1'; }}
                      style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0, transition: "opacity 0.4s ease" }}
                    />
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "40%", background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)", pointerEvents: "none" }} />
                    <div style={{ position: "absolute", bottom: "8px", left: "8px", right: "8px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12 }}>
                      <p style={{ color: "#fff", fontSize: 11, fontWeight: 500, margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textShadow: "0 1px 2px rgba(0,0,0,0.8)", lineHeight: 1.3 }}>{props.description || "Limited edition collection. Grab yours before it's gone!"}</p>
                      <span style={{ background: "rgba(239, 68, 68, 0.9)", backdropFilter: "blur(4px)", color: "#fff", fontSize: 8, fontWeight: 800, padding: "3px 8px", borderRadius: 100, textTransform: "uppercase", letterSpacing: 0.5, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>Shop Now</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      }
    }
  }
};
/**
 * DYNAMIC RENDERER
 * Maps the Layout Tree (Schema) to the Section Registry.
 */

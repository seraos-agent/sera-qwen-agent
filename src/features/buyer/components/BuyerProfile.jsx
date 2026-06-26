import React from 'react';
import { useBuyerContext } from '../BuyerContext';

export const BuyerProfile = () => {
  const { t, isDarkMode, setAppMode } = useBuyerContext();

  const cardStyle = {
    background: isDarkMode ? '#161618' : '#fff',
    border: `1px solid ${t.border}`,
    borderRadius: 24,
    padding: '32px',
    boxShadow: isDarkMode ? 'none' : '0 12px 32px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden'
  };

  const badgeStyle = {
    background: isDarkMode ? 'rgba(200, 184, 154, 0.1)' : 'rgba(139, 115, 85, 0.05)',
    color: isDarkMode ? '#c8b89a' : '#8b7355',
    padding: '4px 12px',
    borderRadius: 100,
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 1,
    textTransform: 'uppercase',
    border: `1px solid ${isDarkMode ? 'rgba(200, 184, 154, 0.2)' : 'rgba(139, 115, 85, 0.1)'}`
  };

  return (
    <div style={{ padding: 'clamp(24px, 5vw, 60px) clamp(16px, 4vw, 48px)', paddingBottom: 140, color: t.text, maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      <style>{`
        .bento-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 24px;
        }
        .bento-item-4 {
          grid-column: span 4;
        }
        .bento-item-8 {
          grid-column: span 8;
        }
        .address-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .header-wrap {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 40px;
          gap: 16px;
        }
        .bento-card-padding {
          padding: 32px;
        }
        @media (max-width: 900px) {
          .bento-item-4, .bento-item-8 {
            grid-column: span 12 !important;
          }
          .address-grid {
            grid-template-columns: 1fr;
          }
          .header-wrap {
            flex-direction: column;
            align-items: flex-start;
          }
          .bento-card-padding {
            padding: 20px;
          }
        }
      `}</style>
      
      <div className="header-wrap">
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, marginBottom: 8 }}>SERA Passport</h2>
          <p style={{ color: t.subtext, fontSize: 14 }}>Your universal checkout identity across all connected storefronts.</p>
        </div>
        <div style={badgeStyle}>Verified Network</div>
      </div>

      <div className="bento-grid">
        
        {/* Universal Identity Card */}
        <div className="bento-item-4 bento-card-padding" style={{ ...cardStyle, padding: undefined, alignItems: 'center', textAlign: 'center', justifyContent: 'center' }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg, #c8b89a 0%, #8b7355 100%)', padding: 3, marginBottom: 20 }}>
            <img loading="lazy" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200" alt="User Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: `3px solid ${isDarkMode ? '#161618' : '#fff'}` }} />
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Alexia Sterling</h3>
          <p style={{ color: t.subtext, fontSize: 13, marginBottom: 16 }}>alexia.s@example.com</p>
          <span style={{ background: isDarkMode ? '#1a1a1e' : '#f3f4f6', color: t.text, padding: '6px 16px', borderRadius: 100, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80' }} /> SERA Prime Member
          </span>
        </div>

        {/* Universal Address Book */}
        <div className="bento-item-8 bento-card-padding" style={{ ...cardStyle, padding: undefined, justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                Universal Address Book
              </h3>
              <button style={{ background: 'none', border: `1px solid ${t.border}`, color: t.text, padding: '6px 16px', borderRadius: 100, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Edit</button>
            </div>
            
            <div className="address-grid">
              <div style={{ border: `1px solid ${isDarkMode ? '#c8b89a' : '#8b7355'}`, borderRadius: 16, padding: 20, position: 'relative', background: isDarkMode ? 'rgba(200, 184, 154, 0.05)' : 'rgba(139, 115, 85, 0.02)' }}>
                <span style={{ position: 'absolute', top: 16, right: 16, background: isDarkMode ? '#c8b89a' : '#8b7355', color: isDarkMode ? '#0f0f10' : '#fff', fontSize: 9, fontWeight: 800, padding: '2px 8px', borderRadius: 100 }}>DEFAULT</span>
                <p style={{ fontWeight: 700, marginBottom: 8, fontSize: 14 }}>Home (Primary)</p>
                <p style={{ color: t.subtext, fontSize: 13, lineHeight: 1.5 }}>
                  Sudirman Central Business District<br />
                  Tower 2, Floor 45, Unit B<br />
                  Jakarta Selatan, Indonesia 12190
                </p>
              </div>
              <div style={{ border: `1px dashed ${t.border}`, borderRadius: 16, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }}>
                <div style={{ textAlign: 'center', color: t.subtext }}>
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginBottom: 8 }}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  <p style={{ fontSize: 13, fontWeight: 600 }}>Add New Address</p>
                </div>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 24, fontSize: 11, color: t.subtext, display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            Auto-fills seamlessly across Shopify, WooCommerce, and Native checkouts.
          </div>
        </div>

        {/* Global Order Center */}
        <div className="bento-item-8 bento-card-padding" style={{ ...cardStyle, padding: undefined }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
              Global Order Center
            </h3>
            <button style={{ background: 'none', border: 'none', color: isDarkMode ? '#c8b89a' : '#8b7355', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>View All Orders &rarr;</button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Native Order */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px', border: `1px solid ${t.border}`, borderRadius: 16, background: isDarkMode ? 'rgba(255,255,255,0.02)' : '#fff' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: isDarkMode ? '#2a2a2e' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img loading="lazy" src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=100&h=100" alt="Item" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700 }}>Urban Runner v2</h4>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#4ade80' }}>Shipped</span>
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: t.subtext }}>
                  <span>Native Store</span>
                  <span>•</span>
                  <span>Track: SR-902183</span>
                </div>
              </div>
            </div>

            {/* Shopify Order */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px', border: `1px solid ${t.border}`, borderRadius: 16, background: isDarkMode ? 'rgba(255,255,255,0.02)' : '#fff' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: isDarkMode ? '#2a2a2e' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img loading="lazy" src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=100&h=100" alt="Item" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700 }}>Smart Watch Pro</h4>
                  <span style={{ fontSize: 12, fontWeight: 700, color: isDarkMode ? '#c8b89a' : '#8b7355' }}>Processing</span>
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: t.subtext }}>
                  <span>Shopify Partner</span>
                  <span>•</span>
                  <span>Order #8892</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Smart Payment Connectors */}
        <div className="bento-item-4 bento-card-padding" style={{ ...cardStyle, padding: undefined }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
            Smart Payments
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
            
            {/* Apple Pay */}
            <button style={{ width: '100%', padding: '16px', border: 'none', borderRadius: 12, background: 'transparent', color: t.text, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span>Apple Pay Linked</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>
            </button>

            {/* Stripe */}
            <button style={{ width: '100%', padding: '16px', border: 'none', borderRadius: 12, background: 'transparent', color: t.text, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span>Link Stripe Account</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>

            {/* Google Pay */}
            <button style={{ width: '100%', padding: '16px', border: 'none', borderRadius: 12, background: 'transparent', color: t.text, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span>Link Google Pay</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>

          </div>
          
          <p style={{ marginTop: 24, fontSize: 11, color: t.subtext, textAlign: 'center' }}>Encrypted via AES-256 for universal 1-Click checkout.</p>
        </div>

        {/* Seller Studio Access */}
        <div className="bento-item-12 bento-card-padding" style={{ ...cardStyle, gridColumn: 'span 12', padding: undefined, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ flex: 1, minWidth: 300 }}>
            <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
              Seller Studio Access
            </h3>
            <p style={{ color: t.subtext, fontSize: 14, lineHeight: 1.5, marginBottom: 16 }}>
              Launch your own autonomous, AI-powered storefront. Connect external channels, manage global inventory, and run automated promotions with zero manual effort.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: t.subtext }}>Status:</span>
              <span style={{ background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', padding: '4px 12px', borderRadius: 100, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, border: '1px solid rgba(74, 222, 128, 0.2)' }}>Eligible & Active</span>
            </div>
          </div>
          {/* Removed button */}
        </div>

      </div>
    </div>
  );
};

import React from 'react';
import confetti from 'canvas-confetti';
import { useBuyerContext } from '../BuyerContext';

export const BuyerCart = () => {
  const {
    t, isDarkMode,
    cart, setCart, setBuyerActiveNav,
    formatPriceStr, showToast
  } = useBuyerContext();

  const isMobile = window.innerWidth < 768;

  return (
    <div style={{ padding: `clamp(24px, 5vw, 40px) clamp(16px, 4vw, 48px)`, color: t.text, maxWidth: 850, margin: '0 auto', width: '100%', paddingBottom: 160, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 'clamp(24px, 4vw, 32px)' }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px, 5vw, 36px)', fontWeight: 700, color: t.text }}>Shopping Cart</h2>
        {cart.length > 0 && (
          <span style={{ background: '#c8b89a', color: '#0f0f10', fontSize: 13, fontWeight: 800, padding: '6px 14px', borderRadius: 24 }}>
            {cart.reduce((sum, item) => sum + item.qty, 0)} Items
          </span>
        )}
      </div>

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {cart.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', color: t.subtext, textAlign: 'center', background: isDarkMode ? '#161618' : '#ffffff', borderRadius: 24, border: `1px solid ${t.border}`, boxShadow: isDarkMode ? 'none' : '0 10px 40px rgba(0,0,0,0.03)' }}>
            <div style={{ background: isDarkMode ? '#2a2a2e' : '#f3f4f6', width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
              <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ opacity: 0.8 }}>
                <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </div>
            <p style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: t.text, fontFamily: "'Playfair Display', serif" }}>Your cart is empty</p>
            <p style={{ fontSize: 15, maxWidth: 320, lineHeight: 1.6 }}>Discover curated pieces and trending items to add to your collection.</p>
            <button onClick={() => setBuyerActiveNav('explore')} style={{ marginTop: 32, background: '#c8b89a', color: '#0f0f10', border: 'none', borderRadius: 100, padding: '14px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>Start Exploring</button>
          </div>
        ) : (
          <div style={{ background: isDarkMode ? '#161618' : '#ffffff', borderRadius: 24, border: `1px solid ${t.border}`, overflow: 'hidden', boxShadow: isDarkMode ? 'none' : '0 10px 40px rgba(0,0,0,0.03)' }}>
            <div style={{ padding: 'clamp(20px, 4vw, 32px)', display: 'flex', flexDirection: 'column', gap: 24 }}>
              {cart.map((item, idx) => (
                <div key={item.id} className="cart-item-row" style={{ display: 'flex', gap: 'clamp(16px, 3vw, 32px)', alignItems: 'flex-start', paddingBottom: idx === cart.length - 1 ? 0 : 32, borderBottom: idx === cart.length - 1 ? 'none' : `1px solid ${t.border}` }}>
                  <img loading="lazy" src={item.imageUrl} alt={item.name} className="cart-item-image" style={{ width: 'clamp(80px, 25vw, 120px)', height: 'clamp(80px, 25vw, 120px)', borderRadius: 16, objectFit: 'cover', background: '#1a1a1e' }} />
                  <div className="cart-item-info" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 'clamp(80px, 25vw, 120px)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                      <div>
                        <h4 className="cart-item-title" style={{ fontSize: 'clamp(16px, 3.5vw, 22px)', fontWeight: 700, color: t.text, marginBottom: 8, lineHeight: 1.3 }}>{item.name}</h4>
                        <p style={{ fontSize: 13, color: t.subtext, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>{item.store}</p>
                      </div>
                      <button
                        onClick={() => setCart(prev => prev.filter(c => c.id !== item.id))}
                        style={{ border: 'none', color: t.subtext, cursor: 'pointer', padding: 8, opacity: 0.6, transition: 'all 0.2s', background: isDarkMode ? '#1a1a1e' : '#f3f4f6', borderRadius: '50%' }}
                        onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = isDarkMode ? '#2a2a2e' : '#e5e7eb'; }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = 0.6; e.currentTarget.style.color = t.subtext; e.currentTarget.style.background = isDarkMode ? '#1a1a1e' : '#f3f4f6'; }}
                        title="Remove item"
                      >
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                      <span className="cart-item-price" style={{ fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 800, color: isDarkMode ? '#c8b89a' : '#8b7355' }}>
                        {formatPriceStr(item.priceNum * item.qty, item.price)}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', background: isDarkMode ? '#111113' : '#f3f4f6', borderRadius: 8, padding: '6px 16px', border: `1px solid ${t.border}` }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: t.subtext, marginRight: 12 }}>Qty</span>
                        <span style={{ fontSize: 16, fontWeight: 800, color: t.text }}>{item.qty}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Checkout Footer */}
            <div style={{ padding: 'clamp(20px, 4vw, 24px)', borderTop: `1px solid ${t.border}`, background: isDarkMode ? '#111113' : '#f9fafb', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center', justifyContent: 'space-between', gap: 20 }}>
              <div style={{ textAlign: isMobile ? 'left' : 'left' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: t.subtext, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 4 }}>Subtotal ({cart.reduce((sum, item) => sum + item.qty, 0)} items)</span>
                <span style={{ fontSize: 'clamp(22px, 4vw, 24px)', fontWeight: 800, color: isDarkMode ? '#c8b89a' : '#8b7355', display: 'block', lineHeight: 1.2 }}>
                  {formatPriceStr(cart.reduce((sum, item) => sum + (item.priceNum * item.qty), 0), cart[0]?.price)}
                </span>
                <span style={{ fontSize: 11, color: t.subtext, marginTop: 4, display: 'block' }}>Taxes and shipping calculated at checkout</span>
              </div>
              <button
                onClick={() => {
                  confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, zIndex: 300 });
                  setCart([]);
                  setBuyerActiveNav('explore');
                  showToast('🎉 Order Placed Successfully! AI Concierge has initiated fulfillment.');
                }}
                style={{ background: '#c8b89a', color: '#0f0f10', border: 'none', borderRadius: 14, padding: '14px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'transform 0.2s', width: isMobile ? '100%' : 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} 
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                Proceed to Checkout
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

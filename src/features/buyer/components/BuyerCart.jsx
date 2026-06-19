import React from 'react';
import confetti from 'canvas-confetti';
import { useBuyerContext } from '../BuyerContext';

export const BuyerCart = () => {
  const {
    t, isDarkMode,
    isCartOpen, setIsCartOpen,
    cart, setCart,
    formatPriceStr, showToast
  } = useBuyerContext();

  if (!isCartOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 250, display: 'flex', justifyContent: 'flex-end', backdropFilter: 'blur(4px)' }}>
      <div style={{ width: window.innerWidth < 500 ? '100%' : 450, height: '100vh', background: isDarkMode ? '#161618' : '#fff', borderLeft: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 40px rgba(0,0,0,0.5)', animation: 'slideLeft 0.3s ease' }}>
        {/* Header */}
        <div style={{ padding: '24px 32px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: t.text }}>Shopping Cart</h2>
            <span style={{ background: '#c8b89a', color: '#0f0f10', fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 10 }}>
              {cart.reduce((sum, item) => sum + item.qty, 0)}
            </span>
          </div>
          <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', color: t.subtext, cursor: 'pointer', fontSize: 20 }}>&times;</button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {cart.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: t.subtext, textAlign: 'center' }}>
              <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ marginBottom: 16, opacity: 0.5 }}>
                <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: t.text }}>Your cart is empty</p>
              <p style={{ fontSize: 13, maxWidth: 250 }}>Explore trending products or storefronts to add items to your cart.</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: 16, alignItems: 'center', background: isDarkMode ? '#111113' : '#f9fafb', padding: 16, borderRadius: 16, border: `1px solid ${t.border}` }}>
                <img src={item.imageUrl} alt={item.name} style={{ width: 70, height: 70, borderRadius: 12, objectFit: 'cover', background: '#1a1a1e' }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 4 }}>{item.name}</h4>
                  <p style={{ fontSize: 12, color: t.subtext, marginBottom: 8 }}>{item.store} • Qty: {item.qty}</p>
                  <span style={{ fontSize: 14, fontWeight: 800, color: isDarkMode ? '#c8b89a' : '#8b7355' }}>
                    {formatPriceStr(item.priceNum * item.qty, item.price)}
                  </span>
                </div>
                <button
                  onClick={() => setCart(prev => prev.filter(c => c.id !== item.id))}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 8, opacity: 0.8 }}
                  title="Remove item"
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"></path></svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Checkout Footer */}
        {cart.length > 0 && (
          <div style={{ padding: '24px 32px', borderTop: `1px solid ${t.border}`, background: isDarkMode ? '#111113' : '#f9fafb' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: t.text }}>Subtotal</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: '#c8b89a' }}>
                {formatPriceStr(cart.reduce((sum, item) => sum + (item.priceNum * item.qty), 0), cart[0]?.price)}
              </span>
            </div>
            <button
              onClick={() => {
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, zIndex: 300 });
                setCart([]);
                setIsCartOpen(false);
                showToast('🎉 Order Placed Successfully! AI Concierge has initiated fulfillment.');
              }}
              style={{ width: '100%', background: '#c8b89a', color: '#0f0f10', border: 'none', borderRadius: 14, padding: '16px', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 24px rgba(200,184,154,0.3)' }}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

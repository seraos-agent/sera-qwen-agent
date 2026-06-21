import React from 'react';
import { useBuyerContext } from '../BuyerContext';

export const BuyerHeader = () => {
  const {
    t, isDarkMode, setIsDarkMode,
    appMode, setAppMode,
    chatOpen, setChatOpen,
    buyerActiveNav, setBuyerActiveNav, cart
  } = useBuyerContext();

  return (
    <div className="buyer-header" style={{
      height: 44, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 40px',
      background: isDarkMode ? '#0f0f10' : '#fff',
      borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
      position: 'sticky', top: 0, zIndex: 50
    }}>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: isDarkMode ? '#c8b89a' : '#8b7355', letterSpacing: 1, fontFamily: "'DM Sans', sans-serif" }}>SERA</span>
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Desktop Navigation (Hidden on Mobile) */}
        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 24, marginRight: 16 }}>
          <button 
            onClick={() => { setBuyerActiveNav('explore'); setChatOpen(false); }}
            style={{ background: 'none', border: 'none', color: buyerActiveNav === 'explore' ? (isDarkMode ? '#c8b89a' : '#8b7355') : t.subtext, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'color 0.2s' }}
            onMouseEnter={e => { if (buyerActiveNav !== 'explore') e.currentTarget.style.color = t.text; }}
            onMouseLeave={e => { if (buyerActiveNav !== 'explore') e.currentTarget.style.color = t.subtext; }}
          >
            Explore
          </button>
          <button 
            onClick={() => { setBuyerActiveNav('saved'); setChatOpen(false); }}
            style={{ background: 'none', border: 'none', color: buyerActiveNav === 'saved' ? (isDarkMode ? '#c8b89a' : '#8b7355') : t.subtext, cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'color 0.2s', padding: 4 }}
            onMouseEnter={e => { if (buyerActiveNav !== 'saved') e.currentTarget.style.color = t.text; }}
            onMouseLeave={e => { if (buyerActiveNav !== 'saved') e.currentTarget.style.color = t.subtext; }}
            title="Saved Items"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
          <button 
            onClick={() => { setBuyerActiveNav('cart'); setChatOpen(false); }}
            style={{ background: 'none', border: 'none', color: buyerActiveNav === 'cart' ? (isDarkMode ? '#c8b89a' : '#8b7355') : t.subtext, cursor: 'pointer', display: 'flex', alignItems: 'center', position: 'relative', transition: 'color 0.2s', padding: 4 }}
            onMouseEnter={e => { if (buyerActiveNav !== 'cart') e.currentTarget.style.color = t.text; }}
            onMouseLeave={e => { if (buyerActiveNav !== 'cart') e.currentTarget.style.color = t.subtext; }}
            title="Shopping Cart"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            {cart && cart.length > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -8, background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 800, minWidth: 16, height: 16, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                {cart.reduce((sum, item) => sum + item.qty, 0)}
              </span>
            )}
          </button>
        </div>

        {/* Separator */}
        <div className="desktop-nav" style={{ width: 1, height: 24, background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', marginRight: 4 }} />

        {/* Dark/Light Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          style={{
            background: isDarkMode ? '#1a1a1e' : '#f3f4f6',
            border: `1px solid ${isDarkMode ? '#2a2a2e' : '#e5e7eb'}`,
            borderRadius: 6, width: 32, height: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            color: isDarkMode ? '#fbbf24' : '#6366f1'
          }}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? (
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        {/* Mode Toggle (Buyer / Studio) */}
        <button
          onClick={() => setAppMode(appMode === 'buyer' ? 'seller' : 'buyer')}
          style={{
            marginLeft: 8,
            background: appMode === 'buyer' ? (isDarkMode ? '#2a2a2e' : '#e5e7eb') : (isDarkMode ? '#1a1a1e' : '#f3f4f6'),
            border: `1px solid ${isDarkMode ? '#2a2a2e' : '#e5e7eb'}`,
            color: appMode === 'buyer' ? t.text : t.subtext,
            borderRadius: 20, padding: '4px 14px',
            display: 'flex', alignItems: 'center', gap: 8,
            cursor: 'pointer', fontSize: 11, fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s ease'
          }}
          title={`Current Mode: ${appMode === 'buyer' ? 'Buyer Discovery' : 'Seller Studio'}. Click to switch.`}
        >
          {appMode === 'buyer' ? (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ transition: 'all 0.3s ease' }}>
                <rect x="2" y="6" width="20" height="12" rx="6"></rect>
                <circle cx="8" cy="12" r="4" fill="currentColor"></circle>
              </svg>
              <span style={{ color: t.text, fontWeight: 700 }}>Buyer</span>
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ transition: 'all 0.3s ease' }}>
                <rect x="2" y="6" width="20" height="12" rx="6"></rect>
                <circle cx="16" cy="12" r="4" fill="currentColor"></circle>
              </svg>
              <span style={{ color: t.text, fontWeight: 700 }}>Studio</span>
            </>
          )}
        </button>

        {/* Desktop AI Concierge Button (Moved to far right) */}
        {!chatOpen && (
          <button 
            className="desktop-nav"
            onClick={() => setChatOpen(true)}
            style={{ marginLeft: 16, background: '#c8b89a', color: '#0f0f10', border: 'none', borderRadius: 16, padding: '4px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, transition: 'transform 0.2s' }}
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
  );
};

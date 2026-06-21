import React from 'react';
import { useBuyerContext } from '../BuyerContext';

export const BuyerFooterNav = () => {
  const { t, isDarkMode, chatOpen, setChatOpen, chatWidth, cart, setIsCartOpen, buyerActiveNav, setBuyerActiveNav, setSelectedStorefront } = useBuyerContext();

  const handleNavClick = (nav) => {
    setBuyerActiveNav(nav);
    setChatOpen(false);
    if (setSelectedStorefront) setSelectedStorefront(null);
  };

  return (
    <div className="buyer-bottom-nav" style={{
      position: 'fixed',
      bottom: 32,
      left: chatOpen ? `calc((100vw - ${chatWidth}px) / 2)` : '50%',
      transform: 'translateX(-50%)',
      background: isDarkMode ? 'rgba(22, 22, 24, 0.85)' : 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(16px)',
      border: `1px solid ${t.border}`,
      borderRadius: 30,
      padding: '10px 32px',
      display: 'flex',
      alignItems: 'center',
      gap: 36,
      boxShadow: isDarkMode ? '0 12px 40px rgba(0,0,0,0.6)' : '0 12px 40px rgba(0,0,0,0.12)',
      zIndex: 190,
      transition: 'left 0.3s ease, background 0.3s ease'
    }}>
      {/* Explore */}
      <button 
        onClick={() => handleNavClick('explore')}
        style={{ background: 'none', border: 'none', color: buyerActiveNav === 'explore' ? '#c8b89a' : t.subtext, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', transition: 'color 0.2s' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="12" cy="12" r="10"></circle>
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
        </svg>
        <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>Explore</span>
      </button>

      {/* Saved */}
      <button 
        onClick={() => handleNavClick('saved')}
        style={{ background: 'none', border: 'none', color: buyerActiveNav === 'saved' ? '#c8b89a' : t.subtext, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', transition: 'color 0.2s' }}
        onMouseEnter={e => { if (buyerActiveNav !== 'saved') e.currentTarget.style.color = t.text; }}
        onMouseLeave={e => { if (buyerActiveNav !== 'saved') e.currentTarget.style.color = t.subtext; }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
        </svg>
        <span style={{ fontSize: 10, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>Saved</span>
      </button>

      {/* SERA Chat Toggle (Middle Action) */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, transform: 'translateY(-4px)' }}>
        <button 
          onClick={() => setChatOpen(!chatOpen)}
          style={{
            background: '#c8b89a', border: 'none', color: '#0f0f10',
            width: 44, height: 44, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {chatOpen ? (
               <>
                 <line x1="18" y1="6" x2="6" y2="18"></line>
                 <line x1="6" y1="6" x2="18" y2="18"></line>
               </>
            ) : (
               <>
                 <line x1="12" y1="5" x2="12" y2="19"></line>
                 <line x1="5" y1="12" x2="19" y2="12"></line>
               </>
            )}
          </svg>
        </button>
      </div>

      {/* Cart */}
      <button
        onClick={() => handleNavClick('cart')}
        style={{ background: 'none', border: 'none', color: buyerActiveNav === 'cart' ? '#c8b89a' : t.subtext, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', position: 'relative', transition: 'color 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.color = t.text}
        onMouseLeave={e => e.currentTarget.style.color = t.subtext}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        {cart.length > 0 && (
          <span style={{ position: 'absolute', top: -4, right: -6, background: '#c8b89a', color: '#0f0f10', fontSize: 9, fontWeight: 800, width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {cart.reduce((sum, item) => sum + item.qty, 0)}
          </span>
        )}
        <span style={{ fontSize: 10, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>Cart</span>
      </button>

      {/* Profile */}
      <button 
        onClick={() => handleNavClick('profile')}
        style={{ background: 'none', border: 'none', color: buyerActiveNav === 'profile' ? '#c8b89a' : t.subtext, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', transition: 'color 0.2s' }}
        onMouseEnter={e => { if (buyerActiveNav !== 'profile') e.currentTarget.style.color = t.text; }}
        onMouseLeave={e => { if (buyerActiveNav !== 'profile') e.currentTarget.style.color = t.subtext; }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        <span style={{ fontSize: 10, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>Profile</span>
      </button>
    </div>
  );
};

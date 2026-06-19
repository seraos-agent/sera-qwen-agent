import React from 'react';
import { useBuyerContext } from '../BuyerContext';

export const BuyerHeader = () => {
  const {
    t, isDarkMode, setIsDarkMode,
    appMode, setAppMode,
    chatOpen, setChatOpen
  } = useBuyerContext();

  return (
    <div style={{
      height: 60, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 48px',
      background: isDarkMode ? '#0f0f10' : '#fff',
      borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
      position: 'sticky', top: 0, zIndex: 50
    }}>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: isDarkMode ? '#c8b89a' : '#8b7355', letterSpacing: 0.5, fontFamily: "'DM Sans', sans-serif" }}>SERA</span>
        <span style={{ fontSize: 11, color: isDarkMode ? '#6b6b75' : '#9ca3af', background: isDarkMode ? '#1a1a1e' : '#f3f4f6', padding: '2px 8px', borderRadius: 4, marginLeft: 8, fontFamily: "'DM Sans', sans-serif" }}>Discovery AI</span>
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Dark/Light Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          style={{
            marginLeft: 12,
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
            marginLeft: 12,
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

        {/* Open SERA Chat button */}
        {!chatOpen && (
          <button
            onClick={() => setChatOpen(true)}
            style={{
              marginLeft: 8, background: isDarkMode ? '#1a1a1e' : '#f3f4f6',
              border: `1px solid ${isDarkMode ? '#2a2a2e' : '#e5e7eb'}`,
              borderRadius: 6, padding: '4px 10px', cursor: 'pointer',
              color: isDarkMode ? '#c8b89a' : '#82693f',
              fontSize: 11, fontFamily: "'DM Sans', sans-serif",
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 0.2s', fontWeight: 600
            }}
          >
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            Open SERA
          </button>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect, Component } from 'react';
import { StoreProvider, useStore } from './store/storeContext';
import { DynamicRenderer } from './engine/DynamicRenderer';
import { BuyerApp } from './features/buyer/BuyerApp';
import { SellerApp } from './features/seller/SellerApp';
import { storeThemeDark, storeThemeLight } from './utils/constants';

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, background: '#0f0f10', color: '#e8e6e1', fontFamily: 'monospace', minHeight: '100vh' }}>
          <h2 style={{ color: '#f87171', marginBottom: 16 }}>⚠️ React Error</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13, color: '#fbbf24' }}>{this.state.error.message}</pre>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 11, color: '#6b7280', marginTop: 12 }}>{this.state.error.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const SeraLayoutInner = () => {
  const { state: { appMode, toastMessage }, setAppMode } = useStore();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const t = isDarkMode ? storeThemeDark : storeThemeLight;

  useEffect(() => {
    document.body.style.backgroundColor = t.bg;
    document.body.style.color = t.text;
  }, [isDarkMode, t]);

  return (
    <div className={isDarkMode ? "" : "light-mode"} style={{
      display: "flex", height: "100vh", width: "100%", background: t.bg,
      fontFamily: "'DM Sans', sans-serif", color: t.text, overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
        :root { color-scheme: ${isDarkMode ? "dark" : "light"}; }
        * { box-sizing: border-box; margin: 0; padding: 0; scrollbar-width: thin; scrollbar-color: ${isDarkMode ? "#2a2a2e transparent" : "#e5e7eb #f9fafb"}; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: ${isDarkMode ? "transparent" : "#f9fafb"}; }
        ::-webkit-scrollbar-thumb { background: ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}; border-radius: 4px; }
      `}</style>

      {appMode === "buyer" ? (
        <BuyerApp isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} t={t} DynamicRenderer={DynamicRenderer} />
      ) : (
        <SellerApp isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} t={t} DynamicRenderer={DynamicRenderer} />
      )}

      {/* Global Toast */}
      {toastMessage && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, padding: "16px 24px",
          background: t.panel, border: `1px solid ${t.border}`, borderRadius: 12,
          color: t.text, zIndex: 9999, boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          display: "flex", alignItems: "center", gap: 12, animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
        }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} />
          <span style={{ fontSize: 14, fontWeight: 500 }}>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <ErrorBoundary>
          <SeraLayoutInner />
        </ErrorBoundary>
      </StoreProvider>
    </ErrorBoundary>
  );
}

import React from 'react';
import { useStore } from '../../../store/storeContext';
import { useSeller } from '../SellerContext';
import { NAV_ICONS } from '../../../utils/constants';

export const SellerSidebar = () => {
  const { state } = useStore();
  const { appMode } = state;
  const { isDarkMode, t, activeNav, setActiveNav } = useSeller();

  if (appMode !== "seller") return null;

  return (
    <div style={{
      width: 56,
      height: "100vh",
      background: isDarkMode ? "#0f0f10" : "#ffffff",
      borderRight: `1px solid ${t.border}`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "14px 0",
      gap: 4,
      flexShrink: 0,
      position: "relative",
      zIndex: 10,
      boxShadow: isDarkMode ? "none" : "2px 0 10px rgba(0,0,0,0.02)"
    }}>
      {/* Official Logo */}
      <div style={{ marginBottom: 20, padding: "0 10px" }}>
        <img src="/sera-logo.png" alt="SERA" style={{ width: 32, height: 32, borderRadius: 8 }} />
      </div>
      {NAV_ICONS.filter(nav => nav.id !== 'settings').map(({ id, icon }) => (
        <button
          key={id}
          className={`nav-btn${activeNav === id ? " active" : ""}`}
          onClick={() => setActiveNav(id)}
          title={id.charAt(0).toUpperCase() + id.slice(1)}
        >
          {icon}
        </button>
      ))}
      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
        {/* Bottom Settings Icon */}
        <button
          className={`nav-btn${activeNav === 'settings' ? " active" : ""}`}
          onClick={() => setActiveNav('settings')}
          title="Settings"
        >
          {NAV_ICONS.find(n => n.id === 'settings')?.icon}
        </button>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useSeller } from '../SellerContext';

const CONNECTORS_REGISTRY = [
  {
    id: "slack",
    name: "Slack",
    category: "Communication",
    icon: <img src="/slack%20logo.jpeg" alt="Slack" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />,
    type: "oauth_direct",
    fields: []
  },
  {
    id: "telegram",
    name: "Telegram",
    category: "Communication",
    icon: <img src="/telegram%20logo.jpeg" alt="Telegram" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />,
    type: "oauth_direct",
    fields: []
  },

  {
    id: "native",
    name: "Native Store",
    category: "Commerce",
    icon: <img src="/sera-logo.png" alt="SERA" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />,
    type: "native",
    fields: []
  },
  {
    id: "shopify",
    name: "Shopify",
    category: "Commerce",
    icon: <img src="/shopify%20logo.jpeg" alt="Shopify" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />,
    type: "oauth_direct",
    fields: []
  },
  {
    id: "woocommerce",
    name: "WooCommerce",
    category: "Commerce",
    icon: <img src="/woo%20logo.jpeg" alt="WooCommerce" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />,
    type: "custom",
    fields: [
      { name: "storeUrl", label: "Store URL", type: "text" },
      { name: "consumerKey", label: "Consumer Key", type: "text" },
      { name: "consumerSecret", label: "Consumer Secret", type: "password" }
    ]
  },

  {
    id: "instagram",
    name: "Instagram",
    category: "Marketing",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="url(#ig-grad)"><defs><linearGradient id="ig-grad" x1="2" y1="22" x2="22" y2="2"><stop offset="0%" stopColor="#feda75" /><stop offset="25%" stopColor="#fa7e1e" /><stop offset="50%" stopColor="#d62976" /><stop offset="75%" stopColor="#962fbf" /><stop offset="100%" stopColor="#4f5bd5" /></linearGradient></defs><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm3.98-10.169a1.44 1.44 0 100-2.88 1.44 1.44 0 000 2.88z"/></svg>,
    iconBgWhite: true,
    type: "oauth_direct",
    fields: []
  },
  {
    id: "tiktok",
    name: "TikTok",
    category: "Marketing",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="#000000" xmlns="http://www.w3.org/2000/svg"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.95v7.4c-.01 1.96-.81 3.82-2.22 5.15-1.39 1.3-3.24 2.05-5.22 2.08-1.95.03-3.83-.69-5.26-1.99-1.44-1.3-2.31-3.15-2.43-5.11-.11-1.93.59-3.84 1.94-5.23 1.34-1.39 3.19-2.19 5.14-2.24v4.09c-.64.03-1.26.24-1.78.61-.53.37-.93.89-1.14 1.49-.22.59-.25 1.25-.09 1.86.16.61.53 1.15 1.03 1.5.51.35 1.14.53 1.76.5.63-.02 1.23-.25 1.71-.64.48-.38.82-.9 1-1.49.17-.58.19-1.21.05-1.8-.13-.58-.45-1.1-.91-1.47V.02z" /></svg>,
    iconBgWhite: true,
    type: "oauth_direct",
    fields: []
  },
  {
    id: "x",
    name: "X",
    category: "Marketing",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="#000000"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>,
    iconBgWhite: true,
    type: "oauth_direct",
    fields: []
  },
  {
    id: "facebook",
    name: "Facebook",
    category: "Marketing",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
    iconBgWhite: true,
    type: "oauth_direct",
    fields: []
  },
  {
    id: "youtube",
    name: "YouTube",
    category: "Marketing",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
    iconBgWhite: true,
    type: "oauth_direct",
    fields: []
  }
];

const ConnectorCard = ({ connector, connectionState, onAction, isDarkMode, t }) => {
  const isConnected = connectionState?.status === "connected";
  const isActionReq = connectionState?.status === "action_required";

  let statusIcon = null;
  let statusText = "Available";
  let buttonText = "+ Add";
  
  if (isConnected) {
    statusIcon = "✓";
    statusText = "Connected";
    buttonText = "Manage";
  } else if (isActionReq) {
    statusIcon = "⚠";
    statusText = "Action Required";
    buttonText = "Review";
  }

  // Handle generic SVGs that need backgrounds
  let iconRender = connector.icon;
  if (connector.iconBgTheme || connector.iconBgWhite) {
    const bg = connector.iconBgWhite ? "#ffffff" : (isDarkMode ? "#16161a" : "#f8f9fa");
    iconRender = (
      <div style={{ width: 44, height: 44, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}`, color: t.text }}>
        {connector.icon}
      </div>
    );
  } else {
    iconRender = (
      <div style={{ width: 44, height: 44, borderRadius: "50%", border: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}`, overflow: "hidden" }}>
        {connector.icon}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", background: isDarkMode ? "#0f0f10" : "#ffffff", borderRadius: 10, border: `1px solid ${t.border}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {iconRender}
        <div>
          <p style={{ fontSize: 15, color: t.text, fontWeight: 600 }}>{connector.name}</p>
          <p style={{ fontSize: 12, color: t.subtext, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
            {statusIcon && <span>{statusIcon}</span>} {statusText}
          </p>
        </div>
      </div>
      <button 
        onClick={() => onAction(connector)}
        style={{ 
          background: isDarkMode ? "#2a2a2e" : "#f3f4f6", 
          border: "none", 
          color: t.text, 
          padding: "6px 16px", 
          borderRadius: 6, 
          fontSize: 12, 
          cursor: "pointer", 
          fontWeight: 500 
        }}
      >
        {buttonText}
      </button>
    </div>
  );
};

const ConnectConnectorModal = ({ connector, connectionState, onClose, onConnect, onDisconnect, isDarkMode, t }) => {
  const isConnected = connectionState?.status === "connected";
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [formData, setFormData] = useState(() => {
    const init = {};
    connector.fields?.forEach(f => {
      init[f.name] = f.defaultValue || "";
    });
    return init;
  });
  const [accessMethod, setAccessMethod] = useState(connector.type || "oauth");

  if (!connector) return null;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: isDarkMode ? "#161618" : "#ffffff", width: 400, borderRadius: 12, padding: 24, border: `1px solid ${t.border}` }}>
        {showDisconnectConfirm ? (
          <div style={{ textAlign: "center", padding: "16px 0 8px" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: isDarkMode ? "rgba(239, 68, 68, 0.1)" : "#fee2e2", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <h4 style={{ fontSize: 18, color: t.text, fontWeight: 600, marginBottom: 8 }}>Disconnect {connector.name}?</h4>
            <p style={{ fontSize: 14, color: t.subtext, marginBottom: 24, lineHeight: 1.5 }}>
              This will pause your integrations. You can reconnect at any time.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button 
                onClick={() => setShowDisconnectConfirm(false)}
                style={{ flex: 1, background: "transparent", border: `1px solid ${t.border}`, color: t.text, padding: "10px 16px", borderRadius: 8, fontSize: 14, cursor: "pointer", fontWeight: 500 }}
              >
                Cancel
              </button>
              <button 
                onClick={() => onDisconnect(connector.id)}
                style={{ flex: 1, background: "#ef4444", border: "none", color: "#ffffff", padding: "10px 16px", borderRadius: 8, fontSize: 14, cursor: "pointer", fontWeight: 500 }}
              >
                Yes, Disconnect
              </button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isConnected ? 24 : 8, textAlign: !isConnected && connector.type === "oauth_direct" ? "center" : "left" }}>
              <h3 style={{ fontSize: 20, fontWeight: 600, color: t.text, flex: 1 }}>{isConnected ? connector.name : `Connect ${connector.name}`}</h3>
              {isConnected && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, background: isDarkMode ? "rgba(16, 185, 129, 0.1)" : "#d1fae5", padding: "4px 10px", borderRadius: 12 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }}></div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#10b981" }}>Connected</span>
                </div>
              )}
            </div>
            {!isConnected && <p style={{ fontSize: 14, color: t.subtext, marginBottom: 24, textAlign: !isConnected && connector.type === "oauth_direct" ? "center" : "left" }}>Connect your {connector.name} account to SERA.</p>}

            {isConnected ? (
              <div style={{ marginBottom: 32 }}>
                <div style={{ background: isDarkMode ? "#0f0f10" : "#f8f9fa", borderRadius: 8, padding: 20, border: `1px solid ${t.border}` }}>
                  {connectionState.capabilities && (
                    <div style={{ paddingBottom: connectionState.syncStatus ? 16 : 0, marginBottom: connectionState.syncStatus ? 16 : 0, borderBottom: connectionState.syncStatus ? `1px solid ${t.border}` : "none" }}>
                      <p style={{ fontSize: 13, color: t.subtext, marginBottom: 12 }}>Capabilities</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {connectionState.capabilities.map((cap, idx) => (
                          <div key={idx} style={{ display: "flex", alignItems: "center", gap: 6, background: isDarkMode ? "#16161a" : "#ffffff", border: `1px solid ${t.border}`, padding: "6px 12px", borderRadius: 6 }}>
                            <span style={{ color: "#10b981", fontSize: 12 }}>✓</span>
                            <span style={{ fontSize: 13, color: t.text, fontWeight: 500 }}>{cap}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {connectionState.syncStatus && (
                    <div>
                      <p style={{ fontSize: 13, color: t.subtext, marginBottom: 12 }}>Real-time Sync</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, background: isDarkMode ? "#16161a" : "#ffffff", border: `1px solid ${t.border}`, padding: "6px 12px", borderRadius: 6, width: "fit-content" }}>
                        <span style={{ color: "#10b981", fontSize: 12 }}>✓</span>
                        <span style={{ fontSize: 13, color: t.text, fontWeight: 500 }}>{connectionState.syncStatus}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                {connector.fields?.map(field => (
                  <div key={field.name} style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontSize: 13, color: t.text, marginBottom: 8, fontWeight: 500 }}>{field.label}</label>
                    <input 
                      type={field.type || "text"} 
                      value={formData[field.name]}
                      onChange={e => setFormData({...formData, [field.name]: e.target.value})}
                      style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", background: isDarkMode ? "#0f0f10" : "#f3f4f6", border: `1px solid ${t.border}`, borderRadius: 8, color: t.text, outline: "none" }}
                    />
                  </div>
                ))}

                {(connector.type === "oauth" || connector.type === "api") && (
                  <div style={{ marginBottom: 32 }}>
                    <label style={{ display: "block", fontSize: 13, color: t.text, marginBottom: 8, fontWeight: 500 }}>Access Method</label>
                    <div style={{ display: "flex", gap: 16 }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 8, color: t.text, fontSize: 14, cursor: "pointer" }}>
                        <input type="radio" checked={accessMethod === "oauth"} onChange={() => setAccessMethod("oauth")} style={{ accentColor: t.text }} />
                        OAuth
                      </label>
                      <label style={{ display: "flex", alignItems: "center", gap: 8, color: t.text, fontSize: 14, cursor: "pointer" }}>
                        <input type="radio" checked={accessMethod === "api"} onChange={() => setAccessMethod("api")} style={{ accentColor: t.text }} />
                        API Key
                      </label>
                    </div>
                  </div>
                )}
              </>
            )}

            <div style={{ display: "flex", justifyContent: (!isConnected && connector.type === "oauth_direct") ? "center" : "flex-end", gap: 12 }}>
              <button 
                onClick={onClose}
                style={{ background: "transparent", border: `1px solid ${t.border}`, color: t.text, padding: "8px 16px", borderRadius: 6, fontSize: 14, cursor: "pointer", fontWeight: 500 }}
              >
                {isConnected ? "Close" : "Cancel"}
              </button>
              <button 
                onClick={() => isConnected ? setShowDisconnectConfirm(true) : onConnect(connector.id, formData)}
                style={{ background: isConnected ? "transparent" : (isDarkMode ? "#ffffff" : "#000000"), border: isConnected ? "1px solid #ef4444" : "none", color: isConnected ? "#ef4444" : (isDarkMode ? "#000000" : "#ffffff"), padding: "8px 16px", borderRadius: 6, fontSize: 14, cursor: "pointer", fontWeight: 500 }}
              >
                {isConnected ? "Disconnect" : "Connect"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export const SellerConnectorsPanel = () => {
  const { activeNav, isDarkMode, t } = useSeller();
  
  // Track connections state globally
  const [connections, setConnections] = useState({
    slack: { 
      status: "connected",
      capabilities: ["Messaging", "Notifications"],
      syncStatus: "Enabled"
    },
    native: { 
      status: "connected",
      capabilities: ["Products", "Orders", "Inventory", "Customers"],
      syncStatus: "Enabled"
    },
    shopify: { status: "action_required" }
  });

  const [activeModalId, setActiveModalId] = useState(null);

  if (activeNav !== "channels") return null;

  const handleAction = (connector) => {
    setActiveModalId(connector.id);
  };

  const handleConnect = (connectorId, formData) => {
    // Mock connecting
    setConnections(prev => ({
      ...prev,
      [connectorId]: { 
        status: "connected",
        capabilities: connectorId === "shopify" || connectorId === "woocommerce" ? ["Products", "Orders", "Inventory", "Customers"] : ["Messaging", "Notifications"],
        syncStatus: "Enabled"
      }
    }));
    setActiveModalId(null);
  };

  const handleDisconnect = (connectorId) => {
    setConnections(prev => {
      const next = { ...prev };
      delete next[connectorId];
      return next;
    });
    setActiveModalId(null);
  };

  const categories = ["Communication", "Commerce", "Marketing"];

  return (
    <div style={{ padding: "40px 28px", paddingBottom: "100px" }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: t.text }}>Connections</h2>
      </div>
      
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {categories.map(category => {
          const categoryConnectors = CONNECTORS_REGISTRY.filter(c => c.category === category);
          if (categoryConnectors.length === 0) return null;
          
          return (
            <div key={category} style={{ background: isDarkMode ? "#161618" : "#ffffff", border: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}`, borderRadius: 12, padding: "24px" }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: t.text, marginBottom: 20 }}>{category}</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
                {categoryConnectors.map(connector => (
                  <ConnectorCard 
                    key={connector.id}
                    connector={connector}
                    connectionState={connections[connector.id]}
                    onAction={handleAction}
                    isDarkMode={isDarkMode}
                    t={t}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {activeModalId && (
        <ConnectConnectorModal 
          connector={CONNECTORS_REGISTRY.find(c => c.id === activeModalId)}
          connectionState={connections[activeModalId]}
          onClose={() => setActiveModalId(null)}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          isDarkMode={isDarkMode}
          t={t}
        />
      )}
    </div>
  );
};

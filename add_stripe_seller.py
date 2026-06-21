import re

with open("src/features/buyer/components/BuyerProfile.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add setAppMode to useBuyerContext destructure
find_context = "  const { t, isDarkMode } = useBuyerContext();"
replace_context = "  const { t, isDarkMode, setAppMode } = useBuyerContext();"
content = content.replace(find_context, replace_context)

# 2. Add Stripe button to Smart Payments
find_payments = """            <button style={{ width: '100%', padding: '16px', border: `1px solid ${t.border}`, borderRadius: 16, background: isDarkMode ? '#1a1a1e' : '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></svg>
              Apple Pay Linked
            </button>"""
replace_payments = """            <button style={{ width: '100%', padding: '16px', border: `1px solid ${t.border}`, borderRadius: 16, background: isDarkMode ? '#1a1a1e' : '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></svg>
              Apple Pay Linked
            </button>
            <button style={{ width: '100%', padding: '16px', border: `1px solid ${t.border}`, borderRadius: 16, background: '#635bff', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.9'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.1 14.5c-3.2 0-5.4-1.6-5.4-4.5 0-2.6 1.9-4.3 4.9-4.3 1.8 0 3.3.6 4.3 1.5l-1.1 2.3c-.8-.6-1.7-.9-2.7-.9-1.3 0-2.2.8-2.2 2 0 1.2 1 1.8 2.6 2.3 2.5.7 4.2 2 4.2 4.7 0 3-2.1 4.7-5.3 4.7-2.1 0-3.9-.7-5.1-1.8l1.3-2.4c1.1.9 2.5 1.5 3.9 1.5 1.4 0 2.4-.8 2.4-2.1 0-1.3-1-1.9-2.7-2.4-2.4-.7-4.1-1.9-4.1-4.6 0-3.1 2.4-5.2 5.8-5.2 1.8 0 3.4.6 4.6 1.5L18.8 9c-1-.7-2.3-1.2-3.7-1.2z"/></svg>
              Link Stripe Account
            </button>"""
content = content.replace(find_payments, replace_payments)

# 3. Add Seller Studio Access card
# I will append it before the final closing div of .bento-grid
find_end_bento = """        </div>

      </div>
    </div>
  );
};"""

seller_card = """        </div>

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
          <div>
            <button 
              onClick={() => {
                if (setAppMode) setAppMode('seller');
                else window.dispatchEvent(new CustomEvent('sera:toggleAppMode'));
              }}
              style={{ background: isDarkMode ? '#c8b89a' : '#8b7355', color: isDarkMode ? '#0f0f10' : '#fff', border: 'none', borderRadius: 100, padding: '14px 32px', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'transform 0.2s', display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              Switch to Seller Mode &rarr;
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};"""

content = content.replace(find_end_bento, seller_card)

with open("src/features/buyer/components/BuyerProfile.jsx", "w", encoding="utf-8") as f:
    f.write(content)

print("BuyerProfile updated with Stripe and Seller Mode card")

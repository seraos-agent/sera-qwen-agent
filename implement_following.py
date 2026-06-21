import re

# 1. Update BuyerHeader.jsx
with open("src/features/buyer/components/BuyerHeader.jsx", "r", encoding="utf-8") as f:
    header_content = f.read()

header_content = header_content.replace("'saved'", "'following'")
header_content = header_content.replace(">Saved<", ">Following<")

# Replace bookmark icon with heart icon
old_icon = """<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>"""
new_icon = """<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>"""
header_content = header_content.replace(old_icon, new_icon)

with open("src/features/buyer/components/BuyerHeader.jsx", "w", encoding="utf-8") as f:
    f.write(header_content)


# 2. Update BuyerApp.jsx
with open("src/features/buyer/BuyerApp.jsx", "r", encoding="utf-8") as f:
    app_content = f.read()

# Replace the 'saved' block with 'following' block
old_block = """          <div style={{ display: buyerActiveNav === 'saved' ? 'block' : 'none', padding: '60px 48px', color: t.text }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, marginBottom: 12 }}>Saved Items</h2>
            <p style={{ color: t.subtext }}>You haven't saved any products or stores yet.</p>
          </div>"""

new_block = """          <div style={{ display: buyerActiveNav === 'following' ? 'block' : 'none', padding: '60px 48px', color: t.text }}>
            <div style={{ marginBottom: 40 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, marginBottom: 12 }}>Following</h2>
              <p style={{ color: t.subtext }}>Stores you love, all in one place.</p>
            </div>
            {(() => {
              const allStores = [...(userStores || [])];
              const followedList = allStores.filter(store => followedStores?.has(store.id || store.store_id || store._id));
              
              if (followedList.length === 0) {
                return <div style={{ padding: '40px 0', textAlign: 'center', color: t.subtext, background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', borderRadius: 16 }}>You are not following any stores yet.</div>;
              }
              
              return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
                  {followedList.map(store => (
                    <div
                      key={store.id}
                      onClick={() => setSelectedStorefront(store)}
                      style={{ position: 'relative', aspectRatio: '3/4', borderRadius: 24, overflow: 'hidden', cursor: 'pointer', boxShadow: isDarkMode ? 'none' : '0 12px 32px rgba(0,0,0,0.08)', border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`, transition: 'transform 0.3s ease' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      {store.cover ? (
                        <img src={store.cover} alt={store.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} onError={e => e.currentTarget.style.display = 'none'} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: isDarkMode ? '#161618' : '#f9fafb', position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>🛍️</div>
                      )}
                      {/* Gradient Overlay */}
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 40%, transparent 100%)', zIndex: 1 }} />
                      {/* Content */}
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, zIndex: 2, display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: 10, fontWeight: 800, color: '#c8b89a', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>{store.category}</span>
                        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 8, lineHeight: 1.1 }}>{store.name}</h3>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, lineHeight: 1.5, marginBottom: 20, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{store.desc}</p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>👥 {store.followers}</span>
                          <button
                            onClick={e => { e.stopPropagation(); toggleFollowStore(store.id || store.store_id || store._id); }}
                            style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', borderRadius: 100, padding: '6px 14px', fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s ease' }}
                          >
                            Following
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>"""

app_content = app_content.replace(old_block, new_block)

with open("src/features/buyer/BuyerApp.jsx", "w", encoding="utf-8") as f:
    f.write(app_content)

print("Following UI fully implemented")

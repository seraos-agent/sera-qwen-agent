import re

with open("src/features/seller/components/panels/ProductsTab.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Remove the old InventoryMobile.css import
content = content.replace("import './InventoryMobile.css';\n", "")

# 2. Extract the table block
start_table = content.find("<table className=\"inventory-table\"")
end_table = content.find("</table>") + len("</table>")

new_list_code = """          <div className="inventory-list-container">
            {/* Header Row (Desktop only) */}
            <div className="inventory-header-row" style={{ display: "flex", padding: "16px 20px", borderBottom: `1px solid ${t.border}`, color: t.subtext, fontSize: 13, fontWeight: 500, background: isDarkMode ? "#0f0f10" : "#ffffff", borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
              <div style={{ width: 40, textAlign: "center" }}>
                <input
                  type="checkbox"
                  checked={selectedProducts.length === products.length && products.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedProducts(products.map(p => p.name));
                    else setSelectedProducts([]);
                  }}
                  style={{ accentColor: "#c8b89a", cursor: "pointer", width: 16, height: 16 }}
                />
              </div>
              <div style={{ flex: "2 1 0" }}>Product</div>
              <div style={{ flex: "1 1 0" }}>Price</div>
              <div style={{ flex: "1 1 0" }}>Stock</div>
              <div style={{ flex: "1 1 0" }}>Status</div>
              <div style={{ width: 60, textAlign: "right" }}>Actions</div>
            </div>

            {/* Product Cards */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              {products.length === 0 ? (
                <div style={{ padding: "60px 20px", textAlign: "center", color: t.subtext }}>
                  <p style={{ fontWeight: 600, color: t.text, fontSize: 16 }}>No Products Yet</p>
                </div>
              ) : (
                products.map((p, i) => (
                  <div key={i} className="inventory-card" style={{ display: "flex", padding: "24px 20px", borderBottom: `1px solid ${t.border}`, background: selectedProducts.includes(p.name) ? (isDarkMode ? "rgba(200, 184, 154, 0.05)" : "rgba(200, 184, 154, 0.1)") : "transparent", alignItems: "center", gap: 16, transition: "background 0.2s" }}>
                    
                    {/* Checkbox */}
                    <div className="inv-checkbox" style={{ width: 24, flexShrink: 0, textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(p.name)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedProducts(prev => [...prev, p.name]);
                          else setSelectedProducts(prev => prev.filter(name => name !== p.name));
                        }}
                        style={{ accentColor: "#c8b89a", cursor: "pointer", width: 18, height: 18 }}
                      />
                    </div>
                    
                    {/* Image & Main Info */}
                    <div className="inv-main-info" style={{ display: "flex", alignItems: "flex-start", gap: 20, flex: "2 1 0", minWidth: 200 }}>
                      <div
                        onClick={() => {
                          setUploadingForProduct(p.name);
                          productImageInputRef.current?.click();
                        }}
                        style={{
                          width: 84, height: 84, borderRadius: 12, flexShrink: 0,
                          background: `hsl(${35 + (i % 8) * 8}, ${15 + (i % 8) * 3}%, ${12 + (i % 8) * 1}%)`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 24, position: "relative", overflow: "hidden",
                          cursor: "pointer", border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`
                        }}
                        title="Click to change photo"
                      >
                        {p.imageUrl ? <img src={p.imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "📷"}
                        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s" }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                          <svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 8, paddingTop: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <p style={{ color: t.text, fontWeight: 700, fontSize: 16, margin: 0, fontFamily: "'Playfair Display', serif" }}>{p.name}</p>
                          {p.promo && (
                            <span style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 100, letterSpacing: 0.5, textTransform: "uppercase" }}>{p.promo}</span>
                          )}
                        </div>
                        <p style={{ color: t.subtext, fontSize: 13, margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.5 }}>{p.desc}</p>
                      </div>
                    </div>

                    {/* Price, Stock, Status */}
                    <div className="inv-meta" style={{ display: "flex", flex: "3 1 0", alignItems: "center", gap: 16 }}>
                      <div className="inv-price" style={{ flex: "1 1 0", color: isDarkMode ? "#c8b89a" : "#8b7355", fontWeight: 700, fontSize: 15 }}>
                        <span className="mobile-label" style={{ display: "none" }}>Price: </span>{p.price}
                      </div>
                      <div className="inv-stock" style={{ flex: "1 1 0", color: t.text, fontSize: 14, fontWeight: 500 }}>
                        <span className="mobile-label" style={{ display: "none" }}>Stock: </span>{45 + (i * 7 % 13)} in stock
                      </div>
                      <div className="inv-status" style={{ flex: "1 1 0" }}>
                        <span style={{ padding: "6px 12px", background: "rgba(74, 222, 128, 0.1)", border: "1px solid rgba(74, 222, 128, 0.2)", color: "#4ade80", borderRadius: 100, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Active</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="inv-actions" style={{ width: 60, flexShrink: 0, textAlign: "right", position: "relative" }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(openActionMenuId === p.name ? null : p.name); }}
                        style={{ background: isDarkMode ? "#1e1e22" : "#f3f4f6", border: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}`, color: t.text, cursor: "pointer", padding: "10px", borderRadius: 8, transition: "background 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.background = isDarkMode ? "#2a2a2e" : "#e5e7eb"}
                        onMouseLeave={e => e.currentTarget.style.background = isDarkMode ? "#1e1e22" : "#f3f4f6"}
                      >
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="19" r="1.5" /></svg>
                      </button>
                      {openActionMenuId === p.name && (
                        <>
                          <div onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(null); }} style={{ position: "fixed", inset: 0, zIndex: 90 }} />
                          <div style={{ position: "absolute", right: "16px", top: "100%", background: isDarkMode ? "#1e1e22" : "#ffffff", border: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}`, borderRadius: 12, padding: "8px", width: 180, boxShadow: "0 10px 40px rgba(0,0,0,0.5)", zIndex: 100, display: "flex", flexDirection: "column", gap: 4, textAlign: "left" }}>
                            <div onClick={() => { setOpenActionMenuId(null); sendMessage(`Regenerate a high-quality cinematic image for product: ${p.name}`); }} style={{ padding: "10px 12px", borderRadius: 8, display: "flex", alignItems: "center", gap: 10, cursor: "pointer", color: "#c8b89a", fontSize: 13, fontWeight: 600, transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = isDarkMode ? "#2a2a2e" : "#f3f4f6"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 2v6h-6"></path><path d="M3 12a.9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg> Regenerate Image
                            </div>
                            <div onClick={() => setOpenActionMenuId(null)} style={{ padding: "10px 12px", borderRadius: 8, display: "flex", alignItems: "center", gap: 10, cursor: "pointer", color: t.text, fontSize: 13, fontWeight: 500, transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = isDarkMode ? "#2a2a2e" : "#f3f4f6"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg> Edit Details
                            </div>
                            <div onClick={() => { setOpenActionMenuId(null); if (window.confirm(`Are you sure you want to delete ${p.name}?`)) { setProducts(prev => prev.filter(prod => prod.name !== p.name)); setStoreSchema(prev => ({ ...prev, products: prev.products ? prev.products.filter(prod => prod.name !== p.name) : [] })); setSelectedProducts(prev => prev.filter(name => name !== p.name)); } }} style={{ padding: "10px 12px", borderRadius: 8, display: "flex", alignItems: "center", gap: 10, cursor: "pointer", color: "#ef4444", fontSize: 13, fontWeight: 500, transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg> Delete Product
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                  </div>
                ))
              )}
            </div>
          </div>"""

# add css import back because we still need InventoryMobile.css to make it responsive on mobile
content = content[:start_table] + new_list_code + content[end_table:]
content = "import './InventoryMobile.css';\n" + content

with open("src/features/seller/components/panels/ProductsTab.jsx", "w", encoding="utf-8") as f:
    f.write(content)

# 3. Rewrite InventoryMobile.css to target the new flex classes
new_css = """/* Premium Mobile Flex Inventory Layout */
@media (max-width: 768px) {
  .inventory-header-row {
    display: none !important;
  }
  .inventory-card {
    flex-direction: column !important;
    align-items: stretch !important;
    position: relative !important;
    padding: 24px !important;
    border-radius: 12px !important;
    margin: 16px !important;
    border: 1px solid var(--card-border) !important;
    background: var(--card-bg) !important;
  }
  .inventory-card .inv-checkbox {
    position: absolute !important;
    top: 24px !important;
    right: 24px !important;
    width: auto !important;
    z-index: 10 !important;
  }
  .inventory-card .inv-main-info {
    flex-direction: column !important;
    gap: 16px !important;
  }
  .inventory-card .inv-main-info > div:first-child {
    width: 100% !important;
    height: 240px !important;
    border-radius: 12px !important;
  }
  .inventory-card .inv-meta {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 12px !important;
    margin-top: 20px !important;
    padding-top: 20px !important;
    border-top: 1px solid rgba(128,128,128,0.1) !important;
  }
  .inventory-card .inv-meta > div {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
  }
  .inventory-card .mobile-label {
    display: block !important;
    font-size: 13px !important;
    color: rgba(128,128,128,0.7) !important;
    font-weight: 500 !important;
  }
  .inventory-card .inv-actions {
    position: absolute !important;
    bottom: 24px !important;
    right: 24px !important;
    width: auto !important;
  }
}
"""

with open("src/features/seller/components/panels/InventoryMobile.css", "w", encoding="utf-8") as f:
    f.write(new_css)

print("Done")

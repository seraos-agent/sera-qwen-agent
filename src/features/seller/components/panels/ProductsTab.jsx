import React from 'react';
import { useSeller } from '../../SellerContext';

export const ProductsTab = () => {
  const { 
    activeNav, isDarkMode, t, products, setProducts, 
    selectedProducts, setSelectedProducts, openActionMenuId, setOpenActionMenuId, themeColor,
    productImageInputRef, handleProductImageUpdate, setUploadingForProduct, sendMessage,
    userStores, setStoreSchema, storeSchema,
    activePromoTab, setActivePromoTab, videoFormat, setVideoFormat, storeData, setStoreData
  } = useSeller();

  return (
    <>
            {/* Products content */}
            <div style={{ display: activeNav === "products" ? "block" : "none", padding: "40px 28px", paddingBottom: "100px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: t.text }}>Inventory</h2>
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ position: "relative" }}>
                    <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: t.subtext }} width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    <input id="product-search" name="product-search" type="text" placeholder="Search products..." style={{ background: isDarkMode ? "#161618" : "#ffffff", border: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}`, padding: "8px 12px 8px 32px", borderRadius: 6, color: t.text, fontSize: 13, outline: "none", width: 200 }} />
                  </div>
                  <button style={{ background: isDarkMode ? "#161618" : "#ffffff", color: t.text, border: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}`, padding: "8px 12px", borderRadius: 6, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
                    Filter
                  </button>
                  <button style={{ background: isDarkMode ? "#1e3a5f" : "#e0f2fe", color: isDarkMode ? "#93c5fd" : "#0284c7", border: "none", padding: "8px 16px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>+ Add Product</button>
                </div>
              </div>
              <div style={{ background: isDarkMode ? "#161618" : "#ffffff", border: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}`, borderRadius: 12, overflow: "hidden" }}>
                <input
                  id="product-image-upload"
                  name="product-image-upload"
                  type="file"
                  accept="image/*"
                  ref={productImageInputRef}
                  onChange={handleProductImageUpdate}
                  style={{ display: "none" }}
                />
                {selectedProducts.length > 0 && (
                  <div style={{ padding: "12px 16px", background: isDarkMode ? "rgba(200, 184, 154, 0.1)" : "rgba(200, 184, 154, 0.2)", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: isDarkMode ? "#c8b89a" : "#9ca3af", fontWeight: 600 }}>{selectedProducts.length} products selected</span>
                    <button
                      onClick={() => {
                        const prompt = `Generate new high-quality images for these products: ${selectedProducts.join(", ")}`;
                        sendMessage(prompt);
                        setSelectedProducts([]);
                      }}
                      style={{ background: "#c8b89a", color: "#0f0f10", border: "none", padding: "6px 12px", borderRadius: 4, cursor: "pointer", fontSize: 11, fontWeight: 700 }}
                    > Generate Images for Selected</button>
                  </div>
                )}
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${t.border}`, color: t.subtext, background: isDarkMode ? "#0f0f10" : "#ffffff" }}>
                      <th style={{ padding: "16px", width: 40, textAlign: "center" }}>
                        <input
                          id="select-all-products"
                          name="select-all-products"
                          type="checkbox"
                          checked={selectedProducts.length === products.length && products.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedProducts(products.map(p => p.name));
                            else setSelectedProducts([]);
                          }}
                          style={{ accentColor: "#c8b89a", cursor: "pointer" }}
                        />
                      </th>
                      <th style={{ padding: "16px", fontWeight: 500 }}>Product</th>
                      <th style={{ padding: "16px", fontWeight: 500 }}>Price</th>
                      <th style={{ padding: "16px", fontWeight: 500 }}>Stock</th>
                      <th style={{ padding: "16px", fontWeight: 500 }}>Status</th>
                      <th style={{ padding: "16px", fontWeight: 500, textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #222", background: selectedProducts.includes(p.name) ? "rgba(255,255,255,0.02)" : "transparent" }}>
                        <td style={{ padding: "16px", textAlign: "center" }}>
                          <input
                            id={`select-product-${i}`}
                            name={`select-product-${i}`}
                            type="checkbox"
                            checked={selectedProducts.includes(p.name)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedProducts(prev => [...prev, p.name]);
                              else setSelectedProducts(prev => prev.filter(name => name !== p.name));
                            }}
                            style={{ accentColor: "#c8b89a", cursor: "pointer" }}
                          />
                        </td>
                        <td style={{ padding: "16px", display: "flex", alignItems: "center", gap: 12 }}>
                          <div
                            onClick={() => {
                              setUploadingForProduct(p.name);
                              productImageInputRef.current?.click();
                            }}
                            style={{
                              width: 40, height: 40, borderRadius: 8,
                              background: `hsl(${35 + (i % 8) * 8}, ${15 + (i % 8) * 3}%, ${12 + (i % 8) * 1}%)`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 18, position: "relative", overflow: "hidden",
                              cursor: "pointer", border: "1px solid #222"
                            }}
                            title="Click to change photo"
                          >
                            {p.imageUrl ? <img src={p.imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "ðŸ§´"}
                            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s" }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                              <svg width="14" height="14" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                            </div>
                          </div>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <p style={{ color: "#e8e6e1", fontWeight: 500 }}>{p.name}</p>
                              {p.promo && (
                                <span style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, letterSpacing: 0.5 }}>{p.promo}</span>
                              )}
                            </div>
                            <p style={{ color: "#666", fontSize: 11, marginTop: 2 }}>{p.desc}</p>
                          </div>
                        </td>
                        <td style={{ padding: "16px", color: isDarkMode ? "#c8b89a" : "#8b7355", fontWeight: 600 }}>{p.price}</td>
                        <td style={{ padding: "16px", color: "#e8e6e1" }}>{45 + (i * 7 % 13)} in stock</td>
                        <td style={{ padding: "16px" }}>
                          <span style={{ padding: "4px 8px", background: "rgba(74, 222, 128, 0.1)", color: "#4ade80", borderRadius: 4, fontSize: 11, fontWeight: 500 }}>Active</span>
                        </td>
                        <td style={{ padding: "16px", textAlign: "right", position: "relative" }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(openActionMenuId === p.name ? null : p.name); }}
                            style={{ background: isDarkMode ? "#1e1e22" : "#f3f4f6", border: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}`, color: t.text, cursor: "pointer", padding: "6px 8px", borderRadius: 8, transition: "background 0.2s" }}
                            onMouseEnter={e => e.currentTarget.style.background = isDarkMode ? "#2a2a2e" : "#e5e7eb"}
                            onMouseLeave={e => e.currentTarget.style.background = isDarkMode ? "#1e1e22" : "#f3f4f6"}
                          >
                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="19" r="1.5" /></svg>
                          </button>
                          {openActionMenuId === p.name && (
                            <>
                              <div onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(null); }} style={{ position: "fixed", inset: 0, zIndex: 90 }} />
                              <div style={{ position: "absolute", right: "16px", top: "60%", background: isDarkMode ? "#1e1e22" : "#ffffff", border: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}`, borderRadius: 12, padding: "8px", width: 170, boxShadow: "0 10px 30px rgba(0,0,0,0.5)", zIndex: 100, display: "flex", flexDirection: "column", gap: 4, textAlign: "left" }}>
                                <div onClick={() => { setOpenActionMenuId(null); sendMessage(`Regenerate a high-quality cinematic image for product: ${p.name}`); }} style={{ padding: "8px 12px", borderRadius: 8, display: "flex", alignItems: "center", gap: 10, cursor: "pointer", color: "#c8b89a", fontSize: 12, fontWeight: 600, transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = isDarkMode ? "#2a2a2e" : "#f3f4f6"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 2v6h-6"></path><path d="M3 12a.9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg> Regenerate Image
                                </div>
                                <div onClick={() => setOpenActionMenuId(null)} style={{ padding: "8px 12px", borderRadius: 8, display: "flex", alignItems: "center", gap: 10, cursor: "pointer", color: t.text, fontSize: 12, fontWeight: 500, transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = isDarkMode ? "#2a2a2e" : "#f3f4f6"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg> Edit Details
                                </div>
                                <div onClick={() => { setOpenActionMenuId(null); if (window.confirm(`Are you sure you want to delete ${p.name}?`)) { setProducts(prev => prev.filter(prod => prod.name !== p.name)); setStoreSchema(prev => ({ ...prev, products: prev.products ? prev.products.filter(prod => prod.name !== p.name) : [] })); setSelectedProducts(prev => prev.filter(name => name !== p.name)); } }} style={{ padding: "8px 12px", borderRadius: 8, display: "flex", alignItems: "center", gap: 10, cursor: "pointer", color: "#ef4444", fontSize: 12, fontWeight: 500, transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg> Delete Product
                                </div>
                              </div>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Pagination */}
                <div style={{ padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `1px solid ${t.border}`, background: isDarkMode ? "#111113" : "#f9fafb" }}>
                  <p style={{ fontSize: 12, color: t.subtext }}>Showing 1-{products.length} of {products.length} products</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ background: isDarkMode ? "#1a1a1e" : "#f3f4f6", border: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}`, color: t.subtext, padding: "6px 10px", borderRadius: 4, cursor: "not-allowed", fontSize: 12 }}>Previous</button>
                    <button style={{ background: "#c8b89a", border: "none", color: "#0f0f10", padding: "6px 12px", borderRadius: 4, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>1</button>
                    <button style={{ background: isDarkMode ? "#1a1a1e" : "#fff", border: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}`, color: t.text, padding: "6px 10px", borderRadius: 4, cursor: "pointer", fontSize: 12 }}>Next</button>
                  </div>
                </div>
              </div>
            </div>
    </>
  );
};
